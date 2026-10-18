import { contourColor } from '../src/contourPalettes.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultContours, safeContourOptions, validateContourManifest, contourSnapshot, contourPath, validateContourField, contourSegments, drawContours } from '../src/contours.mjs';
function fixture() {
  const now=Date.now(), start=Math.floor(now/10800000)*10800000, run=Math.floor(now/21600000)*21600000;
  const iso=t=>new Date(t).toISOString().replace('.000Z','Z');
  return {schemaVersion:1,source:'NASA GEOS-FP',collection:'inst3_3d_asm_Np',runTime:iso(run),retrievedAt:iso(Math.floor(now/1000)*1000),
    grid:{width:288,height:145,longitudeStart:-180,latitudeStart:-90,step:1.25},levels:[925,850,700,500,300],units:{gh:'dam',temp:'degC'},frames:[{validTime:iso(start)},{validTime:iso(start+10800000)}]};
}
test('contour manifest rejects wrong units, grids, stale runs and irregular snapshots',()=>{
  assert.ok(validateContourManifest(fixture()));
  for(const mutate of [m=>m.units.gh='m',m=>m.grid.step=.25,m=>m.frames.reverse(),m=>m.levels.push(200),m=>m.runTime='2026-01-01T00:00:00Z']) {
    const m=fixture();mutate(m);assert.throws(()=>validateContourManifest(m));
  }
});
test('instantaneous contour selection has a bounded nearest time and never extrapolates',()=>{
  const m=fixture(), time=Date.parse(m.frames[0].validTime);
  assert.equal(contourSnapshot(m,time+5400000),m.frames[0]);
  assert.equal(contourSnapshot(m,time+5400001),m.frames[1]);
  assert.equal(contourSnapshot(m,time-5400001),null);
  assert.equal(contourSnapshot(m,NaN),null);
});
test('contour files remain pinned to run, field, pressure level and time',()=>{
  const m=fixture(), frame=m.frames[0]; assert.match(contourPath(m,frame,'gh',500),/\/gh-500\.json\.gz$/);
  assert.throws(()=>contourPath(m,frame,'mslp',500)); assert.throws(()=>contourPath(m,frame,'gh',999));
  const values=Array(145*288).fill(-10);values[0]=null;
  const field={schemaVersion:1,runTime:m.runTime,validTime:frame.validTime,field:'temp',level:850,units:'degC',values};
  const decoded=validateContourField(field,m,frame,'temp',850); assert.ok(Number.isNaN(decoded[0]));assert.equal(decoded[1],-10);
  assert.throws(()=>validateContourField({...field,units:'K'},m,frame,'temp',850));
});
test('marching squares interpolates contours and closes the periodic date line',()=>{
  const grid={width:2,height:2,longitudeStart:0,latitudeStart:0,step:1};
  const segments=contourSegments(new Float32Array([0,1,0,1]),grid,.5).filter(s=>s[4]===.5);
  assert.equal(segments.length,2);assert.ok(segments.some(s=>s[0]===.5&&s[2]===.5));assert.ok(segments.some(s=>s[0]===1.5&&s[2]===1.5));
  assert.equal(contourSegments(new Float32Array([0,NaN,0,1]),grid,.5).length,0);
  assert.throws(()=>contourSegments(new Float32Array([0,1000,0,1000]),grid,1),/too small/);
});
test('saddle cells produce finite local segments instead of crossing the globe',()=>{
  const grid={width:2,height:2,longitudeStart:0,latitudeStart:0,step:1};
  const segments=contourSegments(new Float32Array([2,-1,-1,2]),grid,1);
  assert.ok(segments.length);assert.ok(segments.every(s=>s.every(Number.isFinite)&&Math.abs(s[0]-s[2])<=1&&Math.abs(s[1]-s[3])<=1));
});
test('checkbox settings remain independent and invalid saved settings are ignored',()=>{
  const p=defaultContours();p.gh.on=true;p.temp.on=true;p.temp.level=700;
  assert.deepEqual(safeContourOptions(p),p);p.gh.on=false;assert.equal(p.temp.on,true);
  assert.equal(safeContourOptions({gh:{on:true,level:999,step:0,color:'bad'}}).gh.level,500);
});
test('both line families render together with unambiguous unit labels',()=>{
  const labels=[],strokes=[];
  const ctx={clearRect(){},beginPath(){},moveTo(){},lineTo(){},setLineDash(){},stroke(){strokes.push(this.strokeStyle)},strokeText(){},fillText(text){labels.push(text)}};
  const map={getBounds:()=>({getWest:()=>-180,getEast:()=>180}),latLngToContainerPoint:([lat,lon])=>({x:(lon+180)*4,y:(90-lat)*4})};
  const p=defaultContours();for(const k of ['gh','temp'])p[k].on=true;
  const layers=[{field:'gh',level:500,segments:[[-100,40,-90,40,570]]},{field:'temp',level:850,segments:[[-50,20,-40,20,-4]]}];
  drawContours(ctx,map,layers,p,1440,720);
  assert.ok(labels.includes('500h 570 dam'));assert.ok(labels.includes('850h -4\u00b0C'));assert.equal(strokes.length,4);assert.ok(strokes.includes(contourColor('gh',570)));assert.ok(strokes.includes(contourColor('temp',-4)));
});

test('reference colors follow values and clamp beyond the legend endpoints',()=>{
  assert.equal(contourColor('temp',0),'#66caf0');
  assert.equal(contourColor('temp',-4),'#1857bc');
  assert.equal(contourColor('gh',570),'#f54f00');
  assert.notEqual(contourColor('temp',-4),contourColor('temp',20));
  assert.equal(contourColor('gh',300),contourColor('gh',470));
  assert.equal(contourColor('gh',900),contourColor('gh',600));
  assert.equal(contourColor('temp',-80),contourColor('temp',-40));
  assert.throws(()=>contourColor('mslp',1012));
  assert.equal(safeContourOptions({mslp:{on:true}}).mslp,undefined);
});
