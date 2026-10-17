import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateForecast, frameAt, samplePoint, dustColor } from '../src/forecast.mjs';
const now = Date.parse('2026-10-17T09:00:00Z');
function fixture() {
  return { schemaVersion: 1, source: 'NASA GEOS-FP', runTime: '2026-10-17T06:00:00Z', retrievedAt: '2026-10-17T09:00:00Z',
    units: { dustSurface: 'ug m-3', dustFine: 'ug m-3', dustAod: '1' },
    latitudes: [31, 31.25], longitudes: [35, 35.3125], frames: [{
      start: '2026-10-17T09:00:00Z', end: '2026-10-17T12:00:00Z', validTime: '2026-10-17T10:30:00Z',
      dustSurface: [[0, 150], [null, 400]], dustFine: [[0, 15], [null, 40]], dustAod: [[0, 0.1], [null, 0.4]],
    }] };
}
test('valid forecast preserves zero and missing values separately', () => {
  const d = validateForecast(fixture(), now);
  assert.equal(samplePoint(d, d.frames[0], 31, 35).dustSurface, 0);
  assert.equal(samplePoint(d, d.frames[0], 31.25, 35).dustSurface, null);
  assert.equal(dustColor(null), null); assert.ok(dustColor(0));
});
test('out-of-region, invalid coordinates and unsampled times stay unknown', () => {
  const d = fixture(); assert.equal(samplePoint(d, d.frames[0], 32, 35), null);
  assert.equal(samplePoint(d, d.frames[0], NaN, 35), null);
  assert.equal(frameAt(d, now - 1), null); assert.equal(frameAt(d, now + 10800000), null);
  assert.equal(frameAt(d, now), d.frames[0]);
});
test('stale, future and expired forecasts are rejected', () => {
  assert.throws(() => validateForecast(fixture(), now + 40 * 3600000), /stale/);
  assert.throws(() => validateForecast(fixture(), now - 8 * 3600000), /stale|invalid/);
  assert.throws(() => validateForecast(fixture(), now + 10800000), /expired/);
});
test('wrong units, malformed grids and nonfinite values fail validation', () => {
  for (const mutate of [d => d.units.dustSurface = 'kg m-3', d => d.latitudes.reverse(),
    d => d.frames[0].dustSurface[0].pop(), d => d.frames[0].dustAod[0][0] = Infinity,
    d => d.frames[0].dustFine[0][0] = -1]) {
    const d = fixture(); mutate(d); assert.throws(() => validateForecast(d, now));
  }
});
test('source intervals cannot overlap, expand or shift their averaging centre', () => {
  const d = fixture(); d.frames.push(structuredClone(d.frames[0]));
  assert.throws(() => validateForecast(d, now), /overlapping/);
  d.frames.pop(); d.frames[0].validTime = '2026-10-17T11:00:00Z';
  assert.throws(() => validateForecast(d, now), /intervals/);
});
