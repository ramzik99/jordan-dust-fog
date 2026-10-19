import { chromium } from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const coreURL='data:text/javascript;base64,'+(await readFile('src/windyContourData.mjs')).toString('base64');
const pluginURL='data:text/javascript;base64,'+(await readFile('dist/plugin.js')).toString('base64');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1365,height:1000}});
try{
 await page.goto('https://www.windy.com/?35,30,4',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.renderUtils?.createFullRenderingParams&&window.W?.products?.ecmwf,null,{timeout:60000});
 const result=await page.evaluate(async(coreURL)=>{
  const {createTileContourProvider}=await import(coreURL);
  const provider=createTileContourProvider({products:W.products,createParams:W.renderUtils.createFullRenderingParams,getDataZoom:W.renderUtils.getDataZoom,Interpolator:W.tileInterpolator.TileLayerInterpolator,tiles:W.tileLayerSource.tileLayerSource,applyUrlTemplate:W.tileHelpers.applyUrlTemplate});
  const native=W.map.map,results=[];
  const map={getBounds:()=>({getWest:()=>30,getEast:()=>40,getSouth:()=>25,getNorth:()=>40}),getSize:()=>({x:90,y:90}),getZoom:()=>native.getZoom(),maplibreMap:native.maplibreMap};
  try{
   for(const product of ['ecmwf','gfs','icon']){
    const cal=await W.products[product].getCalendar(),time=cal.timestamps.find(t=>t>Date.now())??cal.timestamps[0];
    for(const timestamp of product==='icon'?[time]:[time,cal.timestamps.at(-1)]){
     for(const field of ['gh','temp']){
      const abort=new AbortController(),deadline=setTimeout(()=>abort.abort(),15000);
      try{
       const r=await provider.load({map,product,timestamp,field,level:field==='gh'?500:850,abort});
       results.push({product,field,timestamp,validTime:r.validTime,samples:r.values.length,valid:r.values.filter(Number.isFinite).length,example:[...r.values].find(Number.isFinite)});
      }finally{clearTimeout(deadline)}
     }
    }
   }
   return results;
  }finally{provider.destroy()}
 },coreURL);
 assert.equal(result.length,10);
 assert.ok(result.every(r=>r.valid>0&&Number.isFinite(Date.parse(r.validTime))));
 console.log('LIVE WINDY PROVIDER CHECKS',JSON.stringify(result,null,2));
 await page.evaluate(async pluginURL=>{
  const host=document.createElement('div');host.id='windy-plugin-synoptic-atlas';document.body.append(host);
  const mod=await import(pluginURL);window.synopticTest=new mod.default({target:host});
 },pluginURL);
 await page.locator('.atlas-controls .more > summary').click({force:true});
 await page.locator('.atlas-controls button').filter({hasText:'Synoptic preset'}).click({force:true});
 for(const product of ['ecmwf','gfs']){
  await page.evaluate(product=>W.store.set('product',product),product);
  await page.waitForFunction(product=>{
   const c=document.querySelector('[data-synoptic-contours]');
   return c?.dataset.product===product&&c.dataset.layers==='gh:500,temp:850';
  },product,{timeout:45000});
  const pixels=await page.locator('[data-synoptic-contours]').evaluate(c=>{
   const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;
   for(let i=3;i<p.length;i+=4)if(p[i])n++;return n;
  });
  assert.ok(pixels>0,'The real Windy viewport must contain drawn contours');
  console.log('LIVE COMPILED PLUGIN',product,'painted contour pixels',pixels);
 }
 await mkdir('test-output',{recursive:true});
 await page.screenshot({path:'test-output/windy-live-selected-model.png'});
 await page.evaluate(()=>synopticTest.$destroy());
 console.log('Live selected-model integration passed on Windy.');
}catch(error){
 await mkdir('test-output',{recursive:true});
 await page.screenshot({path:'test-output/windy-live-failure.png'}).catch(()=>{});
 console.log('Live page messages',await page.locator('.atlas-controls').innerText().catch(()=>'(controller not mounted)'));
 throw error;
}finally{await browser.close()}
