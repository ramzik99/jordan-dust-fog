<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import { register, release, singleclick } from '@windy/singleclick';
  import config from './pluginConfig';
  import { validateManifest, validateFrame, decodeFrameResponse, frameAt, samplePoint, wrapLongitude, MAX_RUN_AGE_MS } from './forecast.mjs';
  import { drawGlobalGrid } from './globalMap.mjs';
  declare const L: any;
  const BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/main/data/global/';
  const places = [
    { name: 'Amman', lat: 31.95, lon: 35.93 }, { name: 'Fuheis', lat: 32.01, lon: 35.77 },
    { name: 'London', lat: 51.51, lon: -0.13 }, { name: 'New York', lat: 40.71, lon: -74.01 },
    { name: 'Delhi', lat: 28.61, lon: 77.21 }, { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Cape Town', lat: -33.92, lon: 18.42 }, { name: 'São Paulo', lat: -23.55, lon: -46.63 },
  ];
  let forecast: any = null, activeFrame: any = null;
  let enabled = true, showDust = true, hidden = false, loading = false, frameLoading = false, destroyed = false;
  let error = '', frameError = '', locationError = '', timestamp = Date.now(), now = Date.now();
  let selected = places[0], inputLat = selected.lat, inputLon = selected.lon;
  let canvas: HTMLCanvasElement | null = null, pointer: any = null, drawRequest = 0;
  let manifestAbort: AbortController | null = null, frameAbort: AbortController | null = null;
  let timer: any, refreshTimer: any, timestampListener: any, resizeObserver: ResizeObserver | null = null;
  let manifestEpoch = 0, frameEpoch = 0, frameKey = '';
  const frames = new Map<string, any>();
  const displayTime = (value: any) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const format = (value: any, digits = 0) => value === null || value === undefined ? 'Unavailable' : value.toFixed(digits);
  $: stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now);
  $: desired = enabled && !stale ? frameAt(forecast, timestamp) : null;
  $: void syncFrame(forecast, desired, enabled, stale);
  $: sample = forecast && desired && activeFrame && activeFrame.validTime === desired.validTime
    ? samplePoint(forecast, activeFrame, selected.lat, selected.lon) : null;
  $: if (canvas) scheduleRender(forecast, activeFrame, enabled, showDust, stale, desired);

  function scheduleRender(..._args: any[]) {
    if (destroyed || !canvas || drawRequest) return;
    drawRequest = requestAnimationFrame(paint);
  }
  function paint() {
    drawRequest = 0;
    if (!canvas || destroyed) return;
    const size = map.getSize(), ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, size.x), height = Math.max(1, size.y);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    }
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const visible = enabled && showDust && !stale && desired && activeFrame?.validTime === desired.validTime;
    drawGlobalGrid(ctx, map, visible ? forecast : null, visible ? activeFrame : null, width, height);
  }
  function selectPoint(value: any) {
    if (!enabled) return;
    const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
    const rawLon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;
    if (typeof lat !== 'number' || typeof rawLon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(rawLon) || lat < -90 || lat > 90) {
      locationError = 'Enter a latitude from −90 to 90 and a finite longitude.'; return;
    }
    const lon = wrapLongitude(rawLon); locationError = '';
    selected = { name: value.name || 'Selected location', lat, lon }; inputLat = lat; inputLon = lon;
    if (pointer) map.removeLayer(pointer);
    if (typeof L !== 'undefined') pointer = L.circleMarker([Math.max(-85, Math.min(85, lat)), lon], {
      radius: 6, color: '#fff', fillColor: '#183047', fillOpacity: 1, weight: 2,
    }).addTo(map);
  }
  function goToCoordinates() {
    selectPoint({ lat: inputLat, lon: inputLon });
    if (!locationError && enabled) map.panTo([Math.max(-85, Math.min(85, selected.lat)), selected.lon]);
  }
  function stopFrame() {
    frameEpoch++; frameAbort?.abort(); frameAbort = null; frameKey = ''; frameLoading = false; activeFrame = null;
  }
  function toggleEnabled() {
    if (enabled) { register(config.name, 'high'); if (!forecast) void load(); }
    else {
      release(config.name, 'high'); manifestEpoch++; manifestAbort?.abort(); loading = false; stopFrame();
      if (pointer) { map.removeLayer(pointer); pointer = null; }
    }
  }
  async function syncFrame(data: any, descriptor: any, on: boolean, expired: boolean) {
    if (!on || expired || !data || !descriptor) { stopFrame(); return; }
    const key = data.runTime + ':' + descriptor.validTime;
    if (frameKey === key && (activeFrame || frameLoading)) return;
    stopFrame(); const epoch = ++frameEpoch; frameKey = key; frameError = '';
    const cached = frames.get(key);
    if (cached) {
      try { activeFrame = validateFrame(cached, data, descriptor); frames.delete(key); frames.set(key, cached); return; }
      catch { frames.delete(key); }
    }
    const abort = new AbortController(); frameAbort = abort; frameLoading = true;
    const timeout = setTimeout(() => abort.abort(), 30000);
    try {
      const response = await fetch(BASE + descriptor.path, { signal: abort.signal });
      if (!response.ok) throw Error('Forecast period unavailable (HTTP ' + response.status + ')');
      const decoded = await decodeFrameResponse(response);
      const frame = validateFrame(decoded, data, descriptor);
      if (destroyed || epoch !== frameEpoch || !enabled) return;
      frames.set(key, frame); while (frames.size > 4) frames.delete(frames.keys().next().value);
      activeFrame = frame;
    } catch (err: any) {
      if (destroyed || epoch !== frameEpoch) return;
      frameError = err?.name === 'AbortError' ? 'Forecast period request timed out.' : String(err?.message || err);
      activeFrame = null; frameKey = '';
    } finally { clearTimeout(timeout); if (epoch === frameEpoch) frameLoading = false; }
  }
  async function load() {
    manifestAbort?.abort(); const abort = new AbortController(); manifestAbort = abort;
    const epoch = ++manifestEpoch; loading = true; error = ''; frameError = '';
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch(BASE + 'latest.json?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });
      if (!response.ok) throw Error(response.status === 404 ? 'Global forecast not yet available. Global ingestion must succeed first.' : 'Forecast server returned HTTP ' + response.status);
      const text = await response.text();
      if (text.length > 100000) throw Error('Forecast manifest exceeds size limit');
      const loaded = validateManifest(JSON.parse(text));
      if (forecast && Date.parse(loaded.runTime) < Date.parse(forecast.runTime)) throw Error('Server returned an older model run');
      if (destroyed || epoch !== manifestEpoch || !enabled) return;
      stopFrame(); if (forecast?.runTime !== loaded.runTime) frames.clear();
      forecast = loaded; now = Date.now();
    } catch (err: any) {
      if (destroyed || epoch !== manifestEpoch) return;
      error = err?.name === 'AbortError' ? 'Forecast request timed out or was cancelled.' : String(err?.message || err);
      forecast = null; stopFrame();
    } finally { clearTimeout(timeout); if (epoch === manifestEpoch) loading = false; }
  }
  export const onopen = (params: unknown) => {
    hidden = false; if (enabled) register(config.name, 'high'); if (params) selectPoint(params);
  };
  onMount(() => {
    canvas = document.createElement('canvas');
    Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', zIndex: '390' });
    canvas.setAttribute('aria-hidden', 'true'); map.getContainer().appendChild(canvas);
    singleclick.on(config.name, selectPoint); register(config.name, 'high');
    timestamp = Number(store.get('timestamp')) || Date.now();
    timestampListener = store.on('timestamp', () => { timestamp = Number(store.get('timestamp')); });
    map.on('move', scheduleRender); map.on('zoom', scheduleRender); map.on('resize', scheduleRender);
    if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(() => scheduleRender()); resizeObserver.observe(map.getContainer()); }
    timer = setInterval(() => { now = Date.now(); }, 60000);
    refreshTimer = setInterval(() => { if (enabled && !document.hidden && !loading) void load(); }, 15 * 60000);
    void load();
  });
  onDestroy(() => {
    destroyed = true; manifestEpoch++; manifestAbort?.abort(); stopFrame(); frames.clear();
    clearInterval(timer); clearInterval(refreshTimer);
    if (drawRequest) cancelAnimationFrame(drawRequest); resizeObserver?.disconnect(); canvas?.remove(); canvas = null;
    map.off('move', scheduleRender); map.off('zoom', scheduleRender); map.off('resize', scheduleRender);
    singleclick.off(config.name, selectPoint); release(config.name, 'high');
    if (timestampListener != null) store.off(timestampListener);
    if (pointer) map.removeLayer(pointer);
  });
