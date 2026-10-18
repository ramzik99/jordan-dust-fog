export const MAX_RUN_AGE_MS = 36 * 3600000;
export const FIELDS = ['dustSurface', 'dustFine', 'dustAod'];
const validDate = value => typeof value === 'string' && value.endsWith('Z') && Number.isFinite(Date.parse(value));
function increasing(values) {
  return Array.isArray(values) && values.length > 0 && values.every((v, i) =>
    Number.isFinite(v) && (i === 0 || v > values[i - 1]));
}
export function validateForecast(data, now = Date.now(), checkExpiry = true) {
  if (!data || data.schemaVersion !== 1 || data.source !== 'NASA GEOS-FP') throw Error('Unsupported forecast format');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) > now + 3600000 || Date.parse(data.retrievedAt) < run) throw Error('Invalid retrieval time');
  if (!increasing(data.latitudes) || !increasing(data.longitudes) || data.latitudes.length < 2 || data.longitudes.length < 2) throw Error('Invalid spatial grid');
  if (data.latitudes[0] < -90 || data.latitudes.at(-1) > 90 || data.longitudes[0] < -180 || data.longitudes.at(-1) > 180) throw Error('Invalid coordinates');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  if (data.latitudes.length * data.longitudes.length > 50000) throw Error('Forecast grid exceeds size limit');
  let lastEnd = -Infinity;
  for (const f of data.frames) {
    if (![f.start, f.end, f.validTime].every(validDate)) throw Error('Invalid frame times');
    const start = Date.parse(f.start), end = Date.parse(f.end), centre = Date.parse(f.validTime);
    if (start < run || start < lastEnd || end - start !== 10800000 || centre !== (start + end) / 2) throw Error('Invalid or overlapping averaging intervals');
    lastEnd = end;
    for (const key of FIELDS) {
      if (!Array.isArray(f[key]) || f[key].length !== data.latitudes.length ||
        f[key].some(row => !Array.isArray(row) || row.length !== data.longitudes.length ||
          row.some(v => v !== null && (!Number.isFinite(v) || v < 0)))) throw Error('Invalid field: ' + key);
    }
  }
  if (checkExpiry && lastEnd <= now) throw Error('Forecast has expired');
  return data;
}
export function frameAt(data, timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  return data?.frames.find(f => timestamp >= Date.parse(f.start) && timestamp < Date.parse(f.end)) ?? null;
}
export function samplePoint(data, frame, lat, lon) {
  if (!frame || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ys = data.latitudes, xs = data.longitudes;
  const global = data.coverage === 'global';
  if (global) lon = wrapLongitude(lon);
  if (lat < ys[0] || lat > ys.at(-1) || (!global && (lon < xs[0] || lon > xs.at(-1)))) return null;
  const nearest = (a, value) => a.reduce((best, v, i) => Math.abs(v - value) < Math.abs(a[best] - value) ? i : best, 0);
  const y = nearest(ys, lat);
  const x = global ? xs.reduce((best, v, i) => Math.abs(wrapLongitude(v - lon)) < Math.abs(wrapLongitude(xs[best] - lon)) ? i : best, 0) : nearest(xs, lon);
  return { lat: ys[y], lon: xs[x], ...Object.fromEntries(FIELDS.map(k => [k, fieldValue(frame[k], y, x, xs.length)])) };
}
export function fieldValue(values, y, x, width) {
  const value = ArrayBuffer.isView(values) ? values[y * width + x] : values?.[y]?.[x];
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
// Display bins only: not visibility thresholds, health limits or calibrated warning levels.
export const DUST_BINS = [
  { min: 0, color: '#fde0a3' }, { min: 100, color: '#f9a825' },
  { min: 300, color: '#e36c23' }, { min: 1000, color: '#b64231' },
];
export function dustColor(value) {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  return DUST_BINS.findLast(b => value >= b.min).color;
}

export function wrapLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

export function validateManifest(data, now = Date.now()) {
  if (data?.schemaVersion !== 2 || data.coverage !== 'global' || data.source !== 'NASA GEOS-FP') throw Error('Unsupported global manifest');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) < run || Date.parse(data.retrievedAt) > now + 3600000) throw Error('Invalid retrieval time');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  const ys = data.latitudes, xs = data.longitudes;
  if (!increasing(ys) || !increasing(xs) || ys.length !== 145 || xs.length !== 288 || ys[0] !== -90 || ys.at(-1) !== 90 || xs[0] !== -180 || xs.at(-1) !== 178.75 ||
      ys.some((v, i) => i > 0 && Math.abs(v - ys[i - 1] - 1.25) > 1e-6) || xs.some((v, i) => i > 0 && Math.abs(v - xs[i - 1] - 1.25) > 1e-6) ||
      data.sampling?.latitudeDegrees !== 1.25 || data.sampling?.longitudeDegrees !== 1.25) throw Error('Invalid global sampling grid');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  let lastEnd = -Infinity;
  const paths = new Set();
  const token = data.runTime.slice(0, 10).replaceAll('-', '') + '_' + data.runTime.slice(11, 13);
  for (const f of data.frames) {
    if (![f.start, f.end, f.validTime].every(validDate)) throw Error('Invalid frame times');
    const start = Date.parse(f.start), end = Date.parse(f.end);
    if (start < run || start < lastEnd || end - start !== 10800000 || Date.parse(f.validTime) !== (start + end) / 2) throw Error('Invalid or overlapping averaging intervals');
    const stamp = f.validTime.replaceAll('-', '').replaceAll(':', '');
    if (f.path !== `runs/${token}/${stamp}.json.gz` || paths.has(f.path)) throw Error('Invalid forecast path');
    paths.add(f.path); lastEnd = end;
  }
  if (lastEnd <= now) throw Error('Forecast has expired');
  return data;
}

export function validateFrame(frame, manifest, descriptor, now = Date.now()) {
  validateManifest(manifest, now);
  if (!manifest.frames.some(f => f.path === descriptor?.path && f.validTime === descriptor.validTime)) throw Error('Unrecognised forecast interval');
  if (frame?.schemaVersion !== 2 || frame.source !== manifest.source || frame.runTime !== manifest.runTime ||
      ['start', 'end', 'validTime'].some(k => frame[k] !== descriptor[k])) throw Error('Forecast frame does not match manifest');
  validateForecast({ ...manifest, schemaVersion: 1, frames: [frame] }, now, false);
  return frame;
}

export async function decodeFrameResponse(response) {
  if (typeof DecompressionStream === 'undefined') throw Error('This browser does not support compressed forecast files');
  const compressed = new Uint8Array(await response.arrayBuffer());
  if (compressed.byteLength > 2 * 1024 * 1024) throw Error('Compressed forecast exceeds size limit');
  const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const parts = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) throw Error('Decoded forecast exceeds size limit');
      parts.push(value);
    }
  } finally { await reader.cancel(); }
  const joined = new Uint8Array(size); let offset = 0;
  for (const part of parts) { joined.set(part, offset); offset += part.byteLength; }
  return JSON.parse(new TextDecoder().decode(joined));
}
