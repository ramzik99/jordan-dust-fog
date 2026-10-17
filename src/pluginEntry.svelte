<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import { register, release, singleclick } from '@windy/singleclick';
  import config from './pluginConfig';
  import { validateForecast, frameAt, samplePoint, dustColor, MAX_RUN_AGE_MS } from './forecast.mjs';

  // Leaflet is provided by the Windy plugin host, as in Wintry Forecast.
  declare const L: any;
  const DATA_URL = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/latest.json';
  const places = [
    { name: 'Amman', lat: 31.95, lon: 35.93 }, { name: 'Fuheis', lat: 32.01, lon: 35.77 },
    { name: 'Irbid', lat: 32.56, lon: 35.85 }, { name: 'Mafraq', lat: 32.34, lon: 36.21 },
    { name: 'Karak', lat: 31.18, lon: 35.70 }, { name: 'Ma’an', lat: 30.19, lon: 35.73 },
    { name: 'Aqaba', lat: 29.53, lon: 35.01 }, { name: 'Queen Alia', lat: 31.72, lon: 35.99 },
  ];
  let forecast: any = null;
  let enabled = true, showDust = true, hidden = false, loading = false, destroyed = false;
  let error = '', timestamp = Date.now(), now = Date.now();
  let selected = places[0];
  let overlay: any = null, pointer: any = null, request: AbortController | null = null;
  let timer: any, refreshTimer: any, timestampListener: any;
  let generation = 0;
  const displayTime = (value: any) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const format = (value: any, digits = 0) => value === null || value === undefined ? 'Unavailable' : value.toFixed(digits);
  $: stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now);
  $: frame = enabled && !stale ? frameAt(forecast, timestamp) : null;
  $: sample = forecast && frame ? samplePoint(forecast, frame, selected.lat, selected.lon) : null;
  $: if (forecast || !enabled) renderDust(frame, enabled && showDust && !stale);

  function clearOverlay() { if (overlay) { map.removeLayer(overlay); overlay = null; } }
  function renderDust(active: any, visible: boolean) {
    clearOverlay();
    if (!active || !visible || !forecast || typeof L === 'undefined') return;
    const pane = map.getPane('jordan-dust') || map.createPane('jordan-dust');
    pane.style.zIndex = '390'; pane.style.pointerEvents = 'none';
    const next = L.layerGroup();
    const ys = forecast.latitudes, xs = forecast.longitudes;
    const dy = 0.125, dx = 0.15625;
    // Native model cells are deliberately visible; no artificial fine-scale detail.
    for (let y = 0; y < ys.length; y++) for (let x = 0; x < xs.length; x++) {
      const color = dustColor(active.dustSurface[y][x]);
      if (!color) continue;
      L.polygon([[ys[y] - dy, xs[x] - dx], [ys[y] - dy, xs[x] + dx],
        [ys[y] + dy, xs[x] + dx], [ys[y] + dy, xs[x] - dx]], {
        pane: 'jordan-dust', stroke: false, fillColor: color, fillOpacity: 0.48, interactive: false,
      }).addTo(next);
    }
    overlay = next.addTo(map);
  }
  function selectPoint(value: any) {
    const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
    const lon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;
    if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
    selected = { name: value.name || 'Selected location', lat, lon };
    if (pointer) map.removeLayer(pointer);
    if (typeof L !== 'undefined') pointer = L.circleMarker([lat, lon], {
      radius: 6, color: '#fff', fillColor: '#183047', fillOpacity: 1, weight: 2,
    }).addTo(map);
  }
  function toggleEnabled() {
    if (enabled) { register(config.name, 'high'); if (!forecast) void load(); }
    else { release(config.name, 'high'); request?.abort(); generation++; loading = false; clearOverlay(); if (pointer) { map.removeLayer(pointer); pointer = null; } }
  }
  async function load() {
    request?.abort(); const abort = new AbortController(); request = abort;
    const epoch = ++generation; loading = true; error = '';
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch(DATA_URL + '?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });
      if (!response.ok) throw Error(response.status === 404 ? 'Forecast file not yet available. Data ingestion must succeed first.' : 'Forecast server returned HTTP ' + response.status);
      const text = await response.text();
      if (text.length > 8000000) throw Error('Forecast file exceeds size limit');
      const loaded = validateForecast(JSON.parse(text));
      if (destroyed || epoch !== generation || !enabled) return;
      forecast = loaded; now = Date.now();
    } catch (err: any) {
      if (destroyed || epoch !== generation) return;
      error = err?.name === 'AbortError' ? 'Forecast request timed out or was cancelled.' : String(err?.message || err);
      // A failed refresh cannot leave a successful-looking obsolete layer.
      forecast = null; clearOverlay();
    } finally { clearTimeout(timeout); if (epoch === generation) loading = false; }
  }
  export const onopen = (params: unknown) => { hidden = false; if (enabled) register(config.name, 'high'); selectPoint(params); };
  onMount(() => {
    singleclick.on(config.name, selectPoint); register(config.name, 'high');
    timestamp = Number(store.get('timestamp')) || Date.now();
    timestampListener = store.on('timestamp', () => { timestamp = Number(store.get('timestamp')); });
    timer = setInterval(() => { now = Date.now(); }, 60000);
    refreshTimer = setInterval(() => { if (enabled && !document.hidden && !loading) void load(); }, 15 * 60000);
    void load();
  });
  onDestroy(() => {
    destroyed = true; generation++; request?.abort(); clearInterval(timer); clearInterval(refreshTimer);
    singleclick.off(config.name, selectPoint); release(config.name, 'high');
    if (timestampListener != null) store.off(timestampListener);
    clearOverlay(); if (pointer) map.removeLayer(pointer);
  });
