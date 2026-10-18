<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import config from './pluginConfig';
  import { ContourOverlay, CONTOUR_FIELDS, PRESSURE_LEVELS, defaultContours, safeContourOptions } from './contours.mjs';
  import { CONTOUR_PALETTES } from './contourPalettes.mjs';
  const legendStops = (key: string) => [...CONTOUR_PALETTES[key]].reverse();
  let options: any = defaultContours(), layer: any = null, enabled = true, hidden = false, destroyed = false;
  let timestamp = Date.now(), status: any = { loading: false, errors: [], active: [] };
  let listener: any, timer: any, clock: any, animation = 0, observer: ResizeObserver | null = null;
  const displayTime = (value: any) => new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  $: if (layer) layer.set(options, timestamp, enabled);
  function save() { try { localStorage.setItem('synoptic-atlas.options.v1', JSON.stringify(options)); } catch {} }
  function preset() {
    options = { ...options, gh: { ...options.gh, on: true, level: 500 }, temp: { ...options.temp, on: true, level: 850 } };
    save();
  }
  function clear() { options = { ...options, ...Object.fromEntries(Object.keys(CONTOUR_FIELDS).map(k => [k, { ...options[k], on: false }])) }; save(); }
  function render() {
    if (destroyed || animation) return;
    animation = requestAnimationFrame(() => { animation = 0; layer?.paint(); });
  }
  export const onopen = () => { hidden = false; };
  onMount(() => {
    try { options = safeContourOptions(JSON.parse(localStorage.getItem('synoptic-atlas.options.v1') || 'null')); } catch {}
    timestamp = Number(store.get('timestamp')) || Date.now();
    layer = new ContourOverlay({ map, onChange: value => { status = value; }, onRender: render });
    listener = store.on('timestamp', () => { timestamp = Number(store.get('timestamp')); });
    map.on('move', render); map.on('zoom', render); map.on('resize', render);
    if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(render); observer.observe(map.getContainer()); }
    timer = setInterval(() => { if (enabled && !document.hidden) layer?.refresh(); }, 300000);
    clock = setInterval(render, 60000); render();
  });
  onDestroy(() => {
    destroyed = true; layer?.destroy(); layer = null; if (animation) cancelAnimationFrame(animation);
    clearInterval(timer); clearInterval(clock); observer?.disconnect();
    map.off('move', render); map.off('zoom', render); map.off('resize', render);
    if (listener != null) store.off(listener);
  });
</script>

