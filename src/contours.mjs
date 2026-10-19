import { contourColor } from './contourPalettes.mjs';
import { MAX_RUN_AGE_MS, decodeFrameResponse } from './contourData.mjs';
import { worldCopies } from './worldMap.mjs';
export const CONTOUR_BASE = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/synoptic-data/contours/';
export const PRESSURE_LEVELS = [925, 850, 700, 500, 300];
export const CONTOUR_FIELDS = {
  gh: { label: 'Geopotential height', units: 'dam', steps: [3, 6, 12], bounds: [-100, 6000] },
  temp: { label: 'Temperature', units: 'degC', steps: [2, 4, 8], bounds: [-173.2, 126.9] },
};
export function defaultContours() {
  return { labels: true, gh: { on: false, level: 500, step: 6,  },
    temp: { on: false, level: 850, step: 4,  } };
}
export function safeContourOptions(raw) {
  const result = defaultContours(); if (!raw) return result;
  result.labels = raw.labels !== false;
  for (const key of Object.keys(CONTOUR_FIELDS)) {
    const p = raw[key]; if (!p) continue;
    result[key].on = p.on === true;
    if (PRESSURE_LEVELS.includes(p.level)) result[key].level = p.level;
    if (CONTOUR_FIELDS[key].steps.includes(p.step)) result[key].step = p.step;
  }
  return result;
}
const validDate = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value) && Number.isFinite(Date.parse(value));
export function validateContourManifest(m, now = Date.now()) {
  if (m?.schemaVersion !== 1 || m.source !== 'NOAA GFS' || m.collection !== 'gfs_1p00') throw Error('Unsupported contour data');
  if (!validDate(m.runTime) || !validDate(m.retrievedAt) || Date.parse(m.runTime) > now + 3600000 || now - Date.parse(m.runTime) > MAX_RUN_AGE_MS || Date.parse(m.retrievedAt) < Date.parse(m.runTime) || Date.parse(m.retrievedAt) > now + 3600000) throw Error('Contour run is stale or invalid');
  const g = m.grid;
  if (!g || g.width !== 288 || g.height !== 145 || g.longitudeStart !== -180 || g.latitudeStart !== -90 || g.step !== 1.25 || JSON.stringify(m.levels) !== JSON.stringify(PRESSURE_LEVELS)) throw Error('Unexpected contour grid or pressure levels');
  if (Object.keys(CONTOUR_FIELDS).some(k => m.units?.[k] !== CONTOUR_FIELDS[k].units)) throw Error('Unexpected contour units');
  if (!Array.isArray(m.frames) || m.frames.length < 2 || m.frames.length > 129) throw Error('Invalid contour snapshots');
  let previous = -Infinity;
  for (const f of m.frames) {
    const t = Date.parse(f.validTime);
    if (!validDate(f.validTime) || t < Date.parse(m.runTime) || t > Date.parse(m.runTime) + 384 * 3600000 || t <= previous || previous !== -Infinity && t - previous !== 10800000) throw Error('Invalid contour snapshot time');
    previous = t;
  }
  if (previous + 5400000 < now) throw Error('Contour forecast expired');
  return m;
}
export function contourSnapshot(manifest, timestamp) {
  if (!manifest || !Number.isFinite(timestamp)) return null;
  const frame = manifest.frames.reduce((best, f) => Math.abs(Date.parse(f.validTime) - timestamp) < Math.abs(Date.parse(best.validTime) - timestamp) ? f : best);
  return Math.abs(Date.parse(frame.validTime) - timestamp) <= 5400000 ? frame : null;
}
export function contourPath(manifest, frame, field, level) {
  if (!CONTOUR_FIELDS[field] || !PRESSURE_LEVELS.includes(level)) throw Error('Unknown contour field or level');
  if (!manifest.frames.includes(frame)) throw Error('Unknown contour snapshot');
  const token = manifest.runTime.slice(0, 10).replaceAll('-', '') + '_' + manifest.runTime.slice(11, 13);
  const stamp = frame.validTime.replaceAll('-', '').replaceAll(':', '');
  return `runs/${token}/${stamp}/${field}-${level}.json.gz`;
}
export function validateContourField(data, manifest, frame, field, level) {
  if (data?.schemaVersion !== 1 || data.runTime !== manifest.runTime || data.validTime !== frame.validTime || data.field !== field || data.level !== level || data.units !== CONTOUR_FIELDS[field]?.units) throw Error('Contour field does not match its snapshot');
  const [lo, hi] = CONTOUR_FIELDS[field].bounds;
  if (!Array.isArray(data.values) || data.values.length !== manifest.grid.width * manifest.grid.height || data.values.some(v => v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi))) throw Error('Invalid contour values');
  return Float32Array.from(data.values, v => v === null ? NaN : v);
}
// Marching squares with a bilinear saddle decider. Missing corners leave gaps.
// A periodic final column closes the seam at +180 without long crossing lines.
export function contourSegments(values, grid, step) {
  const { width: w, height: h, longitudeStart: x0, latitudeStart: y0, step: d } = grid;
  if (values.length !== w * h || !Number.isFinite(step) || step <= 0) throw Error('Invalid contour input');
  let min = Infinity, max = -Infinity;
  for (const v of values) if (Number.isFinite(v)) { min = Math.min(min, v); max = Math.max(max, v); }
  if (min === Infinity || min === max) return [];
  const first = Math.ceil(min / step) * step, count = Math.floor((max - first) / step) + 1;
  if (count > 200) throw Error('Contour interval is too small');
  const segments = [], table = { 1: [[3,0]], 2: [[0,1]], 3: [[3,1]], 4: [[1,2]], 6: [[0,2]], 7: [[3,2]],
    8: [[2,3]], 9: [[0,2]], 11: [[1,2]], 12: [[1,3]], 13: [[0,1]], 14: [[3,0]] };
  for (let n = 0; n < count; n++) {
    const level = first + n * step;
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < w; x++) {
      const next = (x + 1) % w;
      const v = [values[y*w+x], values[y*w+next], values[(y+1)*w+next], values[(y+1)*w+x]];
      if (v.some(a => !Number.isFinite(a))) continue;
      const mask = v.reduce((m, a, i) => m | (a >= level ? 1 << i : 0), 0);
      if (!mask || mask === 15) continue;
      const pairs = mask === 5 || mask === 10 ? ((v[0]-level)*(v[2]-level)-(v[1]-level)*(v[3]-level) >= 0 ? [[0,1],[2,3]] : [[3,0],[1,2]]) : table[mask];
      const positions = [[x0+x*d,y0+y*d],[x0+(x+1)*d,y0+y*d],[x0+(x+1)*d,y0+(y+1)*d],[x0+x*d,y0+(y+1)*d]];
      const cross = edge => { const a = edge, b = (edge + 1) % 4, f = (level - v[a]) / (v[b] - v[a]); return [positions[a][0] + f * (positions[b][0]-positions[a][0]), positions[a][1] + f * (positions[b][1]-positions[a][1])]; };
      for (const [a,b] of pairs) { const p = cross(a), q = cross(b); if (p.every(Number.isFinite) && q.every(Number.isFinite) && Math.hypot(p[0]-q[0],p[1]-q[1]) > 1e-9) segments.push([p[0],p[1],q[0],q[1],level]); }
    }
  }
  return segments;
}
function contourHalo(color) {
  const rgb = [1,3,5].map(i => parseInt(color.slice(i,i+2),16));
  return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722 < 85 ? '#e8eef4' : '#102131';
}
const clampLat = lat => Math.max(-85.05112878, Math.min(85.05112878, lat));
export function drawContours(ctx, map, layers, options, width, height) {
  ctx.clearRect(0, 0, width, height); const bounds = map.getBounds(), occupied = new Set(), labelGroups = [], boxes = [];
  for (const layer of layers) {
    const config = options[layer.field], visible = [];
    if (!config?.on || config.level !== layer.level) continue;
    for (const offset of worldCopies(bounds.getWest(), bounds.getEast())) for (const s of layer.segments) {
      const a = map.latLngToContainerPoint([clampLat(s[1]), s[0]+offset]), b = map.latLngToContainerPoint([clampLat(s[3]), s[2]+offset]);
      if (Math.max(a.x,b.x)<0 || Math.min(a.x,b.x)>width || Math.max(a.y,b.y)<0 || Math.min(a.y,b.y)>height) continue;
      visible.push([a,b,s[4]]);
    }
    const groups = new Map();
    for (const segment of visible) {
      const value = segment[2]; if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(segment);
    }
    ctx.lineJoin = 'round'; ctx.setLineDash(layer.field === 'temp' ? [5,3] : []);
    for (const [value, segments] of groups) {
      const color = contourColor(layer.field, value);
      ctx.beginPath(); for (const [a,b] of segments) { ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
      ctx.strokeStyle = contourHalo(color); ctx.lineWidth = 3.8; ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = layer.field === 'gh' ? 1.8 : 1.3; ctx.stroke();
    }
    ctx.setLineDash([]);
    labelGroups.push({ layer, config, visible });
  }
  if (options.labels) {
    for (const { layer, config, visible } of labelGroups) {
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [a,b,level] of visible) {
        const x=(a.x+b.x)/2, y=(a.y+b.y)/2;
        if (x<45 || x>width-45 || y<18 || y>height-18) continue;
        const cell = layer.field+':'+Math.floor(x/135)+':'+Math.floor(y/65); if (occupied.has(cell)) continue;
        const label = `${layer.level}h ${level}${layer.field === 'gh' ? ' dam' : '\u00b0C'}`;
        const half=(ctx.measureText?.(label).width || label.length*6)/2;
        if(boxes.some(b=>Math.abs(b.x-x)<b.half+half+5 && Math.abs(b.y-y)<19)) continue;
        occupied.add(cell); boxes.push({x,y,half});
        const color = contourColor(layer.field, level);
        ctx.strokeStyle = contourHalo(color); ctx.lineWidth = 3.5; ctx.strokeText(label,x,y); ctx.fillStyle=color; ctx.fillText(label,x,y);
      }
    }
  }
  ctx.setLineDash([]);
}
export class ContourOverlay {
  constructor({ map, onChange = () => {}, onRender = () => {}, fetcher = (...args) => globalThis.fetch(...args), base = CONTOUR_BASE }) {
    this.map=map; this.onChange=onChange; this.onRender=onRender; this.fetcher=fetcher; this.base=base;
    this.manifest=null; this.manifestAt=0; this.cache=new Map(); this.geometry=new Map(); this.layers=[]; this.epoch=0; this.dead=false; this.signature=''; this.options=defaultContours();
    this.canvas=document.createElement('canvas'); this.canvas.dataset.synopticContours='map'; this.canvas.setAttribute('aria-hidden','true');
    // Keep contours in the renderer's map layer, beneath Windy's UI siblings.
    Object.assign(this.canvas.style,{position:'absolute',left:'0',top:'0',pointerEvents:'none',zIndex:'0'});
    const surface=map.getContainer().querySelector('.maplibregl-canvas-container') || map.getContainer();
    surface.appendChild(this.canvas);
  }
  set(options, timestamp, enabled) {
    const safe=safeContourOptions(options), signature=JSON.stringify([safe,timestamp,enabled]);
    if(this.dead || signature===this.signature) return;
    this.signature=signature; this.options=safe; this.timestamp=timestamp; this.enabled=enabled;
    this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.layers=[]; this.onRender();
    const fields=Object.keys(CONTOUR_FIELDS).filter(k=>safe[k].on);
    if(!enabled || !fields.length) { this.onChange({loading:false,errors:[],active:[]}); return; }
    this.onChange({loading:true,errors:[],active:[]});
    this.timer=setTimeout(()=>void this.load(fields,this.epoch),120);
  }
  async load(fields, epoch) {
    const abort=new AbortController(); this.abort=abort; const timeout=setTimeout(()=>abort.abort(),45000), errors=[];
    try {
      if(!this.manifest || Date.now()-this.manifestAt>300000) {
        const response=await this.fetcher(this.base+'latest.json?t='+Math.floor(Date.now()/300000),{signal:abort.signal});
        if(!response.ok) throw Error('Contour index unavailable (HTTP '+response.status+')');
        const text=await response.text(); if(text.length>50000) throw Error('Contour index exceeds size limit');
        const m=validateContourManifest(JSON.parse(text));
        if(this.manifest && m.runTime<this.manifest.runTime) throw Error('Server returned an older contour run');
        if(this.dead || epoch!==this.epoch) return; this.manifest=m; this.manifestAt=Date.now();
      }
      const m=validateContourManifest(this.manifest), frame=contourSnapshot(m,this.timestamp);
      if(!frame) throw Error('No contour snapshot within 90 minutes of the Windy forecast time');
      await Promise.all(fields.map(async field=>{
        const config=this.options[field], key=m.runTime+':'+frame.validTime+':'+field+':'+config.level;
        try {
          let values=this.cache.get(key);
          if(!values) {
            const response=await this.fetcher(this.base+contourPath(m,frame,field,config.level),{signal:abort.signal});
            if(!response.ok) throw Error('HTTP '+response.status);
            values=validateContourField(await decodeFrameResponse(response),m,frame,field,config.level);
          }
          if(this.dead || epoch!==this.epoch || abort.signal.aborted) return;
          this.cache.delete(key); this.cache.set(key,values); while(this.cache.size>9) this.cache.delete(this.cache.keys().next().value);
          const geometryKey=key+':'+config.step;
          let segments=this.geometry.get(geometryKey);
          if(!segments) { segments=contourSegments(values,m.grid,config.step); this.geometry.set(geometryKey,segments); while(this.geometry.size>3) this.geometry.delete(this.geometry.keys().next().value); }
          if(this.dead || epoch!==this.epoch) return;
          this.layers.push({field,level:config.level,segments}); this.layers.sort((a,b)=>Object.keys(CONTOUR_FIELDS).indexOf(a.field)-Object.keys(CONTOUR_FIELDS).indexOf(b.field)); this.onRender();
        } catch(error) { if(epoch===this.epoch) errors.push(CONTOUR_FIELDS[field].label+': '+(error?.name==='AbortError'?'request timed out':error.message)); }
      }));
      if(!this.dead && epoch===this.epoch) this.onChange({loading:false,errors,active:this.layers.map(l=>l.field),validTime:frame.validTime,runTime:m.runTime});
    } catch(error) { if(!this.dead && epoch===this.epoch) this.onChange({loading:false,errors:[error?.name==='AbortError'?'Contour request timed out':error.message],active:[]}); }
    finally { clearTimeout(timeout); }
  }
  paint() {
    if(this.dead) return;
    const size=this.map.getSize(), ratio=Math.min(window.devicePixelRatio||1,2), c=this.canvas;
    if(c.width!==Math.round(size.x*ratio) || c.height!==Math.round(size.y*ratio)) { c.width=Math.round(size.x*ratio); c.height=Math.round(size.y*ratio); }
    c.style.width=size.x+'px'; c.style.height=size.y+'px'; const ctx=c.getContext('2d'); if(!ctx) return;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const fresh=this.manifest && Date.now()-Date.parse(this.manifest.runTime)<=MAX_RUN_AGE_MS;
    const shown=this.enabled && fresh?this.layers:[];
    c.dataset.layers=shown.map(l=>l.field+':'+l.level).sort().join(',');
    drawContours(ctx,this.map,shown,this.options,size.x,size.y);
  }
  refresh() { this.manifestAt=0; this.signature=''; this.set(this.options,this.timestamp,this.enabled); }
  destroy() { this.dead=true; this.epoch++; this.abort?.abort(); clearTimeout(this.timer); this.cache.clear(); this.geometry.clear(); this.layers=[]; this.canvas.remove(); }
}
