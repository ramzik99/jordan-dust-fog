import { worldCopies } from './globalMap.mjs';
export const SATELLITES = {
  global: { label: 'Global dust composite', endpoint: 'https://view.eumetsat.int/geoserver/mumi/wms', layer: 'wideareacoverage_rgb_dust', maxAge: 12 * 3600000 },
  meteosat: { label: 'Meteosat Dust RGB', endpoint: 'https://view.eumetsat.int/geoserver/mtg_fd/wms', layer: 'rgb_dust', maxAge: 3600000 },
};
export function intervalMs(text) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(text || '');
  return m ? (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) * 1000 : NaN;
}
export function observationTimes(latest, earliest, cadence, now = Date.now()) {
  const end = Date.parse(latest), start = Date.parse(earliest), step = intervalMs(cadence);
  if (!Number.isFinite(end) || !Number.isFinite(start) || end < start || end > now + 600000 || !Number.isFinite(step) || step < 60000) throw Error('Invalid satellite observation times');
  const count = Math.min(37, Math.floor(Math.min(24 * 3600000, end - start) / step) + 1);
  return Array.from({ length: count }, (_, i) => new Date(end - i * step).toISOString());
}
export function parseCapabilities(text, layerName, now = Date.now()) {
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length) throw Error('Satellite service returned invalid metadata');
  for (const layer of xml.getElementsByTagNameNS('*', 'Layer')) {
    const children = Array.from(layer.children);
    const name = children.find(c => c.localName === 'Name')?.textContent?.trim().split(':').at(-1);
    if (name !== layerName) continue;
    const dimension = children.find(c => c.localName === 'Dimension' && c.getAttribute('name') === 'time');
    if (!dimension) throw Error('Satellite time metadata unavailable');
    const range = dimension.textContent.trim().split('/');
    const latest = dimension.getAttribute('default') || range[1];
    const times = observationTimes(latest, range[0], range[2], now);
    return { latest: times[0], times, cadence: range[2] };
  }
  throw Error('Requested dust satellite layer unavailable');
}
const R = 6378137, clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
const mercatorX = lon => R * lon * Math.PI / 180;
const mercatorY = lat => R * Math.log(Math.tan(Math.PI / 4 + clampLat(lat) * Math.PI / 360));
export function satelliteRequests(source, time, bounds, size) {
  if (!SATELLITES[source] || !Number.isFinite(Date.parse(time))) throw Error('Invalid satellite request');
  const product = SATELLITES[source], south = clampLat(bounds.south), north = clampLat(bounds.north);
  if (north <= south || bounds.east <= bounds.west) return [];
  const results = [], density = Math.min(1, 1536 / Math.max(size.width, size.height));
  for (const offset of worldCopies(bounds.west, bounds.east)) {
    const west = Math.max(bounds.west, -180 + offset), east = Math.min(bounds.east, 180 + offset);
    if (east <= west) continue;
    const width = Math.max(1, Math.round(size.width * density * (east - west) / (bounds.east - bounds.west)));
    const height = Math.max(1, Math.round(size.height * density));
    const params = new URLSearchParams({ SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap', LAYERS: product.layer,
      STYLES: '', SRS: 'EPSG:3857', BBOX: [mercatorX(west - offset), mercatorY(south), mercatorX(east - offset), mercatorY(north)].join(','),
      WIDTH: String(width), HEIGHT: String(height), FORMAT: 'image/png', TRANSPARENT: 'true', TIME: time });
    results.push({ url: product.endpoint + '?' + params, south, north, west, east });
  }
  return results;
}
export async function satelliteMetadata(source, signal) {
  const product = SATELLITES[source]; if (!product) throw Error('Unknown satellite source');
  const response = await fetch(product.endpoint + '?SERVICE=WMS&REQUEST=GetCapabilities', { signal });
  if (!response.ok) throw Error('Satellite metadata unavailable (HTTP ' + response.status + ')');
  const text = await response.text(); if (text.length > 2000000) throw Error('Satellite metadata exceeds limit');
  return parseCapabilities(text, product.layer);
}
export async function satelliteFrame(source, time, bounds, size, signal) {
  const requests = satelliteRequests(source, time, bounds, size), completed = [];
  try {
    for (const request of requests) {
      const response = await fetch(request.url, { signal });
      if (!response.ok || !response.headers.get('Content-Type')?.includes('image/')) throw Error('Satellite image unavailable');
      const blob = await response.blob(); if (blob.size > 8 * 1024 * 1024) throw Error('Satellite image exceeds size limit');
      const image = await createImageBitmap(blob);
      if (image.width > 2048 || image.height > 2048) { image.close(); throw Error('Unexpected satellite image dimensions'); }
      completed.push({ ...request, image });
    }
    return { source, time, patches: completed };
  } catch (error) { for (const patch of completed) patch.image.close(); throw error; }
}
export function closeSatellite(frame) { for (const patch of frame?.patches || []) patch.image.close(); }
export function drawSatellite(ctx, map, frame, width, height, opacity = 1) {
  ctx.clearRect(0, 0, width, height); if (!frame) return;
  ctx.globalAlpha = opacity; ctx.imageSmoothingEnabled = true;
  for (const p of frame.patches) {
    const a = map.latLngToContainerPoint([p.north, p.west]), b = map.latLngToContainerPoint([p.south, p.east]);
    ctx.drawImage(p.image, a.x, a.y, b.x - a.x, b.y - a.y);
  }
  ctx.globalAlpha = 1;
}