{#if hidden}
  <button class="restore" on:click={() => hidden = false}>Synoptic Atlas</button>
{:else}
  <section class="panel" aria-label="Synoptic Atlas">
    <header><div><strong>{config.title}</strong><small>Weather isolines · v{config.version}</small></div><button aria-label="Minimize panel" on:click={() => hidden = true}>−</button></header>
    <div class="toolbar"><button on:click={preset} disabled={!enabled}>Synoptic preset</button><button on:click={clear}>Clear all</button><label><input aria-label="Enable isolines" type="checkbox" bind:checked={enabled} />On</label></div>
    {#each Object.keys(CONTOUR_FIELDS) as key}
      <div class="row">
        <label class="toggle"><input aria-label={CONTOUR_FIELDS[key].label + ' isolines'} type="checkbox" bind:checked={options[key].on} on:change={save} disabled={!enabled} /><span>{CONTOUR_FIELDS[key].label}</span></label>
        <div class="settings">
          <select aria-label={CONTOUR_FIELDS[key].label + ' pressure level'} bind:value={options[key].level} on:change={save} disabled={!enabled}>{#each PRESSURE_LEVELS as level}<option value={level}>{level} hPa</option>{/each}</select>
          <label>Every<select aria-label={CONTOUR_FIELDS[key].label + ' contour spacing'} bind:value={options[key].step} on:change={save} disabled={!enabled}>{#each CONTOUR_FIELDS[key].steps as step}<option value={step}>{step} {key === 'temp' ? '°C' : CONTOUR_FIELDS[key].units}</option>{/each}</select></label>
        </div>
        <details class="legend"><summary>{CONTOUR_FIELDS[key].label} colors ({key === 'temp' ? '°C' : 'dam'})</summary>
          <div class="scale" aria-label={CONTOUR_FIELDS[key].label + ' color legend'}>
            {#each legendStops(key) as [value, color]}<div class="swatch"><span style={'background:' + color}></span><b>{value}</b></div>{/each}
          </div>
          <small>{key === 'temp' ? 'Temperature' : 'Height'} colors follow contour values. Values outside the legend use its end colors.</small>
        </details>
      </div>
    {/each}
    <label class="toggle labels"><input aria-label="Contour labels" type="checkbox" bind:checked={options.labels} on:change={save} />Show labels with levels and units</label>
    {#if status.loading}<p role="status">Loading GEOS isolines…</p>{/if}
    {#each status.errors as message}<p class="error" role="alert">{message}</p>{/each}
    {#if status.validTime && status.active.length}<p class="stamp" data-testid="contour-time">Valid {displayTime(status.validTime)}<small>GEOS run {new Date(status.runTime).toISOString().slice(0, 16).replace('T', ' ')} UTC</small></p>
    {:else if !status.loading && !status.errors.length}<p class="hint">{enabled ? 'Tick any layer, or choose Synoptic preset to show both layers.' : 'Isolines disabled.'}</p>{/if}
    <small>Forecast time: {displayTime(timestamp)} · device timezone</small>
    <button class="refresh" on:click={() => layer?.refresh()} disabled={!enabled || status.loading}>Refresh</button>
    <details><summary>Source and interpretation</summary><p>NASA GEOS-FP, sampled on a 1.25° grid. Three-hourly instantaneous snapshots follow the nearest available time within 90 minutes of Windy's timeline. Exact valid time and source run are shown above.</p><p>Height: dam (1 dam = 10 m). Temperature: Celsius. Upper-air values below terrain are masked; missing cells leave gaps. Forecast availability depends on the source cycle.</p><p>Each checkbox is independent. These layers share the map with Windy's selected background and do not change its forecast model or native isolines.</p></details>
  </section>
{/if}
<style>
  .panel,.restore{position:fixed;left:12px;bottom:95px;z-index:1100;background:#142536;color:#f0f5f8;border:1px solid #42586b;border-radius:14px;box-shadow:0 8px 28px #0005;font:13px/1.5 system-ui,sans-serif}.panel{width:320px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;padding:16px;box-sizing:border-box}.restore{padding:12px}header{display:flex;justify-content:space-between;gap:10px}header strong{font-size:20px}small{display:block;font-size:11px;color:#bbcad6}
  button,select,input{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:7px;padding:5px 7px}button,select{cursor:pointer}button:disabled,select:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #f9a825;outline-offset:2px}label{display:flex;align-items:center;gap:4px}input[type=checkbox]{accent-color:#f9a825}.toolbar{display:flex;align-items:center;gap:6px;margin:14px 0}.toolbar button{font-size:11px}.toolbar label{margin-left:auto}.row{border-top:1px solid #42586b;padding:12px 0}.toggle{font-size:12px;gap:7px}.settings{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-top:8px}.settings label{font-size:11px}.settings select{font-size:11px;padding:4px}.settings input[type=color]{width:30px;height:28px;padding:2px;flex-shrink:0}.labels{border-top:1px solid #42586b;padding-top:12px}.stamp{background:#21384a;padding:10px;border-radius:8px;font-size:12px}.error{background:#692f30;padding:9px;border-radius:7px;font-size:12px}.hint,details p{font-size:11px;color:#bbcad6}.refresh{margin:10px 0}summary{cursor:pointer;font-size:12px}
  .legend{margin-top:10px}.scale{display:grid;grid-template-columns:repeat(3,1fr);gap:3px 8px;margin:8px 0}.swatch{display:flex;align-items:center;gap:5px;font-size:10px}.swatch span{display:block;width:24px;height:9px;border:1px solid #789}.swatch b{font-weight:500}
  @media(max-width:600px){.panel{bottom:100px;width:295px;max-height:72dvh;padding:12px}.restore{bottom:100px}}
</style>
