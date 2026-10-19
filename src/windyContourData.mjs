// Windy tile sampling: model metadata and native decoded scalar fields, no external forecast fallback.
export const wrapLongitude = lon => ((lon + 180) % 360 + 360) % 360 - 180;
export function viewportGrid(map) {
  const b=map.getBounds(), size=map.getSize();
  const west=wrapLongitude(b.getWest()), span=Math.min(360,Math.max(.001,b.getEast()-b.getWest()));
  const south=Math.max(-85,Math.min(85,b.getSouth())), north=Math.max(south+.001,Math.min(85,b.getNorth()));
  const width=Math.max(3,Math.min(97,Math.ceil(size.x/18)+1));
  const height=Math.max(3,Math.min(73,Math.ceil(size.y/18)+1));
  return {width,height,longitudeStart:west,latitudeStart:south,step:span/(width-1),latitudeStep:(north-south)/(height-1),periodic:false};
}
export function windyPathTime(path) {
  const compact=String(path).replaceAll('/','');
  if(!/^\d{10}(\d{2})?$/.test(compact))return NaN;
  return Date.parse(compact.slice(0,4)+'-'+compact.slice(4,6)+'-'+compact.slice(6,8)+'T'+compact.slice(8,10)+':'+(compact.slice(10,12)||'00')+':00Z');
}
function interrupted() { return new DOMException('Request cancelled','AbortError'); }
function checked(promise, signal) {
  if(signal.aborted) return Promise.reject(interrupted());
  return new Promise((resolve,reject)=>{
    const stop=()=>{signal.removeEventListener('abort',stop);reject(interrupted());};
    signal.addEventListener('abort',stop,{once:true});
    Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',stop);resolve(value);},error=>{signal.removeEventListener('abort',stop);reject(error);});
  });
}
export function scalarValue(raw,field) {
  const value=Array.isArray(raw)?raw[0]:NaN;
  if(typeof value!=='number'||!Number.isFinite(value))return NaN;
  // Native gh scalar is geopotential height in metres; temperature is Kelvin.
  if(field==='gh')return value>=-1000&&value<=60000?value/10:NaN;
  return value>=100&&value<=400?value-273.15:NaN;
}
export function createTileContourProvider({products,createParams,getDataZoom,Interpolator,tiles,applyUrlTemplate,sampleTile}) {
  let dead=false;
  const active=new Set();
  return {
    async load({map,product,timestamp,field,level,abort:parent}) {
      if(dead)throw interrupted();
      const model=products[product], nativeLevel=level+'h';
      if(!model || !['gh','temp'].includes(field))throw Error('Selected model is unavailable');
      if(field==='gh'?!model.isolines?.includes('gh'):!model.overlays?.includes('temp'))throw Error('Not available for '+(model.modelName||product));
      const levels=model.levelsOverride?.[field]||model.levels;
      if(!levels?.includes(nativeLevel))throw Error(nativeLevel+' is not available for '+(model.modelName||product));
      const abort=new AbortController(), stop=()=>abort.abort();
      parent.signal.addEventListener('abort',stop,{once:true});if(parent.signal.aborted)stop();
      active.add(abort);
      const tokens=new Map();let interpolator;
      try {
        const calendar=await checked(model.getCalendar(),abort.signal);
        const times=calendar?.timestamps;
        if(!Array.isArray(times)||!times.length||!Number.isFinite(timestamp)||timestamp<times[0]||timestamp>times.at(-1))throw Error('Outside selected model forecast range');
        const params=await checked(createParams(field,{product,overlay:field,level:nativeLevel},timestamp),abort.signal);
        if(params.product!==product||params.level!==nativeLevel)throw Error('Windy returned a different model or pressure level');
        const validTime=windyPathTime(params.path);
        if(!Number.isFinite(validTime))throw Error('Forecast time unavailable');
        let sample;
        if(!sampleTile){
          interpolator=new Interpolator();
          sample=await checked(new Promise(resolve=>interpolator.createFun(resolve)),abort.signal);
          if(typeof sample!=='function')throw Error('Windy tile reader unavailable');
        }
        const zoom=map.maplibreMap?.getZoom?.()??map.getZoom()-1;
        const tileZoom=Math.round(Math.max(2,Math.min(10,zoom)))+1;
        const z=getDataZoom(params,tileZoom), scale=2**z, grid=viewportGrid(map);
        const values=new Float32Array(grid.width*grid.height).fill(NaN);
        let index=0;
        await Promise.all(Array.from({length:8},async()=>{
          while(index<values.length && !abort.signal.aborted){
            const at=index++, x=at%grid.width,y=Math.floor(at/grid.width);
            const lat=grid.latitudeStart+y*grid.latitudeStep,lon=wrapLongitude(grid.longitudeStart+x*grid.step);
            if(model.pointIsInBounds&&!model.pointIsInBounds({lat,lon}))continue;
            const phi=lat*Math.PI/180;
            const url=applyUrlTemplate(params.fullPath,{z,x:Math.floor((lon+180)/360*scale),y:Math.floor((1-Math.log(Math.tan(phi)+1/Math.cos(phi))/Math.PI)/2*scale)});
            let pending=tokens.get(url);
            if(!pending){pending=tiles.get(url,abort.signal);tokens.set(url,pending);}
            const token=await checked(pending,abort.signal);
            if(!token?.value?.valid)continue;
            const mx=(lon+180)/360*scale,my=(1-Math.log(Math.tan(phi)+1/Math.cos(phi))/Math.PI)/2*scale;
            const raw=sampleTile?sampleTile(token.value,params,{x:(mx-Math.floor(mx))*256,y:(my-Math.floor(my))*256}):await checked(sample({lat,lon},abort,params),abort.signal);
            values[at]=scalarValue(raw,field);
          }
        }));
        if(abort.signal.aborted)throw interrupted();
        if(!values.some(Number.isFinite))throw Error('No data for this model, area, level and time');
        return {values,grid,validTime:new Date(validTime).toISOString(),runTime:params.refTime};
      } finally {
        parent.signal.removeEventListener('abort',stop);active.delete(abort);
        abort.abort();interpolator?.destroy();
        for(const pending of tokens.values())void pending.then(token=>{if(token)tiles.free(token);},()=>{});
      }
    },
    destroy(){dead=true;for(const abort of active)abort.abort();active.clear();tiles.destroy?.();}
  };
}
