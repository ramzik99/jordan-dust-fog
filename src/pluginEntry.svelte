<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { map } from '@windy/map';
  import store from '@windy/store';
  import config from './pluginConfig';
  import { ContourOverlay, CONTOUR_FIELDS, PRESSURE_LEVELS, defaultContours, safeContourOptions } from './contours.mjs';
  import { mountControllerDock } from './controllerDock.mjs';
  let releaseDock = () => {};
  let controls: HTMLDivElement;
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
    releaseDock = mountControllerDock(controls);
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
    releaseDock();
    controls?.remove();
    destroyed = true; layer?.destroy(); layer = null; if (animation) cancelAnimationFrame(animation);
    clearInterval(timer); clearInterval(clock); observer?.disconnect();
    map.off('move', render); map.off('zoom', render); map.off('resize', render);
    if (listener != null) store.off(listener);
  });
</script>

<div class="atlas-controls" bind:this={controls}>
{#if hidden}
  <button class="restore" on:click={() => hidden = false}>Synoptic Atlas</button>
{:else}
  <section class="panel" aria-label="Synoptic Atlas">
    <header><strong>{config.title}</strong><button aria-label="Minimize panel" on:click={() => hidden = true}>−</button></header>
    {#each Object.keys(CONTOUR_FIELDS) as key}
      <div class="row">
        <label><input aria-label={CONTOUR_FIELDS[key].label + ' isolines'} type="checkbox" bind:checked={options[key].on} on:change={save} disabled={!enabled} /><span>{key === 'gh' ? 'Geopotential' : 'Temperature'}</span></label>
        <select aria-label={CONTOUR_FIELDS[key].label + ' pressure level'} bind:value={options[key].level} on:change={save} disabled={!enabled}>{#each PRESSURE_LEVELS as level}<option value={level}>{level} hPa</option>{/each}</select>
      </div>
    {/each}
    {#if status.loading}<p role="status">Loading contours…</p>{/if}
    {#each status.errors as message}<p class="error" role="alert">{message}</p>{/each}
    {#if status.validTime && status.active.length}<p class="stamp" data-testid="contour-time">Valid {displayTime(status.validTime)}</p>{/if}
    <details class="more"><summary>More</summary>
      <div class="toolbar"><button on:click={preset} disabled={!enabled}>Synoptic preset</button><button on:click={clear}>Clear all</button></div>
      <div class="switches"><label><input aria-label="Enable isolines" type="checkbox" bind:checked={enabled} />On</label><label><input aria-label="Contour labels" type="checkbox" bind:checked={options.labels} on:change={save} />Labels</label><button on:click={() => layer?.refresh()} disabled={!enabled || status.loading}>Refresh</button></div>
      {#each Object.keys(CONTOUR_FIELDS) as key}
        <label class="spacing">{key === 'gh' ? 'Height interval' : 'Temperature interval'}<select aria-label={CONTOUR_FIELDS[key].label + ' contour spacing'} bind:value={options[key].step} on:change={save} disabled={!enabled}>{#each CONTOUR_FIELDS[key].steps as step}<option value={step}>{step} {key === 'temp' ? '°C' : 'dam'}</option>{/each}</select></label>
      {/each}
      <small>Times use your device timezone. Height in dam; temperature in °C.</small>
    </details>
  </section>
{/if}
</div>
<style>
  .atlas-controls{position:fixed;left:12px;bottom:95px;z-index:10000;isolation:isolate;width:280px;max-width:calc(100vw - 24px);font:12px/1.4 system-ui,sans-serif;color:#f0f5f8}
  .panel,.restore{background:#142536;border:1px solid #526879;border-radius:12px;box-shadow:0 5px 20px #0005}.panel{padding:12px;max-height:calc(100dvh - 180px);overflow:auto;box-sizing:border-box}header{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}header strong{font-size:17px}.restore{padding:10px}
  button,select,input{font:inherit;color:inherit;background:#253d50;border:1px solid #526879;border-radius:6px;padding:5px 7px}button,select,summary{cursor:pointer}button:disabled,select:disabled{opacity:.5;cursor:default}button:focus-visible,select:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid #ffd166;outline-offset:2px}input[type=checkbox]{accent-color:#ffd166;width:15px;height:15px;margin:0}
  .row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 0}.row label{font-size:12px}label{display:flex;align-items:center;gap:7px}.row select{font-size:11px;min-width:88px}.stamp{font-size:11px;color:#bdccd9;margin:8px 0}.error{background:#692f30;padding:8px;border-radius:6px;font-size:11px}p[role=status]{font-size:11px}.more{border-top:1px solid #42586b;margin-top:8px;padding-top:8px}summary{font-size:11px}.toolbar,.switches{display:flex;gap:8px;align-items:center;margin:10px 0}.switches button{margin-left:auto}button{font-size:11px}.spacing{justify-content:space-between;margin:10px 0;font-size:11px}small{display:block;font-size:10px;color:#bbcad6;margin-top:10px}
  @media(max-width:600px){
    .atlas-controls{left:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));width:calc(100vw - 16px);max-width:none}
    .atlas-controls.mobile-docked{position:relative;left:auto;bottom:auto;width:auto;margin:4px 8px calc(8px + env(safe-area-inset-bottom,0px));max-width:none}
    .panel{padding:8px 10px;max-height:50dvh;border-radius:9px}
    header{margin-bottom:2px}header strong{font-size:14px}
    .row{padding:4px 0}.row select{min-height:32px}
    .stamp{display:inline-block;margin:4px 0;font-size:10px}
    .more{margin-top:4px;padding-top:4px}summary{font-size:11px}
    .restore{padding:8px 10px}
  }
</style>
