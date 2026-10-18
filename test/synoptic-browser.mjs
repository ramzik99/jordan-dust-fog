import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await readFile('test-fixture/contours/latest.json','utf8'));
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#879ca9}#map{position:absolute;inset:0;overflow:hidden}</style></head><body><div id="map"></div><div id="plugin"></div><script type="module">
const events=new Map(),listeners=new Map(),container=document.querySelector('#map');let timestamp=${Date.parse(manifest.frames[0].validTime)};
const mercator=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-85.051,Math.min(85.051,lat))*Math.PI/360));
const map={getContainer:()=>container,getSize:()=>({x:innerWidth,y:innerHeight}),getBounds:()=>({getWest:()=>10,getEast:()=>65}),latLngToContainerPoint:([lat,lon])=>({x:(lon-10)/55*innerWidth,y:(mercator(55)-mercator(lat))/(mercator(55)-mercator(5))*innerHeight}),on:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn)},off:(name,fn)=>events.get(name)?.delete(fn)};
const store={get:()=>timestamp,set:(name,value)=>{timestamp=value;for(const fn of listeners.values())fn()},on:(name,fn)=>{const key=Symbol();listeners.set(key,fn);return key},off:key=>listeners.delete(key)};
window.W={map:{map},store};window.testHost={store,events,listeners};const mod=await import('/plugin.js');
if(mod.__pluginConfig.name!=='windy-plugin-synoptic-atlas')throw Error('Wrong plugin identity: '+mod.__pluginConfig.name);
window.testPlugin=new mod.default({target:document.querySelector('#plugin')});
</script></body></html>`;
const server=createServer(async(req,res)=>{try{res.setHeader('Content-Type',req.url==='/plugin.js'?'text/javascript':'text/html');res.end(req.url==='/plugin.js'?await readFile('synoptic-atlas/dist/plugin.js'):html)}catch(error){res.writeHead(500).end(String(error))}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));await mkdir('synoptic-atlas/test-output',{recursive:true});
const browser=await chromium.launch({headless:true});let currentPage,scenarios=0;
try{
  for(const viewport of [{width:1365,height:1000},{width:390,height:844}]){
    const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];currentPage=page;let fail='';
    page.on('pageerror',error=>{errors.push(String(error));console.error(String(error))});
    await page.route('https://raw.githubusercontent.com/**',async route=>{
      const url=new URL(route.request().url());
      assert.ok(url.pathname.includes('/geos-synoptic-data/contours/'),'Standalone plugin must only request contour data');
      const path=url.pathname.split('/contours/')[1];
      if(fail&&path.includes('/'+fail+'-')){await route.fulfill({status:503,body:'Unavailable',headers:{'Access-Control-Allow-Origin':'*'}});return;}
      await route.fulfill({contentType:path.endsWith('.gz')?'application/gzip':'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:await readFile('test-fixture/contours/'+path)});
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('region',{name:'Synoptic Atlas',exact:true}).waitFor();
    assert.doesNotMatch(await page.locator('body').innerText(),/dust|satellite/i);
    assert.equal(await page.locator('[data-geos-dust]').count(),0);scenarios++;
    const active=expected=>page.waitForFunction(expected=>document.querySelector('[data-synoptic-contours]')?.dataset.layers===expected,expected);
    await page.getByRole('button',{name:'Synoptic preset',exact:true}).click();await active('gh:500,mslp:0,temp:850');scenarios++;
    for(const [field,remaining] of [['Geopotential height','mslp:0,temp:850'],['Temperature','gh:500,mslp:0'],['MSLP','gh:500,temp:850']]){
      await page.getByLabel(field+' isolines',{exact:true}).uncheck();await active(remaining);
      await page.getByLabel(field+' isolines',{exact:true}).check();await active('gh:500,mslp:0,temp:850');scenarios++;
    }
    await page.getByLabel('Geopotential height pressure level').selectOption('700');await active('gh:700,mslp:0,temp:850');
    await page.getByLabel('Temperature pressure level').selectOption('500');await active('gh:700,mslp:0,temp:500');scenarios++;
    await page.getByLabel('Geopotential height contour spacing').selectOption('12');
    await page.getByLabel('Contour labels',{exact:true}).uncheck();await page.getByLabel('Contour labels',{exact:true}).check();await active('gh:700,mslp:0,temp:500');scenarios++;
    fail='temp';await page.getByLabel('Temperature pressure level').selectOption('300');
    await page.getByRole('alert').filter({hasText:'Temperature: HTTP 503'}).waitFor();await active('gh:700,mslp:0');
    fail='';await page.getByRole('button',{name:'Refresh',exact:true}).click();await active('gh:700,mslp:0,temp:300');scenarios++;
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames[1].validTime)+10800000);
    await page.getByRole('alert').filter({hasText:'No contour snapshot within 90 minutes'}).waitFor();await active('');
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames[0].validTime));await active('gh:700,mslp:0,temp:300');scenarios++;
    await page.getByLabel('Enable isolines').uncheck();await active('');await page.getByLabel('Enable isolines').check();await active('gh:700,mslp:0,temp:300');scenarios++;
    await page.getByRole('button',{name:'Clear all',exact:true}).click();await active('');
    await page.getByRole('button',{name:'Synoptic preset',exact:true}).click();await active('gh:500,mslp:0,temp:850');scenarios++;
    await page.locator('.panel').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`synoptic-atlas/test-output/standalone-${viewport.width}.png`});
    await page.getByRole('button',{name:'Minimize panel'}).click();await page.getByRole('button',{name:'Synoptic Atlas',exact:true}).click();scenarios++;
    await page.evaluate(()=>testPlugin.$destroy());assert.equal(await page.locator('[data-synoptic-contours]').count(),0);
    assert.equal(await page.evaluate(()=>testHost.listeners.size+[...testHost.events.values()].reduce((sum,s)=>sum+s.size,0)),0);assert.deepEqual(errors,[]);scenarios++;
    await context.close();
  }
  console.log(`${scenarios} standalone Synoptic Atlas browser scenarios passed; dedicated package identity verified, no dust interface or requests.`);
}catch(error){if(currentPage&&!currentPage.isClosed()){await currentPage.screenshot({path:'synoptic-atlas/test-output/failure.png'});console.error(await currentPage.locator('body').innerText())}throw error}
finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
