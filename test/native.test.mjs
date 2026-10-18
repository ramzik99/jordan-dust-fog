import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NATIVE_GRID, decodeNativePixels, validateDustManifest, NativeForecast } from '../src/nativeDust.mjs';
import { samplePoint } from '../src/forecast.mjs';
import { colorFor, thresholdState } from '../src/dustDisplay.mjs';
import { observationTimes, satelliteRequests } from '../src/satellite.mjs';
function fixture() {
  const now = Date.now(), start = Math.floor(now / 10800000) * 10800000, run = Math.floor(now / 21600000) * 21600000;
  const iso = ms => new Date(ms).toISOString(), runTime = iso(run), validTime = iso(start + 5400000);
  const token = runTime.slice(0, 10).replaceAll('-', '') + '_' + runTime.slice(11, 13), stamp = validTime.replaceAll('-', '').replaceAll(':', '');
  return { schemaVersion: 2, source: 'NASA GEOS-FP', coverage: 'global', runTime, retrievedAt: iso(now),
    units: { dustSurface: 'ug m-3', dustFine: 'ug m-3', dustAod: '1' },
    nativeResolution: { latitudeDegrees: .25, longitudeDegrees: .3125 }, sampling: { latitudeDegrees: 1.25, longitudeDegrees: 1.25 },
    latitudes: Array.from({ length: 145 }, (_, i) => -90 + i * 1.25), longitudes: Array.from({ length: 288 }, (_, i) => -180 + i * 1.25),
    frames: [{ start: iso(start), end: iso(start + 10800000), validTime, path: `runs/${token}/${stamp}.json.gz`,
      native: { encoding: 'log16-rgb-pair-v1', width: 1152, height: 721, scales: { dustSurface: .0001, dustFine: .0001, dustAod: .0001 },
        massPath: `native/runs/${token}/${stamp}.mass.png`, opticsPath: `native/runs/${token}/${stamp}.optics.png` } }] };
}
test('native manifest rejects wrong dimensions, packing scales and traversal', () => {
  assert.ok(validateDustManifest(fixture()));
  for (const mutate of [m => m.frames[0].native.width = 288, m => m.frames[0].native.scales.dustAod = 0,
    m => m.frames[0].native.massPath = '../escape.png']) {
    const m = fixture(); mutate(m); assert.throws(() => validateDustManifest(m));
  }
});
test('RGB byte decoding preserves zero and missing independently across fields', async () => {
  const mass = new Uint8Array([0, 0, 255, 255, 0, 10, 0, 255]);
  const optics = new Uint8Array([255, 0, 20, 255, 30, 255, 255, 255]);
  const fields = await decodeNativePixels(mass, optics, { dustSurface: .01, dustFine: .01, dustAod: .01 }, 2);
  assert.equal(fields.dustSurface[0], 0); assert.ok(Number.isNaN(fields.dustFine[0]));
  assert.ok(Math.abs(fields.dustAod[0] - Math.expm1(.2)) < 1e-6);
  assert.ok(Number.isNaN(fields.dustAod[1]));
  const abort = new AbortController(); abort.abort();
  await assert.rejects(decodeNativePixels(mass, optics, {}, 2, abort.signal), { name: 'AbortError' });
});
test('flat native arrays sample globally without treating missing as zero', () => {
  const values = new Float32Array(721 * 1152).fill(NaN), y = 360;
  values[y * 1152] = 0;
  const frame = { dustSurface: values, dustFine: values, dustAod: values };
  assert.equal(samplePoint(NATIVE_GRID, frame, 0, 179.99).dustSurface, 0);
  assert.equal(samplePoint(NATIVE_GRID, frame, 0, 0).dustSurface, null);
});
test('threshold guidance and colors leave unknown values unknown', () => {
  assert.equal(thresholdState(null, 100), 'unknown'); assert.equal(thresholdState(NaN, 100), 'unknown');
  assert.equal(thresholdState(100, 100), 'met'); assert.equal(thresholdState(0, 100), 'below');
  assert.equal(colorFor(NaN), null); assert.ok(colorFor(0));
});
test('satellite cadence and dateline requests use observation time and bounded images', () => {
  const now = Date.now(), latest = new Date(now).toISOString(), first = new Date(now - 86400000).toISOString();
  assert.equal(observationTimes(latest, first, 'PT3H', now).length, 9);
  assert.equal(observationTimes(latest, first, 'PT10M', now).length, 37);
  assert.throws(() => observationTimes(latest, first, 'bad', now));
  const requests = satelliteRequests('global', latest, { south: -20, north: 20, west: 170, east: 190 }, { width: 2000, height: 1000 });
  assert.equal(requests.length, 2);
  for (const r of requests) { const u = new URL(r.url); assert.equal(u.searchParams.get('TIME'), latest); assert.equal(u.searchParams.get('SRS'), 'EPSG:3857'); assert.ok(+u.searchParams.get('WIDTH') <= 1536); }
});
test('one cancelled consumer keeps a shared native download alive for others', async () => {
  const m = fixture(); let calls = 0, aborted = false, finish;
  const service = new NativeForecast();
  service.read = async (_m, _d, signal) => { calls++; signal.addEventListener('abort', () => aborted = true); return new Promise(resolve => finish = resolve); };
  const a = new AbortController(), b = new AbortController();
  const p = service.get(m, m.frames[0], a.signal), q = service.get(m, m.frames[0], b.signal);
  a.abort(); await assert.rejects(p, { name: 'AbortError' }); assert.equal(aborted, false);
  finish({ value: 42 }); assert.deepEqual(await q, { value: 42 }); assert.equal(calls, 1);
  assert.deepEqual(await service.get(m, m.frames[0]), { value: 42 }); service.destroy();
});
