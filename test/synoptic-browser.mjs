import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await readFile('test-fixture/contours/latest.json','utf8'));
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#879ca9}#map{position:absolute;inset:0;overflow:hidden;z-index:2}#plugin{position:relative;z-index:0}#bottom-wrapper{display:none;position:fixed;bottom:0;left:0;right:0;z-index:9000;flex-direction:column;pointer-events:none}#timeline{pointer-events:auto;height:48px;background:#344658;color:white;box-sizing:border-box;padding:12px}@media(max-width:600px){#bottom-wrapper{display:flex}}</style></head><body><div id="map"><div class="maplibregl-canvas-container"><canvas data-weather-map></canvas></div><button id="windy-menu" style="position:absolute;top:20px;left:20px;z-index:10;background:#182c40;color:white;padding:16px">Windy menu</button></div><aside id="windy-plugin-synoptic-atlas" class="native-plugin-frame" style="position:fixed;right:12px;top:120px;z-index:9999;background:#182c40"><button aria-label="Native plugin close">×</button><div id="plugin"></div></aside><section id="bottom-wrapper"><div id="timeline">Windy timeline</div><span data-plugin="bottom-below-controls-mobile"></span></section><script type="module">
const events=new Map(),listeners=new Map(),container=document.querySelector('#map');let timestamp=${Date.parse(manifest.frames.find(f=>Date.parse(f.validTime)>=Date.now()-5400000).validTime)};
const mercator=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-85.051,Math.min(85.051,lat))*Math.PI/360));
const map={getContainer:()=>container,getSize:()=>({x:innerWidth,y:innerHeight}),getBounds:()=>({getWest:()=>10,getEast:()=>65}),latLngToContainerPoint:([lat,lon])=>({x:(lon-10)/55*innerWidth,y:(mercator(55)-mercator(lat))/(mercator(55)-mercator(5))*innerHeight}),on:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn)},off:(name,fn)=>events.get(name)?.delete(fn)};
const store={get:()=>timestamp,set:(name,value)=>{timestamp=value;for(const fn of listeners.values())fn()},on:(name,fn)=>{const key=Symbol();listeners.set(key,fn);return key},off:key=>listeners.delete(key)};
const broadcast={emit:(event,name)=>{testHost.closeRequests.push([event,name]);if(event==='rqstClose'&&name==='windy-plugin-synoptic-atlas')window.testPlugin.$destroy()}};
window.W={map:{map},store,broadcast};window.testHost={store,events,listeners,hostInputs:0,closeRequests:[]};
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
    fail='temp';await page.getByLabel('Temperature pressure level').selectOption('300');
    await page.getByRole('alert').filter({hasText:'Temperature: HTTP 503'}).waitFor();await active('gh:700');
    fail='';await page.getByRole('button',{name:'Refresh',exact:true}).click();await active('gh:700,temp:300');scenarios++;
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames.at(-1).validTime)+10800000);
    await page.getByRole('alert').filter({hasText:'No contour snapshot within 90 minutes'}).waitFor();await active('');
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.frames.find(f=>Date.parse(f.validTime)>=Date.now()-5400000).validTime));await active('gh:700,temp:300');scenarios++;
    await page.evaluate(t=>testHost.store.set('timestamp',t),Date.parse(manifest.runTime)+360*3600000);
    await active('gh:700,temp:300');
    await page.waitForFunction(()=>document.querySelector('[data-testid="contour-time"]')?.textContent.includes('Valid'));
    assert.equal(await page.getByRole('alert').count(),0);scenarios++;
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
