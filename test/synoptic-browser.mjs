import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await readFile('test-fixture/contours/latest.json','utf8'));
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#879ca9}#map{position:absolute;inset:0;overflow:hidden;z-index:2}#plugin{position:relative;z-index:0}#bottom-wrapper{display:none;position:fixed;bottom:0;left:0;right:0;z-index:9000;flex-direction:column;pointer-events:none}#timeline{pointer-events:auto;height:48px;background:#344658;color:white;box-sizing:border-box;padding:12px}@media(max-width:600px){#bottom-wrapper{display:flex}}</style></head><body><div id="map"><div class="maplibregl-canvas-container"><canvas data-weather-map></canvas></div><button id="windy-menu" style="position:absolute;top:20px;left:20px;z-index:10;background:#182c40;color:white;padding:16px">Windy menu</button></div><aside id="windy-plugin-synoptic-atlas" class="native-plugin-frame" style="position:fixed;right:12px;top:120px;z-index:9999;background:#182c40"><button aria-label="Native plugin close">×</button><div id="plugin"></div></aside><section id="bottom-wrapper"><div id="timeline">Windy timeline</div><span data-plugin="bottom-below-controls-mobile"></span></section><script type="module">
const events=new Map(),listeners=new Map(),container=document.querySelector('#map');let timestamp=${Date.parse(manifest.frames.find(f=>Date.parse(f.validTime)>=Date.now()-5400000).validTime)};
const mercator=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-85.051,Math.min(85.051,lat))*Math.PI/360));
const map={getZoom:()=>4,getContainer:()=>container,getSize:()=>({x:innerWidth,y:innerHeight}),getBounds:()=>({getWest:()=>10,getEast:()=>65,getSouth:()=>5,getNorth:()=>55}),latLngToContainerPoint:([lat,lon])=>({x:(lon-10)/55*innerWidth,y:(mercator(55)-mercator(lat))/(mercator(55)-mercator(5))*innerHeight}),on:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn)},off:(name,fn)=>events.get(name)?.delete(fn)};
const state={timestamp,product:'ecmwf',overlay:'wind',level:'surface'};
const store={get:name=>state[name],set:(name,value)=>{state[name]=value;for(const [event,fn] of listeners.values())if(event===name)fn(value)},on:(name,fn)=>{const key=Symbol();listeners.set(key,[name,fn]);return key},off:key=>listeners.delete(key)};
const broadcast={emit:(event,name)=>{testHost.closeRequests.push([event,name]);if(event==='rqstClose'&&name==='windy-plugin-synoptic-atlas')window.testPlugin.$destroy()}};
window.testHost={store,events,listeners,hostInputs:0,closeRequests:[],fail:'',delay:0,requests:[],freed:0};
const model=(name,hours=384)=>({modelName:name,levels:['925h','850h','700h','500h','300h'],isolines:['gh'],overlays:['temp'],getCalendar:async()=>({timestamps:[${Date.parse(manifest.runTime)},${Date.parse(manifest.runTime)}+hours*3600000]}),pointIsInBounds:()=>true});
const products={ecmwf:model('ECMWF'),gfs:model('GFS'),icon:model('ICON',120),mblue:{...model('Meteoblue'),levels:['surface'],isolines:[]}};
const renderUtils={createFullRenderingParams:async(field,params,time)=>{testHost.requests.push({...params,time});return {...params,layer:field,path:new Date(time).toISOString().slice(0,13).replaceAll('-','').replace('T',''),refTime:'test-run',fullPath:'tile/'+params.product+'/'+field+'/'+time+'/<z>/<x>/<y>'}},getDataZoom:()=>2};
class TileLayerInterpolator{createFun(cb){cb(async({lat,lon},abort,params)=>{
if(testHost.delay)await new Promise(r=>setTimeout(r,testHost.delay));
if(testHost.fail===params.layer)throw Error('HTTP 503');
const variation=Math.sin(lat*.14)*8+Math.cos(lon*.15)*8+(params.product==='gfs'?12:0);
return [params.layer==='gh'?(560+variation)*10:273.15+variation,0,0];
});}destroy(){}}
const tiles={get:async()=>({value:{valid:true}}),free:()=>testHost.freed++};
async function fetchImageBlob(url){
 const parts=url.split('/'),field=parts[2],z=Number(parts.at(-3)),tx=Number(parts.at(-2)),ty=Number(parts.at(-1));
 if(testHost.delay)await new Promise(r=>setTimeout(r,testHost.delay));
 if(testHost.fail===field)throw Error('HTTP 503');
 const c=document.createElement('canvas');c.width=257;c.height=257;
 const ctx=c.getContext('2d'),im=ctx.createImageData(257,257);
 for(let y=0;y<257;y++)for(let x=0;x<257;x++){const i=(y*257+x)*4;
 im.data[i]=Math.round(((tx+x/256)+(ty+y/256))/(2*2**z)*220)+(parts[1]==='gfs'?15:0);im.data[i+1]=field==='gh'?1:2;im.data[i+3]=255;}
 ctx.putImageData(im,0,0);return await new Promise(resolve=>c.toBlob(resolve));
}
async function extractTileHeader(image){
 const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);
 const gh=ctx.getImageData(0,0,1,1).data[1]===1;
 return {image,header:{decoderRmin:gh?5400:250,decoderRstep:gh?2:.2}};
}
window.W={map:{map},store,broadcast,products,renderUtils,tileInterpolator:{TileLayerInterpolator},tileLayerSource:{tileLayerSource:tiles,fetchImageBlob,extractTileHeader},tileHelpers:{applyUrlTemplate:(s,p)=>s.replace(/<([zxy])>/g,(_,k)=>p[k])}};
for(const name of ['pointerdown','touchstart','click'])document.querySelector('#bottom-wrapper').addEventListener(name,event=>{testHost.hostInputs++;event.preventDefault();},{passive:false});const mod=await import('/plugin.js');
if(mod.__pluginConfig.name!=='windy-plugin-synoptic-atlas')throw Error('Wrong plugin identity: '+mod.__pluginConfig.name);
window.testPlugin=new mod.default({target:document.querySelector('#plugin')});
</script></body></html>`;
const server=createServer(async(req,res)=>{try{res.setHeader('Content-Type',req.url==='/plugin.js'?'text/javascript':'text/html');res.end(req.url==='/plugin.js'?await readFile('dist/plugin.js'):html)}catch(error){res.writeHead(500).end(String(error))}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true});let currentPage,scenarios=0;
try{
  for(const viewport of [{width:1365,height:1000},{width:390,height:844}]){
    const context=await browser.newContext({viewport,hasTouch:viewport.width<=600,isMobile:viewport.width<=600}),page=await context.newPage(),errors=[];currentPage=page;let fail='';
    page.on('pageerror',error=>{errors.push(String(error));console.error(String(error))});
    await page.route('https://raw.githubusercontent.com/**',async route=>{
      const url=new URL(route.request().url());
      assert.ok(url.pathname.includes('/synoptic-data/contours/'),'Standalone plugin must only request contour data');
      const path=url.pathname.split('/contours/')[1];
      if(fail&&path.includes('/'+fail+'-')){await route.fulfill({status:503,body:'Unavailable',headers:{'Access-Control-Allow-Origin':'*'}});return;}
      await route.fulfill({contentType:path.endsWith('.gz')?'application/gzip':'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:await readFile('test-fixture/contours/'+path)});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('region',{name:'Synoptic Atlas',exact:true}).waitFor();
    assert.doesNotMatch(await page.locator('body').innerText(),/dust|satellite|mslp|mean sea level|geos|nasa/i);
    assert.equal(await page.locator('[data-geos-dust]').count(),0);scenarios++;
    const active=expected=>page.waitForFunction(expected=>document.querySelector('[data-synoptic-contours]')?.dataset.layers===expected,expected);
    if(viewport.width<=600){
      const gh=page.locator('.row label').first(),temp=page.locator('.row label').last();
      assert.ok(await gh.evaluate(el=>el.getBoundingClientRect().height>=44),'Layer toggles need 44px touch targets');
      assert.ok(await page.getByLabel('Temperature pressure level').evaluate(el=>el.getBoundingClientRect().height>=44));
      await gh.tap();await active('gh:500');await temp.tap();await active('gh:500,temp:850');
      await temp.tap();await active('gh:500');await gh.tap();await active('');
      await page.locator('.more > summary').tap();
      await page.getByLabel('Contour labels',{exact:true}).tap();
      assert.equal(await page.getByLabel('Contour labels',{exact:true}).isChecked(),false);
      await page.getByLabel('Contour labels',{exact:true}).tap();
      await page.getByRole('button',{name:'Minimize panel'}).tap();
      await page.getByRole('button',{name:'Synoptic Atlas',exact:true}).tap();
      await page.locator('.more > summary').tap();
      assert.equal(await page.evaluate(()=>testHost.hostInputs),0,'Control taps must not reach timeline gesture handlers');
      await page.locator('#timeline').tap();
      assert.ok(await page.evaluate(()=>testHost.hostInputs)>0,'Timeline must retain its own input handling');
      scenarios++;
    } else {
      await page.locator('.more > summary').click();
    }
    await page.getByRole('button',{name:'Synoptic preset',exact:true}).click();await active('gh:500,temp:850');scenarios++;
    assert.equal(await page.locator('.atlas-controls').evaluate(el=>el.parentElement.id),viewport.width<=600?'bottom-wrapper':'');
    assert.equal(await page.locator('.row').first().evaluate(el=>{
      const rect=el.getBoundingClientRect();const top=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
      return !!top?.closest('.panel');
    }),true,'Panel must be above contours even when plugin host is below map');scenarios++;
    assert.equal(await page.locator('[data-synoptic-contours]').evaluate(el=>el.parentElement.classList.contains('maplibregl-canvas-container')),true);
    assert.equal(await page.locator('[data-synoptic-contours]').evaluate(el=>getComputedStyle(el).zIndex),'0');
    await page.getByRole('button',{name:'Windy menu',exact:true}).click();scenarios++;
    for(const [field,remaining] of [['Geopotential height','temp:850'],['Temperature','gh:500']]){
      await page.getByLabel(field+' isolines',{exact:true}).uncheck();await active(remaining);
      await page.getByLabel(field+' isolines',{exact:true}).check();await active('gh:500,temp:850');scenarios++;
    }
    await page.getByLabel('Geopotential height pressure level').selectOption('700');await active('gh:700,temp:850');
    await page.getByLabel('Temperature pressure level').selectOption('500');await active('gh:700,temp:500');scenarios++;
    assert.equal(await page.locator('.legend,.scale,.swatch').count(),0);
    assert.doesNotMatch(await page.locator('.panel').innerText(),/color legend|colors/i);scenarios++;
    await page.getByLabel('Geopotential height contour spacing').selectOption('12');
    await page.getByLabel('Contour labels',{exact:true}).uncheck();await page.getByLabel('Contour labels',{exact:true}).check();await active('gh:700,temp:500');scenarios++;
    await page.evaluate(()=>testHost.fail='temp');await page.getByLabel('Temperature pressure level').selectOption('300');
    await page.getByRole('alert').filter({hasText:'Temperature: HTTP 503'}).waitFor();await active('gh:700');
    await page.evaluate(()=>testHost.fail='');await page.getByRole('button',{name:'Refresh',exact:true}).click();await active('gh:700,temp:300');scenarios++;
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames.at(-1).validTime)+10800000);
    await page.getByRole('alert').filter({hasText:'Outside selected model forecast range'}).first().waitFor();await active('');
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames.find(f=>Date.parse(f.validTime)>=Date.now()-5400000).validTime));await active('gh:700,temp:300');scenarios++;
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.runTime)+360*3600000);
    await active('gh:700,temp:300');
    await page.waitForFunction(()=>document.querySelector('[data-testid="contour-time"]')?.textContent.includes('Valid'));
    assert.equal(await page.getByRole('alert').count(),0);scenarios++;
    await page.evaluate(()=>{testHost.requests=[];testHost.store.set('product','gfs')});
    await page.waitForFunction(()=>document.querySelector('[data-synoptic-contours]')?.dataset.product==='gfs');
    await active('gh:700,temp:300');
    assert.ok(await page.evaluate(()=>testHost.requests.length>0&&testHost.requests.every(r=>r.product==='gfs')));
    assert.deepEqual(await page.evaluate(()=>[testHost.store.get('overlay'),testHost.store.get('level')]),['wind','surface']);scenarios++;
    await page.evaluate(()=>testHost.store.set('product','icon'));await active('');
    await page.getByRole('alert').filter({hasText:'Outside selected model forecast range'}).first().waitFor();
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.runTime));await active('gh:700,temp:300');scenarios++;
    await page.evaluate(()=>testHost.store.set('product','mblue'));await active('');
    await page.getByRole('alert').first().waitFor();
    await page.evaluate(()=>{testHost.delay=100;testHost.store.set('product','gfs')});
    await page.waitForTimeout(200);
    await page.evaluate(()=>{testHost.delay=0;testHost.store.set('product','ecmwf')});
    await active('gh:700,temp:300');
    await page.waitForTimeout(200);
    assert.equal(await page.locator('[data-synoptic-contours]').getAttribute('data-product'),'ecmwf');scenarios++;
    await page.getByLabel('Enable isolines').uncheck();await active('');await page.getByLabel('Enable isolines').check();await active('gh:700,temp:300');scenarios++;
    await page.getByRole('button',{name:'Clear all',exact:true}).click();await active('');
    await page.getByRole('button',{name:'Synoptic preset',exact:true}).click();await active('gh:500,temp:850');scenarios++;
    await page.locator('.more > summary').click();
    assert.ok(await page.locator('.panel').evaluate(el=>el.getBoundingClientRect().height<250),'Compact panel should stay below 250px');
    if(viewport.width<=600){
      const belowTimeline=()=>page.evaluate(()=>{
        const timeline=document.querySelector('#timeline').getBoundingClientRect(),dock=document.querySelector('.atlas-controls').getBoundingClientRect();
        return dock.top>=timeline.bottom && dock.bottom<=innerHeight && dock.left>=0 && dock.right<=innerWidth;
      });
      assert.equal(await belowTimeline(),true,'Mobile controller must be below timeline and within screen');
      await page.setViewportSize({width:844,height:390});
      await page.waitForFunction(()=>document.querySelector('.atlas-controls')?.parentElement===document.body);
      await page.setViewportSize(viewport);
      await page.waitForFunction(()=>document.querySelector('.atlas-controls')?.parentElement?.id==='bottom-wrapper');
      assert.equal(await belowTimeline(),true,'Dock should recover after rotation');
      await page.evaluate(()=>document.querySelector('#bottom-wrapper').remove());
      await page.waitForFunction(()=>document.querySelector('.atlas-controls')?.parentElement===document.body);
      await page.evaluate(()=>document.body.insertAdjacentHTML('beforeend','<section id="bottom-wrapper"><div id="timeline">Windy timeline</div><span data-plugin="bottom-below-controls-mobile"></span></section>'));
      await page.waitForFunction(()=>document.querySelector('.atlas-controls')?.parentElement?.id==='bottom-wrapper');
      assert.equal(await belowTimeline(),true,'Dock should recover after timeline remount');scenarios++;
    }
    await page.locator('.panel').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`test-output/standalone-${viewport.width}.png`});
    await page.getByRole('button',{name:'Minimize panel'}).click();await page.getByRole('button',{name:'Synoptic Atlas',exact:true}).click();scenarios++;
    if(viewport.width>600){
      assert.equal(await page.locator('.native-plugin-frame').isVisible(),false,'Only the left controller should remain on desktop');
      assert.ok(await page.locator('.atlas-controls').evaluate(el=>el.getBoundingClientRect().left<40));
    }
    await page.getByRole('button',{name:'Close plugin',exact:true}).click();
    assert.deepEqual(await page.evaluate(()=>testHost.closeRequests),[['rqstClose','windy-plugin-synoptic-atlas']]);
    assert.equal(await page.locator('.native-plugin-frame').evaluate(el=>el.style.getPropertyValue('display')),'','Original host style should be restored on destroy');scenarios++;assert.equal(await page.locator('[data-synoptic-contours]').count(),0);
    assert.equal(await page.locator('.atlas-controls').count(),0);
    assert.equal(await page.evaluate(()=>testHost.listeners.size+[...testHost.events.values()].reduce((sum,s)=>sum+s.size,0)),0);assert.deepEqual(errors,[]);scenarios++;
    await context.close();
  }
  console.log(`${scenarios} standalone Synoptic Atlas browser scenarios passed; dedicated package identity verified, no dust interface or requests.`);
}catch(error){if(currentPage&&!currentPage.isClosed()){await currentPage.screenshot({path:'test-output/failure.png'});console.error(await currentPage.locator('body').innerText())}throw error}
finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
