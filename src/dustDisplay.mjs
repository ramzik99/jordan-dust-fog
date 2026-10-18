import { fieldValue } from './forecast.mjs';
import { worldCopies } from './globalMap.mjs';
export const FIELD_INFO = {
  dustSurface: { label: 'Surface dust', units: 'µg/m³', stops: [0, 50, 100, 300, 1000, 3000] },
  dustFine: { label: 'Fine dust · PM₂.₅ component', units: 'µg/m³', stops: [0, 10, 25, 50, 100, 300] },
  dustAod: { label: 'Dust optical depth', units: '', stops: [0, .1, .3, .6, 1.5, 3] },
};
export const PALETTE = [[245, 242, 224], [253, 224, 163], [249, 168, 37], [227, 108, 35], [182, 66, 49], [93, 36, 55]];
export function colorFor(value, field = 'dustSurface') {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  const stops = FIELD_INFO[field].stops;
  let i = 0; while (i < stops.length - 1 && value > stops[i + 1]) i++;
  if (i === stops.length - 1) return PALETTE[i];
  const fraction = Math.max(0, Math.min(1, (Math.log1p(value) - Math.log1p(stops[i])) / (Math.log1p(stops[i + 1]) - Math.log1p(stops[i]))));
  return PALETTE[i].map((c, channel) => Math.round(c + fraction * (PALETTE[i + 1][channel] - c)));
}
export function makeTexture(grid, frame, field, canvasFactory = () => document.createElement('canvas')) {
  const canvas = canvasFactory(); canvas.width = grid.longitudes.length; canvas.height = grid.latitudes.length;
  const ctx = canvas.getContext('2d'); if (!ctx) throw Error('Canvas rendering unavailable');
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const color = colorFor(fieldValue(frame[field], y, x, canvas.width), field); if (!color) continue;
    const p = (y * canvas.width + x) * 4; pixels.data[p] = color[0]; pixels.data[p + 1] = color[1]; pixels.data[p + 2] = color[2]; pixels.data[p + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0); return canvas;
}
const clampLat = value => Math.max(-85.05112878, Math.min(85.05112878, value));
export function drawTexture(ctx, map, grid, texture, width, height, opacity = .6) {
  ctx.clearRect(0, 0, width, height); if (!texture) return;
  const dy = grid.sampling.latitudeDegrees / 2, dx = grid.sampling.longitudeDegrees / 2;
  const b = map.getBounds(); ctx.globalAlpha = opacity; ctx.imageSmoothingEnabled = false;
  for (const offset of worldCopies(b.getWest(), b.getEast())) {
    const left = map.latLngToContainerPoint([0, grid.longitudes[0] + offset - dx]).x;
    const right = map.latLngToContainerPoint([0, grid.longitudes.at(-1) + offset + dx]).x;
    if (right < 0 || left > width) continue;
    for (let y = 0; y < grid.latitudes.length; y++) {
      const top = map.latLngToContainerPoint([clampLat(grid.latitudes[y] + dy), 0]).y;
      const bottom = map.latLngToContainerPoint([clampLat(grid.latitudes[y] - dy), 0]).y;
      if (bottom < 0 || top > height || bottom <= top) continue;
      ctx.drawImage(texture, 0, y, texture.width, 1, left, top, right - left, bottom - top);
    }
  }
  ctx.globalAlpha = 1;
}
export function thresholdState(value, threshold) {
  if (value === null || !Number.isFinite(value) || !Number.isFinite(threshold) || threshold <= 0) return 'unknown';
  return value >= threshold ? 'met' : 'below';
}