</script>

{#if hidden}
  <button class="restore" on:click={() => hidden = false}>🌫 Jordan Dust & Fog</button>
{:else}
  <section class="panel" aria-label="Jordan Dust and Fog">
    <header><div><strong>Jordan Dust & Fog</strong><small>Experimental · v0.1.0</small></div>
      <button title="Minimize panel" aria-label="Minimize panel" on:click={() => hidden = true}>−</button></header>
    <div class="controls">
      <label><input type="checkbox" bind:checked={enabled} on:change={toggleEnabled} />On</label>
      <label><input type="checkbox" bind:checked={showDust} />Dust map</label>
      <button disabled={!enabled || loading} on:click={load}>{loading ? 'Loading…' : 'Refresh'}</button>
    </div>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if stale}<p class="error">Forecast expired or model run older than 36 hours. Layer hidden.</p>{/if}
    <label class="place">Location
      <select value={selected.name} on:change={(event) => { const place = places.find(p => p.name === event.currentTarget.value); if (place) { selectPoint(place); map.panTo([place.lat, place.lon]); } }}>
        {#if !places.some(p => p.name === selected.name)}<option>{selected.name}</option>{/if}
        {#each places as place}<option value={place.name}>{place.name}</option>{/each}
      </select>
    </label>
    <small>Or click the map · {selected.lat.toFixed(3)}°N, {selected.lon.toFixed(3)}°E</small>
    <div class="reading">
      <span>Forecast surface dust</span>
      <strong>{format(sample?.dustSurface)}{#if sample?.dustSurface != null}<small> µg/m³</small>{/if}</strong>
      {#if frame}<small>{displayTime(frame.start)} – {displayTime(frame.end)} · 3-hour mean</small>
      {:else}<small>{enabled ? 'No supported forecast at the selected Windy time' : 'Plugin disabled'}</small>{/if}
    </div>
    <dl><div><dt>Fine dust (PM₂.₅ component)</dt><dd>{format(sample?.dustFine)}{sample?.dustFine != null ? ' µg/m³' : ''}</dd></div>
      <div><dt>Dust optical depth</dt><dd>{format(sample?.dustAod, 2)}</dd></div></dl>
    {#if sample}<small>Nearest GEOS cell: {sample.lat.toFixed(3)}°N, {sample.lon.toFixed(3)}°E</small>{/if}
    {#if showDust}<div class="legend" aria-label="Surface dust concentration scale">
      <span style="--color:#fde0a3">0–100</span><span style="--color:#f9a825">100–300</span>
      <span style="--color:#e36c23">300–1,000</span><span style="--color:#b64231">≥1,000</span>
    </div><small>µg/m³ · display bins, not warning levels · blank cells may be unknown</small>{/if}
    <details><summary>Available forecast intervals</summary>
      {#if forecast && !stale}<div class="timeline">{#each forecast.frames as item}
        <button class:active={frame === item} on:click={() => store.set('timestamp', Date.parse(item.validTime))}>{displayTime(item.validTime)}</button>
      {/each}</div>{:else}<p>Forecast unavailable.</p>{/if}
    </details>
    <div class="pending"><strong>Fog forecast</strong><span>Not connected</span><strong>Satellite observations</strong><span>Not connected</span></div>
    <details><summary>Sources and interpretation</summary>
      <p>NASA GEOS-FP · 0.25° latitude × 0.3125° longitude. The buffered region includes Jordan and neighbouring areas. Native grid cells and nearest-cell point values are shown.</p>
      <p>Surface dust is modelled dust mass, not total PM₁₀. Optical depth represents the whole atmospheric column; it is not surface visibility.</p>
      <p>No ground confirmation, calibrated alert thresholds or notifications are implemented in this first version. Satellite low cloud will require ground evidence to confirm fog.</p>
      <p><a href="https://view.eumetsat.int/" target="_blank" rel="noopener noreferrer">Open EUMETSAT imagery viewer ↗</a> (external viewer; imagery is not analysed by this plugin).</p>
    </details>
    {#if forecast}<footer>Run {displayTime(forecast.runTime)}<br />Retrieved {displayTime(forecast.retrievedAt)}<br />Times use your device timezone.</footer>{/if}
  </section>
{/if}

<style>
  .panel,.restore{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}
  .panel{width:290px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}
  .restore{padding:12px}header{display:flex;justify-content:space-between;gap:10px}header strong{font-size:17px}small{display:block;font-size:11px;color:#bbcad6}button,select{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 8px;cursor:pointer}button:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible{outline:2px solid #f9a825;outline-offset:2px}.controls{display:flex;align-items:center;justify-content:space-between;margin:14px 0;gap:5px}label{display:flex;align-items:center;gap:4px}.place{justify-content:space-between;margin-bottom:5px}.reading{background:#21384a;border-radius:10px;padding:12px;margin:12px 0}.reading>strong{display:block;font-size:28px}.reading strong small{display:inline;font-size:14px}.reading span{font-size:12px}dl{margin:10px 0}dl>div{display:flex;justify-content:space-between;gap:8px;margin:5px 0}dt{font-size:11px;color:#bbcad6}dd{margin:0;font-size:12px}.legend{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin:14px 0 3px}.legend span{border-top:7px solid var(--color);padding-top:3px;font-size:10px}.pending{display:grid;grid-template-columns:1fr auto;gap:6px;border-top:1px solid #42586b;margin-top:12px;padding-top:12px;font-size:12px}.pending span{color:#bbcad6}.error{background:#692f30;padding:9px;border-radius:7px;font-size:12px}details{margin-top:12px}summary{cursor:pointer;font-size:12px}details p{font-size:11px;color:#bbcad6}a{color:#ffd486}.timeline{display:flex;gap:5px;flex-wrap:wrap;max-height:180px;overflow:auto;margin-top:8px}.timeline button{font-size:10px}.timeline .active{border-color:#f9a825}footer{font-size:10px;color:#bbcad6;border-top:1px solid #42586b;margin-top:12px;padding-top:8px}
  @media(max-width:600px){.panel{bottom:100px;width:270px;max-height:55dvh}.restore{bottom:100px}}
</style>
