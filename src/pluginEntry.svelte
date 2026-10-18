<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import { register, release, singleclick } from '@windy/singleclick';
  import config from './pluginConfig';
  import { frameAt, samplePoint, wrapLongitude, MAX_RUN_AGE_MS } from './forecast.mjs';
  import { DATA_BASE, NATIVE_GRID, NativeForecast, validateDustManifest } from './nativeDust.mjs';
  import { FIELD_INFO, PALETTE, makeTexture, drawTexture, thresholdState } from './dustDisplay.mjs';
  import { SATELLITES, satelliteMetadata, satelliteFrame, closeSatellite, drawSatellite } from './satellite.mjs';
  import { ContourOverlay, CONTOUR_FIELDS, PRESSURE_LEVELS, defaultContours, safeContourOptions } from './contours.mjs';
  declare const L: any;
  const places = [
    { name: 'Amman', lat: 31.95, lon: 35.93 }, { name: 'Fuheis', lat: 32.01, lon: 35.77 },
    { name: 'London', lat: 51.51, lon: -0.13 }, { name: 'New York', lat: 40.71, lon: -74.01 },
    { name: 'Delhi', lat: 28.61, lon: 77.21 }, { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Cape Town', lat: -33.92, lon: 18.42 }, { name: 'São Paulo', lat: -23.55, lon: -46.63 },
  ];
  let forecast: any = null, activeFrame: any = null, texture: HTMLCanvasElement | null = null;
  let enabled = true, showDust = true, hidden = false, view = 'forecast', field = 'dustSurface', opacity = .65;
  let loading = false, frameLoading = false, destroyed = false, mounted = false;
  let error = '', frameError = '', locationError = '', timestamp = Date.now(), now = Date.now();
  let selected = places[0], inputLat = selected.lat, inputLon = selected.lon, threshold = 100;
  let saved: any[] = [];
  let contourOptions: any = defaultContours(), contourLayer: any = null;
  let contourStatus: any = { loading: false, errors: [], active: [] };
  let canvas: HTMLCanvasElement | null = null, pointer: any = null, drawRequest = 0;
  let manifestAbort: AbortController | null = null, frameAbort: AbortController | null = null, seriesAbort: AbortController | null = null;
  let manifestEpoch = 0, frameEpoch = 0, seriesEpoch = 0, frameKey = '', seriesRows: any[] = [], seriesLoading = false, seriesDone = 0;
  let timer: any, refreshTimer: any, timestampListener: any, resizeObserver: ResizeObserver | null = null;
  const native = new NativeForecast({ cacheSize: window.innerWidth < 600 ? 1 : 2 });
  let satSource = 'global', satTime = '', satMeta: any = null, satFrame: any = null;
  let satError = '', satLoading = false, satMetaLoading = false, followLatest = true;
  let satMetaAbort: AbortController | null = null, satAbort: AbortController | null = null;
  let satMetaEpoch = 0, satEpoch = 0, satelliteTimer: any;
  const displayTime = (value: any) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const format = (value: any, digits = 1) => value === null || value === undefined || !Number.isFinite(value) ? 'Unavailable'
    : value > 0 && value < 10 ** -digits ? '<' + (10 ** -digits).toFixed(digits) : value.toFixed(digits);
  $: stale = !!forecast && (now - Date.parse(forecast.runTime) > MAX_RUN_AGE_MS || Date.parse(forecast.frames.at(-1).end) <= now);
  $: desired = enabled && !stale ? frameAt(forecast, timestamp) : null;
  $: void syncFrame(forecast, desired, enabled && view === 'forecast', stale);
  $: sample = desired && activeFrame && activeFrame.validTime === desired.validTime ? samplePoint(NATIVE_GRID, activeFrame, selected.lat, selected.lon) : null;
  $: syncTexture(activeFrame, field);
  $: guidance = thresholdState(sample?.dustSurface ?? null, threshold);
  $: satDelayed = !!satMeta && now - Date.parse(satMeta.latest) > SATELLITES[satSource].maxAge;
  $: if (canvas) scheduleRender(texture, enabled, showDust, stale, desired, view, satFrame, satTime, satSource, opacity);
  $: if (mounted && contourLayer) contourLayer.set(contourOptions, timestamp, enabled);

  function savePreferences() {
    try { localStorage.setItem('geos-dust.preferences.v1', JSON.stringify({ selected, threshold, field, opacity, saved, contourOptions })); } catch {}
  }
  function restorePreferences() {
    try {
      const p = JSON.parse(localStorage.getItem('geos-dust.preferences.v1') || 'null');
      if (!p) return;
      contourOptions = safeContourOptions(p.contourOptions);
      if (p.selected && Number.isFinite(p.selected.lat) && Math.abs(p.selected.lat) <= 90 && Number.isFinite(p.selected.lon)) {
        selected = { name: String(p.selected.name || 'Saved location').slice(0, 80), lat: p.selected.lat, lon: wrapLongitude(p.selected.lon) };
        inputLat = selected.lat; inputLon = selected.lon;
      }
      if (Number.isFinite(p.threshold) && p.threshold > 0) threshold = p.threshold;
      if (FIELD_INFO[p.field]) field = p.field;
      if (Number.isFinite(p.opacity) && p.opacity >= .15 && p.opacity <= 1) opacity = p.opacity;
      saved = Array.isArray(p.saved) ? p.saved.filter(v => Number.isFinite(v.lat) && Math.abs(v.lat) <= 90 && Number.isFinite(v.lon)).slice(0, 8) : [];
    } catch {}
  }
  function savePlace() {
    if (saved.some(p => p.lat === selected.lat && p.lon === selected.lon)) saved = saved.filter(p => p.lat !== selected.lat || p.lon !== selected.lon);
    else saved = [...saved.slice(-7), { ...selected }];
    savePreferences();
  }
  function synopticPreset() {
    contourOptions = { ...contourOptions, gh: { ...contourOptions.gh, on: true, level: 500 },
      temp: { ...contourOptions.temp, on: true, level: 850 }, mslp: { ...contourOptions.mslp, on: true } };
    savePreferences();
  }
  function clearContours() {
    contourOptions = { ...contourOptions, ...Object.fromEntries(Object.keys(CONTOUR_FIELDS).map(k => [k, { ...contourOptions[k], on: false }])) };
    savePreferences();
  }
  function refreshAll() { contourLayer?.refresh(); return view === 'forecast' ? load() : refreshSatellite(); }
  function cancelSeries() { seriesEpoch++; seriesAbort?.abort(); seriesAbort = null; seriesLoading = false; }
  function selectPoint(value: any) {
    if (!enabled) return;
    const lat = value?.lat ?? value?.latitude ?? value?.latlng?.lat;
    const rawLon = value?.lon ?? value?.lng ?? value?.longitude ?? value?.latlng?.lng;
    if (typeof lat !== 'number' || typeof rawLon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(rawLon) || Math.abs(lat) > 90) {
      locationError = 'Enter latitude from −90 to 90 and a finite longitude.'; return;
    }
    cancelSeries(); seriesRows = []; seriesDone = 0;
    const lon = wrapLongitude(rawLon); locationError = '';
    selected = { name: typeof value.name === 'string' ? value.name.slice(0, 80) : `Point ${lat.toFixed(3)}, ${lon.toFixed(3)}`, lat, lon }; inputLat = lat; inputLon = lon;
    if (pointer) map.removeLayer(pointer);
    if (typeof L !== 'undefined') pointer = L.circleMarker([Math.max(-85, Math.min(85, lat)), lon], { radius: 6, color: '#fff', fillColor: '#183047', fillOpacity: 1, weight: 2 }).addTo(map);
    savePreferences();
  }
  function goToCoordinates() {
    selectPoint({ lat: inputLat, lon: inputLon });
    if (!locationError && enabled) map.panTo([Math.max(-85, Math.min(85, selected.lat)), selected.lon]);
  }
  function syncTexture(frame: any, selectedField: string) {
    if (texture) { texture.width = 1; texture.height = 1; texture = null; }
    if (frame) texture = makeTexture(NATIVE_GRID, frame, selectedField);
  }
  function scheduleRender(..._args: any[]) {
    if (destroyed || !canvas || drawRequest) return;
    drawRequest = requestAnimationFrame(paint);
  }
  function paint() {
    drawRequest = 0; if (!canvas || destroyed) return;
    const size = map.getSize(), ratio = Math.min(window.devicePixelRatio || 1, 2), width = Math.max(1, size.x), height = Math.max(1, size.y);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    try {
      if (view === 'satellite') drawSatellite(ctx, map, enabled && satFrame?.source === satSource && satFrame?.time === satTime ? satFrame : null, width, height, opacity);
      else drawTexture(ctx, map, NATIVE_GRID, enabled && showDust && !stale && desired && activeFrame?.validTime === desired.validTime ? texture : null, width, height, opacity);
    } catch { ctx.clearRect(0, 0, width, height); }
    contourLayer?.paint();
  }
  function stopFrame() { frameEpoch++; frameAbort?.abort(); frameAbort = null; frameKey = ''; frameLoading = false; activeFrame = null; }
  async function syncFrame(data: any, descriptor: any, on: boolean, expired: boolean) {
    if (!on || expired || !data || !descriptor) { stopFrame(); return; }
    const key = native.key(data, descriptor);
    if (frameKey === key && (activeFrame || frameLoading)) return;
    stopFrame(); const epoch = ++frameEpoch, abort = new AbortController(); frameAbort = abort;
    frameKey = key; frameError = ''; frameLoading = true;
    try {
      const frame = await native.get(data, descriptor, abort.signal);
      if (!destroyed && epoch === frameEpoch && enabled && view === 'forecast') activeFrame = frame;
    } catch (err: any) {
      if (destroyed || epoch !== frameEpoch) return;
      frameError = err?.name === 'AbortError' ? 'Native forecast request timed out or was cancelled.' : String(err?.message || err);
      frameKey = ''; activeFrame = null;
    } finally { if (epoch === frameEpoch) frameLoading = false; }
  }
  async function load() {
    manifestAbort?.abort(); const abort = new AbortController(); manifestAbort = abort;
    const epoch = ++manifestEpoch; loading = true; error = ''; frameError = ''; cancelSeries(); seriesRows = [];
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const response = await fetch(DATA_BASE + 'latest.json?t=' + Math.floor(Date.now() / 300000), { signal: abort.signal });
      if (!response.ok) throw Error('GEOS forecast unavailable (HTTP ' + response.status + ')');
      const text = await response.text(); if (text.length > 150000) throw Error('Forecast index exceeds size limit');
      const product = validateDustManifest(JSON.parse(text));
      if (forecast && Date.parse(product.runTime) < Date.parse(forecast.runTime)) throw Error('Server returned an older model run');
      if (destroyed || epoch !== manifestEpoch || !enabled) return;
      stopFrame(); forecast = product; now = Date.now();
    } catch (err: any) {
      if (destroyed || epoch !== manifestEpoch) return;
      error = err?.name === 'AbortError' ? 'Forecast request timed out.' : String(err?.message || err);
      forecast = null; stopFrame();
    } finally { clearTimeout(timeout); if (epoch === manifestEpoch) loading = false; }
  }
  async function loadSeries() {
    if (!forecast || stale || !enabled) return;
    cancelSeries(); const epoch = ++seriesEpoch, abort = new AbortController(); seriesAbort = abort;
    const product = forecast, point = { ...selected };
    seriesRows = product.frames.map((d: any) => ({ ...d, value: null, state: 'pending' })); seriesDone = 0; seriesLoading = true;
    let next = 0;
    const worker = async () => {
      while (!abort.signal.aborted && !destroyed && epoch === seriesEpoch) {
        const index = next++; if (index >= product.frames.length) return;
        let value = null;
        try { value = samplePoint(NATIVE_GRID, await native.get(product, product.frames[index], abort.signal), point.lat, point.lon); } catch {}
        if (abort.signal.aborted || epoch !== seriesEpoch || destroyed) return;
        seriesRows[index] = { ...seriesRows[index], value, state: value ? 'ready' : 'unavailable' };
        seriesRows = [...seriesRows]; seriesDone++;
      }
    };
    await Promise.all([worker(), worker()]);
    if (epoch === seriesEpoch) seriesLoading = false;
  }
  function cancelSatellite() {
    satMetaEpoch++; satEpoch++; satMetaAbort?.abort(); satAbort?.abort();
    clearTimeout(satelliteTimer); satLoading = false; satMetaLoading = false;
    closeSatellite(satFrame); satFrame = null;
  }
  async function refreshSatellite() {
    if (!mounted || !enabled || view !== 'satellite') return;
    satEpoch++; satAbort?.abort(); satLoading = false;
    closeSatellite(satFrame); satFrame = null;
    satMetaAbort?.abort(); const abort = new AbortController(); satMetaAbort = abort;
    const epoch = ++satMetaEpoch, source = satSource; satMetaLoading = true; satError = '';
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const metadata = await satelliteMetadata(source, abort.signal);
      clearTimeout(timeout);
      if (destroyed || epoch !== satMetaEpoch || source !== satSource || view !== 'satellite') return;
      satMeta = metadata; now = Date.now();
      if (followLatest || !satTime) satTime = metadata.latest;
      await requestSatellite();
    } catch (err: any) {
      if (destroyed || epoch !== satMetaEpoch) return;
      satError = err?.name === 'AbortError' ? 'Satellite metadata request timed out.' : String(err?.message || err);
      satMeta = null; closeSatellite(satFrame); satFrame = null;
    } finally { clearTimeout(timeout); if (epoch === satMetaEpoch) satMetaLoading = false; }
  }
  async function requestSatellite() {
    if (!mounted || !enabled || view !== 'satellite' || !satTime || !satMeta) return;
    satAbort?.abort(); const abort = new AbortController(); satAbort = abort;
    const epoch = ++satEpoch, source = satSource, time = satTime; satLoading = true; satError = '';
    if (satFrame && (satFrame.source !== source || satFrame.time !== time)) { closeSatellite(satFrame); satFrame = null; }
    const b = map.getBounds(), size = map.getSize(), timeout = setTimeout(() => abort.abort(), 45000);
    try {
      const frame = await satelliteFrame(source, time, { south: b.getSouth(), north: b.getNorth(), west: b.getWest(), east: b.getEast() }, { width: size.x, height: size.y }, abort.signal);
      if (destroyed || epoch !== satEpoch || source !== satSource || time !== satTime || view !== 'satellite') { closeSatellite(frame); return; }
      const previous = satFrame; satFrame = frame; closeSatellite(previous);
    } catch (err: any) {
      if (destroyed || epoch !== satEpoch) return;
      satError = err?.name === 'AbortError' ? 'Satellite image request timed out.' : String(err?.message || err);
      closeSatellite(satFrame); satFrame = null;
    } finally { clearTimeout(timeout); if (epoch === satEpoch) satLoading = false; }
  }
  function mapFinished() {
    scheduleRender();
    if (view === 'satellite' && enabled) { clearTimeout(satelliteTimer); satelliteTimer = setTimeout(() => void requestSatellite(), 400); }
  }
  function changeSatellite() { cancelSatellite(); satMeta = null; satTime = ''; followLatest = true; void refreshSatellite(); }
  function setView(next: string) {
    view = next; cancelSeries(); seriesRows = [];
    if (view === 'satellite') { stopFrame(); void refreshSatellite(); }
    else { cancelSatellite(); if (!forecast) void load(); }
  }
  function toggleEnabled() {
    if (enabled) { register(config.name, 'high'); if (view === 'satellite') void refreshSatellite(); else if (!forecast) void load(); }
    else {
      release(config.name, 'high'); manifestEpoch++; manifestAbort?.abort(); loading = false; stopFrame(); cancelSeries(); cancelSatellite();
      if (pointer) { map.removeLayer(pointer); pointer = null; }
    }
  }
  export const onopen = (params: unknown) => { hidden = false; if (enabled) register(config.name, 'high'); if (params) selectPoint(params); };
  onMount(() => {
    mounted = true; restorePreferences();
    contourLayer = new ContourOverlay({ map, onChange: value => { contourStatus = value; }, onRender: scheduleRender });
    canvas = document.createElement('canvas'); canvas.dataset.geosDust = 'map';
    Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', zIndex: '390' });
    canvas.setAttribute('aria-hidden', 'true'); map.getContainer().appendChild(canvas);
    singleclick.on(config.name, selectPoint); register(config.name, 'high');
    timestamp = Number(store.get('timestamp')) || Date.now();
    timestampListener = store.on('timestamp', () => { timestamp = Number(store.get('timestamp')); });
    map.on('move', scheduleRender); map.on('zoom', scheduleRender); map.on('moveend', mapFinished); map.on('zoomend', mapFinished); map.on('resize', mapFinished);
    if (typeof ResizeObserver !== 'undefined') { resizeObserver = new ResizeObserver(mapFinished); resizeObserver.observe(map.getContainer()); }
    timer = setInterval(() => { now = Date.now(); }, 60000);
    refreshTimer = setInterval(() => { if (enabled && !document.hidden && !loading) void refreshAll(); }, 5 * 60000);
    void load();
  });
  onDestroy(() => {
    destroyed = true; mounted = false; manifestEpoch++; manifestAbort?.abort(); stopFrame(); cancelSeries(); cancelSatellite(); native.destroy();
    contourLayer?.destroy(); contourLayer = null;
    clearInterval(timer); clearInterval(refreshTimer); if (drawRequest) cancelAnimationFrame(drawRequest); resizeObserver?.disconnect();
    canvas?.remove(); canvas = null; if (texture) { texture.width = 1; texture.height = 1; texture = null; }
    map.off('move', scheduleRender); map.off('zoom', scheduleRender); map.off('moveend', mapFinished); map.off('zoomend', mapFinished); map.off('resize', mapFinished);
    singleclick.off(config.name, selectPoint); release(config.name, 'high'); if (timestampListener != null) store.off(timestampListener);
    if (pointer) map.removeLayer(pointer);
  });
