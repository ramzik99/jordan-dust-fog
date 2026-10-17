import { dustColor } from './forecast.mjs';
const clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
export function worldCopies(west, east) {
  if (![west, east].every(Number.isFinite) || east < west) return [];
  const middle = Math.floor(((west + east) / 2 + 180) / 360);
  const lo = Math.max(middle - 3, Math.floor((west + 180) / 360) - 1);
  const hi = Math.min(middle + 3, Math.floor((east + 180) / 360) + 1);
  return Array.from({ length: Math.max(0, hi - lo + 1) }, (_, i) => (lo + i) * 360);
}
export function drawGlobalGrid(ctx, map, manifest, frame, width, height) {
  ctx.clearRect(0, 0, width, height);
  if (!manifest || !frame) return;
  const ys = manifest.latitudes, xs = manifest.longitudes, half = 0.625;
  const b = map.getBounds();
  const rows = ys.map(lat => [map.latLngToContainerPoint([clampLat(lat + half), 0]).y,
    map.latLngToContainerPoint([clampLat(lat - half), 0]).y]);
  ctx.globalAlpha = 0.48;
  for (const offset of worldCopies(b.getWest(), b.getEast())) {
    const columns = xs.map(lon => [map.latLngToContainerPoint([0, lon + offset - half]).x,
      map.latLngToContainerPoint([0, lon + offset + half]).x]);
    for (let y = 0; y < ys.length; y++) {
      const [top, bottom] = rows[y];
      if (top > height || bottom < 0 || bottom <= top) continue;
      for (let x = 0; x < xs.length; x++) {
        const [left, right] = columns[x];
        if (left > width || right < 0 || right <= left) continue;
        const color = dustColor(frame.dustSurface[y][x]);
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(Math.max(0, left), Math.max(0, top), Math.min(width, right) - Math.max(0, left), Math.min(height, bottom) - Math.max(0, top));
      }
    }
  }
  ctx.globalAlpha = 1;
}
