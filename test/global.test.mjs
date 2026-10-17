import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { validateManifest, validateFrame, samplePoint, wrapLongitude, decodeFrameResponse } from '../src/forecast.mjs';
import { drawGlobalGrid, worldCopies } from '../src/globalMap.mjs';
const now = Date.parse('2026-10-17T09:00:00Z');
function fixture() {
  const interval = { start: '2026-10-17T09:00:00Z', end: '2026-10-17T12:00:00Z', validTime: '2026-10-17T10:30:00Z' };
  const manifest = { schemaVersion: 2, source: 'NASA GEOS-FP', coverage: 'global',
    runTime: '2026-10-17T06:00:00Z', retrievedAt: '2026-10-17T09:00:00Z',
    units: { dustSurface: 'ug m-3', dustFine: 'ug m-3', dustAod: '1' },
    sampling: { latitudeDegrees: 1.25, longitudeDegrees: 1.25 },
    latitudes: Array.from({ length: 145 }, (_, i) => -90 + i * 1.25),
    longitudes: Array.from({ length: 288 }, (_, i) => -180 + i * 1.25),
    frames: [{ ...interval, path: 'runs/20261017_06/20261017T103000Z.json.gz' }] };
  const grid = () => Array.from({ length: 145 }, () => Array(288).fill(0));
  const frame = { schemaVersion: 2, source: manifest.source, runTime: manifest.runTime, ...interval,
    dustSurface: grid(), dustFine: grid(), dustAod: grid() };
  return { manifest, frame };
}
test('global manifest and separately loaded frame agree', () => {
  const { manifest, frame } = fixture();
  assert.equal(validateManifest(manifest, now), manifest);
  assert.equal(validateFrame(frame, manifest, manifest.frames[0], now), frame);
  frame.runTime = '2026-10-17T00:00:00Z';
  assert.throws(() => validateFrame(frame, manifest, manifest.frames[0], now), /match/);
});
test('global points work in southern and western hemispheres and at the poles', () => {
  const { manifest, frame } = fixture();
  const sydney = samplePoint(manifest, frame, -33.87, 151.21);
  assert.deepEqual([sydney.lat, sydney.lon], [-33.75, 151.25]);
  assert.equal(samplePoint(manifest, frame, 90, 0).lat, 90);
  assert.equal(samplePoint(manifest, frame, -90, -74).lat, -90);
  assert.equal(samplePoint(manifest, frame, 91, 0), null);
});
test('sampling wraps at the date line instead of leaving a gap', () => {
  const { manifest, frame } = fixture();
  assert.equal(samplePoint(manifest, frame, 0, 179.9).lon, -180);
  assert.equal(samplePoint(manifest, frame, 0, -180.1).lon, -180);
  assert.deepEqual(samplePoint(manifest, frame, 0, 540), samplePoint(manifest, frame, 0, -180));
  assert.equal(wrapLongitude(360), 0);
  assert.ok(worldCopies(170, 190).includes(360));
  assert.equal(worldCopies(-10000, 10000).length, 7);
});
test('invalid grids, escaped paths and stale global manifests fail', () => {
  for (const mutate of [m => m.latitudes.pop(), m => m.longitudes[1] = -179,
    m => m.frames[0].path = '../escape.json.gz', m => m.units.dustSurface = 'kg m-3']) {
    const { manifest } = fixture(); mutate(manifest); assert.throws(() => validateManifest(manifest, now));
  }
  assert.throws(() => validateManifest(fixture().manifest, now + 40 * 3600000), /stale/);
});
test('canvas rendering includes the repeated seam cell and skips unknown cells', () => {
  const { manifest, frame } = fixture();
  frame.dustSurface.forEach(row => row.fill(null)); frame.dustSurface[72][0] = 150;
  const calls = [];
  const ctx = { clearRect() {}, fillRect(...args) { calls.push(args); }, globalAlpha: 1, fillStyle: '' };
  const map = { getBounds: () => ({ getWest: () => 170, getEast: () => 190 }),
    latLngToContainerPoint: ([lat, lon]) => ({ x: lon - 170, y: 90 - lat }) };
  drawGlobalGrid(ctx, map, manifest, frame, 20, 180);
  assert.equal(calls.length, 1); assert.equal(calls[0][0], 9.375); assert.equal(calls[0][2], 1.25);
  assert.equal(ctx.globalAlpha, 1);
});
test('compressed frames decode correctly and corrupt responses fail', async () => {
  assert.deepEqual(await decodeFrameResponse(new Response(gzipSync('{"value":42}'))), { value: 42 });
  await assert.rejects(decodeFrameResponse(new Response('not gzip')));
  await assert.rejects(decodeFrameResponse(new Response(gzipSync('x'.repeat(9 * 1024 * 1024)))), /size limit/);
});