</script>

{#if hidden}
  <button class="restore" on:click={() => hidden = false}>🌫 Synoptic Atlas</button>
{:else}
  <section class="panel" aria-label="Synoptic Atlas">
    <header><div><strong>Synoptic Atlas</strong><small>NASA GEOS-FP · v1.1.0</small></div><button aria-label="Minimize panel" on:click={() => hidden = true}>−</button></header>
    <nav aria-label="Dust view"><button class:active={view === 'forecast'} on:click={() => setView('forecast')}>Forecast</button><button class:active={view === 'satellite'} on:click={() => setView('satellite')}>Satellite</button><label><input aria-label="Enable plugin" type="checkbox" bind:checked={enabled} on:change={toggleEnabled} />On</label></nav>
    <details class="contour-controls"><summary>Weather isolines</summary>
      <div class="contour-presets"><button on:click={synopticPreset} disabled={!enabled}>Synoptic preset</button><button on:click={clearContours}>Clear contours</button></div>
      {#each Object.keys(CONTOUR_FIELDS) as key}
        <div class="contour-row">
          <label class="contour-check"><input aria-label={CONTOUR_FIELDS[key].label + ' isolines'} type="checkbox" bind:checked={contourOptions[key].on} on:change={savePreferences} disabled={!enabled} /><span style={'color:' + contourOptions[key].color}>{CONTOUR_FIELDS[key].label}</span></label>
          <div class="contour-settings">
            {#if key !== 'mslp'}<select aria-label={CONTOUR_FIELDS[key].label + ' pressure level'} bind:value={contourOptions[key].level} on:change={savePreferences} disabled={!enabled}>
              {#each PRESSURE_LEVELS as level}<option value={level}>{level} hPa</option>{/each}
            </select>{:else}<small>Mean sea level</small>{/if}
            <label>Every<select aria-label={CONTOUR_FIELDS[key].label + ' contour spacing'} bind:value={contourOptions[key].step} on:change={savePreferences} disabled={!enabled}>{#each CONTOUR_FIELDS[key].steps as step}<option value={step}>{step} {key === 'temp' ? 'C' : CONTOUR_FIELDS[key].units}</option>{/each}</select></label>
            <input aria-label={CONTOUR_FIELDS[key].label + ' contour color'} type="color" bind:value={contourOptions[key].color} on:change={savePreferences} disabled={!enabled} />
          </div>
        </div>
      {/each}
      <label class="contour-check"><input aria-label="Contour labels" type="checkbox" bind:checked={contourOptions.labels} on:change={savePreferences} />Show labels with levels and units</label>
      {#if contourStatus.loading}<p class="loading" role="status">Loading GEOS weather isolines.</p>{/if}
      {#each contourStatus.errors as message}<p class="error" role="alert">{message}</p>{/each}
      {#if contourStatus.validTime && contourStatus.active.length}
        <small class="contour-time" data-testid="contour-time">Contours valid {displayTime(contourStatus.validTime)}; instantaneous snapshot.<br />GEOS run {new Date(contourStatus.runTime).toISOString().slice(0, 16).replace('T', ' ')} UTC.</small>
      {/if}
      <small>Independent layers, shown together. GEOS-FP on a sampled 1.25-degree contour grid; upper-air values below terrain are masked. Height labels use dam (1 dam = 10 m), temperature uses Celsius, MSLP uses hPa.</small>
      <small>Contours follow the nearest 3-hour snapshot within 90 minutes of Windy's forecast time. Dust is a 3-hour mean; satellite observation time is independent.</small>
    </details>
    <label class="place">Place<select aria-label="Location" bind:value={selected.name} on:change={e => { const p = [...places, ...saved].find(v => v.name === e.currentTarget.value); if (p) { selectPoint(p); map.panTo([Math.max(-85, Math.min(85, p.lat)), p.lon]); } }} disabled={!enabled}>
      {#if ![...places, ...saved].some(p => p.name === selected.name)}<option value={selected.name}>{selected.name}</option>{/if}
      {#each places as p}<option value={p.name}>{p.name}</option>{/each}
      {#each saved.filter(p => !places.some(v => v.name === p.name)) as p}<option value={p.name}>{p.name}</option>{/each}
    </select></label>
    <small>Click the map or enter signed coordinates.</small>
    <div class="coordinates"><label>Lat<input aria-label="Latitude" type="number" min="-90" max="90" step="any" bind:value={inputLat} /></label><label>Lon<input aria-label="Longitude" type="number" step="any" bind:value={inputLon} /></label><button on:click={goToCoordinates} disabled={!enabled}>Go</button></div>
    {#if locationError}<p class="error" role="alert">{locationError}</p>{/if}
    <div class="point-name"><small>{selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}°</small><button on:click={savePlace} disabled={!enabled}>{saved.some(p => p.lat === selected.lat && p.lon === selected.lon) ? 'Unsave' : 'Save place'}</button></div>
    {#if view === 'forecast'}
      <div class="field-controls"><select aria-label="Dust field" bind:value={field} on:change={savePreferences}><option value="dustSurface">Surface dust</option><option value="dustFine">Fine dust · PM₂.₅ component</option><option value="dustAod">Dust optical depth</option></select><label><input aria-label="Show dust map" type="checkbox" bind:checked={showDust} />Map</label></div>
      {#if error}<p class="error" role="alert">{error}</p>{/if}
      {#if frameError}<p class="error" role="alert">{frameError}</p>{/if}
      {#if loading || frameLoading}<p class="loading" role="status">{loading ? 'Reading GEOS forecast…' : 'Loading native GEOS detail…'}</p>{/if}
      {#if stale}<p class="error">Forecast expired or model run older than 36 hours. Map hidden.</p>{/if}
      <div class="reading"><span>{FIELD_INFO[field].label} · forecast</span><strong data-testid="point-value">{format(sample?.[field], field === 'dustAod' ? 2 : 1)}{#if sample?.[field] != null}<small> {FIELD_INFO[field].units}</small>{/if}</strong>
        {#if desired}<small>{displayTime(desired.start)} – {displayTime(desired.end)} · 3-hour mean</small>{:else}<small>{enabled ? 'No forecast at the selected Windy time' : 'Plugin disabled'}</small>{/if}
      </div>
      <dl><div><dt>Surface dust</dt><dd>{format(sample?.dustSurface)} µg/m³</dd></div><div><dt>Fine dust component</dt><dd>{format(sample?.dustFine)} µg/m³</dd></div><div><dt>Dust optical depth</dt><dd>{format(sample?.dustAod, 2)}</dd></div></dl>
      <div class="threshold"><label>Point alert above<input aria-label="Dust threshold" type="number" min="1" step="10" bind:value={threshold} on:change={savePreferences} />µg/m³</label>
        <p class:met={guidance === 'met'} data-testid="threshold-state">{guidance === 'met' ? 'Above your surface-dust threshold' : guidance === 'below' ? 'Below your surface-dust threshold' : 'Threshold status unavailable'}</p><small>Custom model threshold · not an official warning or health limit.</small>
      </div>
      {#if showDust}<div class="legend">{#each FIELD_INFO[field].stops as stop, i}<span style={'--color:rgb(' + PALETTE[i].join(',') + ')'}>{stop}{i === 5 ? '+' : ''}</span>{/each}</div><small>{FIELD_INFO[field].units || 'Dimensionless'} · missing cells stay transparent</small>{/if}
      <details><summary>Forecast periods</summary><div class="timeline">{#each forecast?.frames || [] as item}<button class:active={desired === item} on:click={() => store.set('timestamp', Date.parse(item.validTime))}>{displayTime(item.validTime)}</button>{/each}</div></details>
      <details><summary>Point forecast</summary>
        {#if seriesLoading}<button on:click={cancelSeries}>Cancel download</button><small>{seriesDone}/{forecast?.frames.length || 0} periods read</small>
        {:else}<button disabled={!forecast || stale || !enabled} on:click={loadSeries}>Load full point forecast</button><small>Downloads native forecast frames; may use tens of MB.</small>{/if}
        {#if seriesRows.length}<div class="series"><table><thead><tr><th>Period start</th><th>Surface µg/m³</th><th>Fine µg/m³</th><th>AOD</th></tr></thead><tbody>{#each seriesRows as row}<tr><td><button on:click={() => store.set('timestamp', Date.parse(row.validTime))}>{displayTime(row.start)}</button></td><td>{format(row.value?.dustSurface)}</td><td>{format(row.value?.dustFine)}</td><td>{format(row.value?.dustAod, 2)}</td></tr>{/each}</tbody></table></div>{/if}
      </details>
      <small class="resolution">Native grid: 0.25° latitude × 0.3125° longitude.{#if sample} Nearest node: {sample.lat.toFixed(3)}°, {sample.lon.toFixed(3)}°.{/if}</small>
    {:else}
      <label class="place">Source<select aria-label="Satellite source" bind:value={satSource} on:change={changeSatellite}><option value="global">Global dust composite</option><option value="meteosat">Meteosat Dust RGB</option></select></label>
      <label class="place">Observed<select aria-label="Observation time" bind:value={satTime} on:change={() => { followLatest = false; void requestSatellite(); }} disabled={!satMeta}>
        {#if satTime && !satMeta?.times.includes(satTime)}<option value={satTime}>{displayTime(satTime)}</option>{/if}
        {#each satMeta?.times || [] as time}<option value={time}>{displayTime(time)}</option>{/each}
      </select></label>
      <button disabled={!satMeta} on:click={() => { followLatest = true; satTime = satMeta.latest; void requestSatellite(); }}>Latest observation</button>
      {#if satError}<p class="error" role="alert">{satError}</p>{/if}
      {#if satMetaLoading || satLoading}<p class="loading" role="status">Loading satellite observations…</p>{/if}
      {#if satTime}<p class="observation" data-testid="observation-stamp">Observed {displayTime(satTime)}</p>{/if}
      {#if satDelayed}<p class="error">The latest available imagery is delayed. Check its observation time.</p>{/if}
      <p class="explain">{satSource === 'global' ? 'Three-hour dust RGB composite from several geostationary satellites.' : 'Ten-minute Meteosat Dust RGB for Europe, Africa and the Middle East.'} Satellite coverage varies; blank areas can mean no observation.</p>
      <p class="explain">Satellite time is independent of Windy’s forecast timeline. RGB imagery supports visual dust tracking; it does not measure surface dust concentration.</p>
      <small>Imagery: <a href="https://view.eumetsat.int/" target="_blank" rel="noopener noreferrer">EUMETSAT EUMETView</a> · <a href="https://user.eumetsat.int/resources/user-guides/dust-clouds" target="_blank" rel="noopener noreferrer">Interpretation guide</a></small>
    {/if}
    <details><summary>Display and interpretation</summary>
      <label class="opacity">Map opacity<input aria-label="Map opacity" type="range" min=".15" max="1" step=".05" bind:value={opacity} on:change={savePreferences} /></label>
      <p>GEOS-FP is a forecast, not a surface observation. Native grid points are retained worldwide; small features between them may be unresolved. Values use compact 16-bit logarithmic packing for delivery, with small quantization differences. Points use the nearest source node.</p>
      <p>Surface dust is modelled mineral dust, not total PM₁₀. Fine dust is only the dust contribution to PM₂.₅. Optical depth describes the full atmospheric column and is not a visibility estimate. Threshold guidance applies to the selected point and forecast period only. There are no background notifications.</p>
      <p>Use surface observations and official warnings for decisions. Forecast accuracy and alert thresholds have not been independently validated.</p>
    </details>
    <footer><button disabled={!enabled || loading || satMetaLoading || satLoading} on:click={refreshAll}>Refresh</button>
      {#if forecast}<small>GEOS run {new Date(forecast.runTime).toISOString().slice(0, 16).replace('T', ' ')} UTC<br />Retrieved {displayTime(forecast.retrievedAt)} · display times use your device timezone</small>{/if}
    </footer>
  </section>
{/if}
<style>
  .panel,.restore{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}
  .panel{width:310px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore{padding:12px}
  header{display:flex;justify-content:space-between;gap:10px}header strong{font-size:19px}small{display:block;font-size:11px;color:#bbcad6}
  button,select,input{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 7px}button,select{cursor:pointer}button:disabled,select:disabled{opacity:.5;cursor:default}
  button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #f9a825;outline-offset:2px}label{display:flex;align-items:center;gap:4px}input[type=checkbox]{accent-color:#f9a825}
  nav{display:flex;align-items:center;gap:6px;margin:14px 0}nav label{margin-left:auto}.active{border-color:#f9a825;background:#39463d}
  .place{justify-content:space-between;margin:10px 0 5px}.place select{max-width:205px}.coordinates{display:flex;gap:5px;margin:8px 0}.coordinates label{font-size:11px;min-width:0}.coordinates input{width:75px;max-width:100%;box-sizing:border-box}.point-name{display:flex;justify-content:space-between;align-items:center;gap:5px}.point-name button{font-size:10px}
  .field-controls{display:flex;gap:5px;align-items:center;margin-top:12px}.field-controls select{min-width:0;flex:1}
  .reading{background:#21384a;border-radius:10px;padding:12px;margin:12px 0}.reading>strong{display:block;font-size:28px}.reading strong small{display:inline;font-size:14px}.reading span{font-size:12px}
  dl{margin:10px 0}dl>div{display:flex;justify-content:space-between;gap:8px;margin:5px 0}dt{font-size:11px;color:#bbcad6}dd{margin:0;font-size:12px}
  .threshold{border:1px solid #42586b;border-radius:9px;padding:9px;margin-top:12px}.threshold label{font-size:11px;justify-content:space-between}.threshold input{width:60px}.threshold p{margin:6px 0;font-size:12px}.threshold .met{background:#6d441d;color:#fff0c5;padding:5px;border-radius:5px}
  .legend{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;margin:14px 0 3px}.legend span{border-top:7px solid var(--color);padding-top:3px;font-size:10px}
  .error{background:#692f30;padding:9px;border-radius:7px;font-size:12px}.loading{font-size:12px;color:#ffd486}details{margin-top:12px}summary{cursor:pointer;font-size:12px}details p,.explain{font-size:11px;color:#bbcad6}a{color:#ffd486}
  .timeline{display:flex;gap:5px;flex-wrap:wrap;max-height:160px;overflow:auto;margin-top:8px}.timeline button{font-size:10px}.series{max-height:220px;overflow:auto;margin-top:8px}table{width:100%;border-collapse:collapse;font-size:10px}td,th{padding:4px;border-bottom:1px solid #42586b;text-align:right}td:first-child,th:first-child{text-align:left}td button{font-size:10px}
  .resolution{margin-top:12px}.observation{background:#21384a;padding:9px;border-radius:8px}.opacity{justify-content:space-between;margin-top:9px}.opacity input{width:130px}footer{border-top:1px solid #42586b;margin-top:12px;padding-top:8px}footer small{font-size:10px;margin-top:6px}
  .contour-controls{border:1px solid #42586b;border-radius:9px;padding:9px;margin:10px 0}.contour-presets{display:flex;gap:5px;margin:9px 0}.contour-presets button{font-size:10px}.contour-row{border-bottom:1px solid #42586b;padding:8px 0}.contour-check{font-size:11px;gap:6px}.contour-settings{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:6px}.contour-settings label{font-size:10px}.contour-settings select{font-size:10px;padding:4px}.contour-settings input[type=color]{width:28px;height:26px;padding:2px;flex-shrink:0}.contour-time{margin:8px 0}.contour-controls>small{margin-top:7px}
  @media(max-width:600px){.panel{bottom:100px;width:285px;max-height:62dvh;padding:12px}.restore{bottom:100px}.coordinates input{width:65px}}
</style>
