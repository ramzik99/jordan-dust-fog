import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTileContourProvider,viewportGrid,scalarValue,wrapLongitude} from '../src/windyContourData.mjs';
import {contourSegments} from '../src/contours.mjs';
const map={getBounds:()=>({getWest:()=>170,getEast:()=>190,getSouth:()=>-10,getNorth:()=>10}),getSize:()=>({x:60,y:60}),getZoom:()=>4};
function fixture(){
 const calls=[],freed=[],catalog={};
 for(const name of ['ecmwf','gfs','icon'])catalog[name]={modelName:name,isolines:['gh'],overlays:['temp'],levels:['500h','850h'],getCalendar:async()=>({timestamps:[1000,2000]}),pointIsInBounds:()=>true};
 const provider=createTileContourProvider({products:catalog,createParams:async(field,params,time)=>{calls.push({field,...params,time});return {...params,path:'2026/10/19/12',refTime:'run',fullPath:params.product+'/'+field+'/<z>/<x>/<y>'}},getDataZoom:()=>1,Interpolator:class{createFun(cb){cb(async(p,a,params)=>[params.overlay==='gh'?5600:273.15,0,0])}destroy(){}},tiles:{get:async url=>({value:{valid:true},url}),free:t=>freed.push(t)},applyUrlTemplate:(s,p)=>s.replace(/<([zxy])>/g,(_,k)=>p[k])});
 return {provider,calls,freed,catalog};
}
test('Windy scalar units and missing values are explicit',()=>{
 assert.equal(scalarValue([5600,0,0],'gh'),560);
 assert.equal(scalarValue([273.15,0,0],'temp'),0);
 for(const raw of [null,undefined,-1,[NaN,0,0],[0,0,0]])assert.ok(Number.isNaN(scalarValue(raw,'temp')));
});
test('viewport has bounded samples and no periodic seam across regional edges',()=>{
 const g=viewportGrid(map);assert.equal(g.periodic,false);assert.ok(g.width*g.height<=97*73);
 assert.equal(wrapLongitude(190),-170);
 const segments=contourSegments(new Float32Array([0,1,0,1]),{width:2,height:2,longitudeStart:170,latitudeStart:0,step:10,latitudeStep:2,periodic:false},.5).filter(s=>s[4]===.5);
 assert.equal(segments.length,1);assert.equal(segments[0][0],175);assert.equal(Math.abs(segments[0][1]-segments[0][3]),2);
});
test('native requests preserve selected model, field, level and time; tiles are released',async()=>{
 const {provider,calls,freed}=fixture();
 for(const product of ['ecmwf','gfs','icon']){
 const result=await provider.load({map,product,timestamp:1500,field:'gh',level:500,abort:new AbortController()});
 assert.ok(result.values.every(v=>v===560));
 assert.deepEqual(calls.at(-1),{field:'gh',product,overlay:'gh',level:'500h',time:1500});
 }
 await Promise.resolve();assert.ok(freed.length>0);provider.destroy();
});
test('unsupported models, levels, hours and regional cells never fall back',async()=>{
 const {provider,calls,catalog}=fixture(),args={map,product:'ecmwf',timestamp:1500,field:'gh',level:500,abort:new AbortController()};
 await assert.rejects(provider.load({...args,product:'unknown'}),/unavailable/);
 await assert.rejects(provider.load({...args,level:300}),/not available/);
 await assert.rejects(provider.load({...args,timestamp:2001}),/forecast range/);
 assert.equal(calls.length,0);
 catalog.ecmwf.pointIsInBounds=()=>false;
 await assert.rejects(provider.load(args),/No data/);
 provider.destroy();
});
test('a cancelled request settles even when host calendar never resolves',async()=>{
 const {provider,catalog}=fixture();catalog.ecmwf.getCalendar=()=>new Promise(()=>{});
 const abort=new AbortController(),pending=provider.load({map,product:'ecmwf',timestamp:1500,field:'gh',level:500,abort});
 abort.abort();await assert.rejects(pending,{name:'AbortError'});provider.destroy();
});
