import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-web-security']});
try{
 const page=await browser.newPage();
 await page.goto('https://www.windy.com/?35,30,4',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.W?.renderUtils?.createFullRenderingParams&&window.W?.products?.ecmwf,{timeout:60000});
 const result=await page.evaluate(async()=>{
  const results=[];
  for(const product of ['ecmwf','gfs','icon']){
   const model=W.products[product],cal=await model.getCalendar();
   const ts=cal.timestamps.find(t=>t>Date.now())??cal.timestamps[0];
   for(const field of ['gh','temp']){
    try{
     const params=await W.renderUtils.createFullRenderingParams(field,{product,overlay:field,level:field==='gh'?'500h':'850h'},ts);
     const zoom=Math.round(Math.max(2,Math.min(10,W.map.map.maplibreMap.getZoom())))+1;
     const z=W.renderUtils.getDataZoom(params,zoom),scale=2**z,lat=32,lon=35,phi=lat*Math.PI/180;
     const url=W.tileHelpers.applyUrlTemplate(params.fullPath,{z,x:Math.floor((lon+180)/360*scale),y:Math.floor((1-Math.log(Math.tan(phi)+1/Math.cos(phi))/Math.PI)/2*scale)});
     const abort=new AbortController();const deadline=setTimeout(()=>abort.abort(),12000);
     const token=await W.tileLayerSource.tileLayerSource.get(url,abort.signal);
     const interpolator=new W.tileInterpolator.TileLayerInterpolator();
     const sample=await new Promise(resolve=>interpolator.createFun(resolve));
     const raw=token?.value?.valid?await sample({lat,lon},abort,params):null;
     results.push({product,field,url,valid:token?.value?.valid,raw,levels:model.levels,range:[cal.timestamps[0],cal.timestamps.at(-1)]});
     interpolator.destroy();if(token)W.tileLayerSource.tileLayerSource.free(token);clearTimeout(deadline);
    }catch(e){results.push({product,field,error:String(e)})}
   }
  }
  return results;
 });
 console.log('LIVE WINDY MODEL PROBE',JSON.stringify(result,null,2));
}finally{await browser.close()}
