import { CONTOUR_BASE, PRESSURE_LEVELS, CONTOUR_FIELDS, validateContourManifest, contourSnapshot, contourPath, validateContourField } from '../src/contours.mjs';
import { decodeFrameResponse } from '../src/contourData.mjs';
async function get(path) {
  const response=await fetch(CONTOUR_BASE+path,{headers:{Origin:'https://www.windy.com'},signal:AbortSignal.timeout(60000)});
  if(!response.ok || response.headers.get('Access-Control-Allow-Origin')!=='*') throw Error('Contour delivery/CORS unavailable: '+path);
  return response;
}
const manifest=validateContourManifest(await (await get('latest.json')).json());
const frame=contourSnapshot(manifest,Date.now());
if(!frame) throw Error('No current contour snapshot');
for(const field of Object.keys(CONTOUR_FIELDS)) for(const level of field==='mslp'?[0]:PRESSURE_LEVELS) {
  const response=await get(contourPath(manifest,frame,field,level));
  const values=validateContourField(await decodeFrameResponse(response),manifest,frame,field,level);
  let min=Infinity,max=-Infinity,count=0;
  for(const value of values) if(Number.isFinite(value)){min=Math.min(min,value);max=Math.max(max,value);count++;}
  if(count<values.length*.25) throw Error('Insufficient valid data: '+field+' '+level);
  console.log(field,level,CONTOUR_FIELDS[field].units,'range',min,max,'valid nodes',count);
}
console.log('Live contours verified:',manifest.runTime,'snapshot',frame.validTime,'CORS and all 11 fields/levels');
