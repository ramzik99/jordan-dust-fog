import { FIELDS, validateManifest } from './forecast.mjs';
export const DATA_BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-dust-data/global/';
export const NATIVE_GRID = {
  coverage: 'global', latitudes: Array.from({ length: 721 }, (_, i) => -90 + i * .25),
  longitudes: Array.from({ length: 1152 }, (_, i) => -180 + i * .3125),
  sampling: { latitudeDegrees: .25, longitudeDegrees: .3125 },
};
export function abortError() { return new DOMException('Request cancelled', 'AbortError'); }
export function validateDustManifest(manifest, now = Date.now()) {
  validateManifest(manifest, now);
  if (manifest.nativeResolution?.latitudeDegrees !== .25 || manifest.nativeResolution?.longitudeDegrees !== .3125) throw Error('Unexpected native GEOS resolution');
  for (const frame of manifest.frames) {
    const info = frame.native;
    const token = manifest.runTime.slice(0, 10).replaceAll('-', '') + '_' + manifest.runTime.slice(11, 13);
    const stamp = frame.validTime.replaceAll('-', '').replaceAll(':', '');
    if (!info || info.encoding !== 'log16-rgb-pair-v1' || info.width !== 1152 || info.height !== 721 ||
        info.massPath !== 'native/runs/' + token + '/' + stamp + '.mass.png' ||
        info.opticsPath !== 'native/runs/' + token + '/' + stamp + '.optics.png' ||
        FIELDS.some(key => !Number.isFinite(info.scales?.[key]) || info.scales[key] <= 0 || info.scales[key] > 1)) throw Error('Invalid native dust descriptor');
  }
  return manifest;
}
export async function readPngPixels(response, width, height) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > 8 * 1024 * 1024 || bytes.length < 26) throw Error('Invalid native image size');
  const view = new DataView(bytes.buffer);
  const magic = [137, 80, 78, 71, 13, 10, 26, 10];
  if (magic.some((v, i) => bytes[i] !== v) || view.getUint32(16) !== width || view.getUint32(20) !== height || bytes[24] !== 8 || bytes[25] !== 2) throw Error('Unexpected native image format');
  const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw Error('Canvas decoding unavailable');
    ctx.imageSmoothingEnabled = false; ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, width, height).data;
  } finally { bitmap.close(); canvas.width = 1; canvas.height = 1; }
}
export async function decodeNativePixels(mass, optics, scales, count, signal) {
  if (mass.length !== count * 4 || optics.length !== count * 4) throw Error('Invalid native pixel length');
  const result = Object.fromEntries(FIELDS.map(key => [key, new Float32Array(count)]));
  for (let start = 0; start < count; start += 65536) {
    if (signal?.aborted) throw abortError();
    const end = Math.min(count, start + 65536);
    for (let i = start; i < end; i++) {
      const p = i * 4;
      const a = mass[p] * 256 + mass[p + 1], b = mass[p + 2] * 256 + optics[p], c = optics[p + 1] * 256 + optics[p + 2];
      result.dustSurface[i] = a === 65535 ? NaN : Math.expm1(a * scales.dustSurface);
      result.dustFine[i] = b === 65535 ? NaN : Math.expm1(b * scales.dustFine);
      result.dustAod[i] = c === 65535 ? NaN : Math.expm1(c * scales.dustAod);
    }
    if (end < count) await new Promise(resolve => setTimeout(resolve, 0));
  }
  return result;
}
export class NativeForecast {
  constructor({ base = DATA_BASE, fetcher = fetch, decoder = readPngPixels, cacheSize = 2 } = {}) {
    this.base = base; this.fetcher = fetcher; this.decoder = decoder; this.cacheSize = cacheSize;
    this.cache = new Map(); this.pending = new Map(); this.destroyed = false;
  }
  key(manifest, descriptor) { return manifest.runTime + ':' + descriptor.validTime + ':' + FIELDS.map(k => descriptor.native.scales[k]).join(','); }
  async read(manifest, descriptor, signal) {
    const info = descriptor.native;
    const responses = await Promise.all([info.massPath, info.opticsPath].map(async path => {
      const response = await this.fetcher(this.base + path, { signal });
      if (!response.ok) throw Error('Native GEOS data unavailable (HTTP ' + response.status + ')');
      return this.decoder(response, info.width, info.height);
    }));
    const fields = await decodeNativePixels(responses[0], responses[1], info.scales, info.width * info.height, signal);
    return { ...fields, start: descriptor.start, end: descriptor.end, validTime: descriptor.validTime, runTime: manifest.runTime };
  }
  get(manifest, descriptor, signal) {
    if (this.destroyed || signal?.aborted) return Promise.reject(abortError());
    validateDustManifest(manifest);
    const canonical = manifest.frames.find(f => f === descriptor || f.validTime === descriptor?.validTime && f.native.massPath === descriptor.native?.massPath);
    if (!canonical) return Promise.reject(Error('Unknown native period'));
    descriptor = canonical;
    const key = this.key(manifest, descriptor);
    if (this.cache.has(key)) {
      const frame = this.cache.get(key); this.cache.delete(key); this.cache.set(key, frame); return Promise.resolve(frame);
    }
    let entry = this.pending.get(key);
    if (!entry || entry.controller.signal.aborted) {
      const controller = new AbortController(); entry = { controller, users: new Set(), promise: null };
      this.pending.set(key, entry);
      const current = entry, timeout = setTimeout(() => controller.abort(), 45000);
      current.promise = this.read(manifest, descriptor, controller.signal).then(frame => {
        if (!this.destroyed && !controller.signal.aborted) {
          this.cache.set(key, frame); while (this.cache.size > this.cacheSize) this.cache.delete(this.cache.keys().next().value);
        }
        return frame;
      }).catch(error => { controller.abort(); throw error; }).finally(() => { clearTimeout(timeout); if (this.pending.get(key) === current) this.pending.delete(key); });
    }
    return new Promise((resolve, reject) => {
      const token = Symbol(); entry.users.add(token); let settled = false;
      const cleanup = () => { entry.users.delete(token); signal?.removeEventListener('abort', cancel); };
      const cancel = () => { if (settled) return; settled = true; cleanup(); if (!entry.users.size) entry.controller.abort(); reject(abortError()); };
      signal?.addEventListener('abort', cancel, { once: true });
      entry.promise.then(frame => { if (!settled) { settled = true; cleanup(); resolve(frame); } }, error => { if (!settled) { settled = true; cleanup(); reject(error); } });
    });
  }
  destroy() { this.destroyed = true; for (const entry of this.pending.values()) entry.controller.abort(); this.pending.clear(); this.cache.clear(); }
}