</script>

{#if hidden}
  <button class="restore" on:click={() => hidden = false}>🌫 Global Dust & Fog</button>
{:else}
  <section class="panel" aria-label="Global Dust and Fog">
    <header><div><strong>Global Dust & Fog</strong><small>Experimental · v0.2.0</small></div>
      <button title="Minimize panel" aria-label="Minimize panel" on:click={() => hidden = true}>−</button></header>
    <div class="controls">
      <label><input type="checkbox" bind:checked={enabled} on:change={toggleEnabled} />On</label>
      <label><input type="checkbox" bind:checked={showDust} />Dust map</label>
      <button disabled={!enabled || loading} on:click={load}>{loading ? 'Loading…' : 'Refresh'}</button>
    </div>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if frameError}<p class="error" role="alert">{frameError}</p>{/if}
    {#if frameLoading}<p role="status">Loading selected global forecast period…</p>{/if}
    {#if stale}<p class="error">Forecast expired or model run older than 36 hours. Layer hidden.</p>{/if}
    <label class="place">Location
      <select value={selected.name} on:change={(event) => { const place = places.find(p => p.name === event.currentTarget.value); if (place) { selectPoint(place); map.panTo([place.lat, place.lon]); } }}>
        {#if !places.some(p => p.name === selected.name)}<option>{selected.name}</option>{/if}
        {#each places as place}<option value={place.name}>{place.name}</option>{/each}
      </select>
    </label>
    <small>Click anywhere on the globe or enter coordinates.</small>
    <div class="coordinates"><label>Lat <input aria-label="Latitude" type="number" min="-90" max="90" step="any" bind:value={inputLat} /></label><label>Lon <input aria-label="Longitude" type="number" step="any" bind:value={inputLon} /></label><button on:click={goToCoordinates} disabled={!enabled}>Go</button></div>
    {#if locationError}<p class="error">{locationError}</p>{/if}
    <small>{selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}° · signed latitude / longitude</small>
    <small>1.25° sampled overview · periods load on demand</small>
    <div class="reading">
      <span>Forecast surface dust · global overview</span>
      <strong>{format(sample?.dustSurface)}{#if sample?.dustSurface != null}<small> µg/m³</small>{/if}</strong>
      {#if desired}<small>{displayTime(desired.start)} – {displayTime(desired.end)} · 3-hour mean</small>
      {:else}<small>{enabled ? 'No supported forecast at the selected Windy time' : 'Plugin disabled'}</small>{/if}
    </div>
    <dl><div><dt>Fine dust (PM₂.₅ component)</dt><dd>{format(sample?.dustFine)}{sample?.dustFine != null ? ' µg/m³' : ''}</dd></div>
      <div><dt>Dust optical depth</dt><dd>{format(sample?.dustAod, 2)}</dd></div></dl>
    {#if sample}<small>Nearest sampled GEOS node: {sample.lat.toFixed(3)}°, {sample.lon.toFixed(3)}°</small>{/if}
    {#if showDust}<div class="legend" aria-label="Surface dust concentration scale">
      <span style="--color:#fde0a3">0–100</span><span style="--color:#f9a825">100–300</span>
      <span style="--color:#e36c23">300–1,000</span><span style="--color:#b64231">≥1,000</span>
    </div><small>µg/m³ · display bins, not warning levels · blank cells may be unknown</small>{/if}
    <details><summary>Available forecast intervals</summary>
      {#if forecast && !stale}<div class="timeline">{#each forecast.frames as item}
        <button class:active={desired === item} on:click={() => store.set('timestamp', Date.parse(item.validTime))}>{displayTime(item.validTime)}</button>
      {/each}</div>{:else}<p>Forecast unavailable.</p>{/if}
    </details>
    <div class="pending"><strong>Fog forecast</strong><span>Not connected</span><strong>Satellite observations</strong><span>Not connected</span></div>
    <details><summary>Sources and interpretation</summary>
      <p>Global NASA GEOS-FP · preview samples a 1.25° × 1.25° grid from the native 0.25° × 0.3125° model. Values are sampled nodes, not cell averages or street-level detail. Map cells represent the overview grid; polar values are available by coordinates, while the Mercator map stops near 85°.</p>
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
  .coordinates{display:flex;gap:5px;margin:8px 0}.coordinates label{font-size:11px;min-width:0}.coordinates input{width:68px;max-width:100%;box-sizing:border-box;color:inherit;background:#253d50;border:1px solid #526879;border-radius:6px;padding:5px}
  @media(max-width:600px){.panel{bottom:100px;width:270px;max-height:55dvh}.restore{bottom:100px}}
</style>
