export const MAX_RUN_AGE_MS = 36 * 3600000;
export const FIELDS = ['dustSurface', 'dustFine', 'dustAod'];
const validDate = value => typeof value === 'string' && value.endsWith('Z') && Number.isFinite(Date.parse(value));
function increasing(values) {
  return Array.isArray(values) && values.length > 0 && values.every((v, i) =>
    Number.isFinite(v) && (i === 0 || v > values[i - 1]));
}
export function validateForecast(data, now = Date.now()) {
  if (!data || data.schemaVersion !== 1 || data.source !== 'NASA GEOS-FP') throw Error('Unsupported forecast format');
  if (!validDate(data.runTime) || !validDate(data.retrievedAt)) throw Error('Invalid source timestamps');
  const run = Date.parse(data.runTime);
  if (run > now + 3600000 || now - run > MAX_RUN_AGE_MS) throw Error('GEOS forecast run is stale or invalid');
  if (Date.parse(data.retrievedAt) > now + 3600000 || Date.parse(data.retrievedAt) < run) throw Error('Invalid retrieval time');
  if (!increasing(data.latitudes) || !increasing(data.longitudes) || data.latitudes.length < 2 || data.longitudes.length < 2) throw Error('Invalid spatial grid');
  if (data.latitudes[0] < -90 || data.latitudes.at(-1) > 90 || data.longitudes[0] < -180 || data.longitudes.at(-1) > 180) throw Error('Invalid coordinates');
  if (data.units?.dustSurface !== 'ug m-3' || data.units?.dustFine !== 'ug m-3' || data.units?.dustAod !== '1') throw Error('Unexpected units');
  if (!Array.isArray(data.frames) || !data.frames.length || data.frames.length > 100) throw Error('Invalid forecast frames');
  if (data.latitudes.length * data.longitudes.length > 10000) throw Error('Forecast grid exceeds regional limit');
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
  if (lastEnd <= now) throw Error('Forecast has expired');
  return data;
}
export function frameAt(data, timestamp) {
  if (!Number.isFinite(timestamp)) return null;
  return data?.frames.find(f => timestamp >= Date.parse(f.start) && timestamp < Date.parse(f.end)) ?? null;
}
export function samplePoint(data, frame, lat, lon) {
  if (!frame || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const ys = data.latitudes, xs = data.longitudes;
  if (lat < ys[0] || lat > ys.at(-1) || lon < xs[0] || lon > xs.at(-1)) return null;
  const nearest = (a, value) => a.reduce((best, v, i) => Math.abs(v - value) < Math.abs(a[best] - value) ? i : best, 0);
  const y = nearest(ys, lat), x = nearest(xs, lon);
  return { lat: ys[y], lon: xs[x], ...Object.fromEntries(FIELDS.map(k => [k, frame[k][y][x]])) };
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
