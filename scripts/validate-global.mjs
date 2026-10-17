import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { validateManifest, validateFrame } from '../src/forecast.mjs';
const path = resolve(process.argv[2] || 'data/global/latest.json');
const manifest = validateManifest(JSON.parse(readFileSync(path, 'utf8')));
for (const f of manifest.frames) {
  const frame = JSON.parse(gunzipSync(readFileSync(resolve(dirname(path), f.path))));
  validateFrame(frame, manifest, f);
}
console.log(`Validated ${manifest.frames.length} global frames on ${manifest.latitudes.length} × ${manifest.longitudes.length} grid`);
