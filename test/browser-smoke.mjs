const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const manifest = JSON.parse(await readFile('test-fixture/latest.json', 'utf8'));
const root = new URL('../', import.meta.url);
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#879ca9}#map{position:absolute;inset:0;overflow:hidden}#plugin{position:relative}</style></head><body><div id="map"></div><div id="plugin"></div><script type="module">
const container=document.querySelector('#map'), events=new Map(), clicks=new Map(), listeners=new Map(); let time=${Date.parse(manifest.frames[0].validTime)}, bounds={west:10,east:65,south:5,north:55};
const mercator=lat=>Math.log(Math.tan(Math.PI/4+Math.max(-85.051,Math.min(85.051,lat))*Math.PI/360));
const map={getContainer:()=>container,getSize:()=>({x:innerWidth,y:innerHeight}), getBounds:()=>({getWest:()=>bounds.west,getEast:()=>bounds.east,getSouth:()=>bounds.south,getNorth:()=>bounds.north}),
latLngToContainerPoint:([lat,lon])=>({x:(lon-bounds.west)/(bounds.east-bounds.west)*innerWidth,y:(mercator(bounds.north)-mercator(lat))/(mercator(bounds.north)-mercator(bounds.south))*innerHeight}),
panTo:([lat,lon])=>{bounds={west:lon-25,east:lon+25,south:Math.max(-85,lat-20),north:Math.min(85,lat+20)};for(const name of ['move','moveend'])for(const fn of events.get(name)||[])fn()},
on:(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn)},off:(name,fn)=>events.get(name)?.delete(fn),removeLayer:()=>{}};
const store={get:()=>time,set:(name,value)=>{time=value;for(const fn of listeners.values())fn()},on:(name,fn)=>{const key=Symbol();listeners.set(key,fn);return key},off:key=>listeners.delete(key)};
window.W={map:{map},store,singleclick:{register:()=>{},release:()=>{},singleclick:{on:(name,fn)=>clicks.set(name,fn),off:name=>clicks.delete(name)}}};
window.L={circleMarker:()=>({addTo:()=>({})})}; window.testHost={map,store,events,clicks,listeners};
const mod=await import('/dist/plugin.js'); window.testPlugin=new mod.default({target:document.querySelector('#plugin')});
</script></body></html>`;
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
    if (req.url === '/dist/plugin.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(await readFile(new URL('dist/plugin.js', root))); return; }
    res.writeHead(404).end();
  } catch (error) { res.writeHead(500).end(String(error)); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
await mkdir('test-output', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
let scenarios = 0, activePage;
try {
  for (const viewport of [{ width: 1365, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage(), errors = []; activePage = page; let satFail = false, manifestFail = false;
    page.on('pageerror', error => { errors.push(String(error)); console.error('Page error:', String(error)); });
    page.on('console', msg => { if (msg.type() === 'error') console.error('Browser console:', msg.text()); });
    page.on('requestfailed', request => console.error('Failed request:', request.url(), request.failure()?.errorText));
    await page.route('https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-dust-data/global/**', async route => {
      const path = new URL(route.request().url()).pathname.split('/global/')[1];
      if (manifestFail && path === 'latest.json') { await route.fulfill({ status: 503, body: 'Unavailable', headers: { 'Access-Control-Allow-Origin': '*' } }); return; }
      await route.fulfill({ status: 200, contentType: path.endsWith('.png') ? 'image/png' : 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' }, body: await readFile(new URL('test-fixture/' + path, root)) });
    });
    await page.route('https://view.eumetsat.int/geoserver/**', async route => {
      const u = new URL(route.request().url()), request = u.searchParams.get('REQUEST');
      if (satFail) { await route.fulfill({ status: 503, body: 'Unavailable', headers: { 'Access-Control-Allow-Origin': '*' } }); return; }
      if (request === 'GetCapabilities') {
        const mtg = u.pathname.includes('mtg_fd'), latest = new Date(Math.floor(Date.now() / (mtg ? 600000 : 10800000)) * (mtg ? 600000 : 10800000)).toISOString();
        const text = `<WMS_Capabilities><Capability><Layer><Layer><Name>${mtg ? 'rgb_dust' : 'wideareacoverage_rgb_dust'}</Name><Dimension name="time" default="${latest}">${new Date(Date.now() - 86400000).toISOString()}/${latest}/${mtg ? 'PT10M' : 'PT3H'}</Dimension></Layer></Layer></Capability></WMS_Capabilities>`;
        await route.fulfill({ contentType: 'text/xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: text });
      } else await route.fulfill({ contentType: 'image/png', headers: { 'Access-Control-Allow-Origin': '*' }, body: await readFile('test-fixture/satellite.png') });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const value = page.getByTestId('point-value');
    await value.filter({ hasText: '40.0' }).waitFor(); scenarios++;
    assert.match(await page.getByTestId('threshold-state').innerText(), /Below/);
    await page.getByLabel('Dust threshold').fill('30');
    await page.getByLabel('Dust threshold').dispatchEvent('change');
    await page.getByTestId('threshold-state').filter({ hasText: 'Above' }).waitFor(); scenarios++;
    await page.getByLabel('Dust field').selectOption('dustFine');
    await value.filter({ hasText: '4.0' }).waitFor();
    await page.getByLabel('Dust field').selectOption('dustAod');
    await value.filter({ hasText: '0.10' }).waitFor(); scenarios++;
    const opaque = () => page.evaluate(() => { const c = document.querySelector('[data-geos-dust]'); const p = c.getContext('2d').getImageData(c.width-5, c.height/2, 1, 1).data; return p[3] > 0; });
    await page.waitForFunction(() => { const c=document.querySelector('[data-geos-dust]');return c?.getContext('2d').getImageData(c.width-5,c.height/2,1,1).data[3]>0; });
    await page.getByLabel('Show dust map').uncheck();
    await page.waitForFunction(() => { const c=document.querySelector('[data-geos-dust]');return c.getContext('2d').getImageData(c.width-5,c.height/2,1,1).data[3]===0; });
    await page.getByLabel('Show dust map').check(); scenarios++;
    await page.getByLabel('Location', { exact: true }).selectOption('Sydney');
    await page.getByLabel('Latitude', { exact: true }).fill('0'); await page.getByLabel('Longitude', { exact: true }).fill('540'); await page.getByRole('button', { name: 'Go', exact: true }).click();
    assert.match(await page.locator('.point-name').innerText(), /-180.000/);
    await page.getByRole('button', { name: 'Save place', exact: true }).click(); await page.getByRole('button', { name: 'Unsave', exact: true }).click(); scenarios++;
    await page.evaluate(t => testHost.store.set('timestamp', t), Date.parse(manifest.frames[1].validTime));
    await value.filter({ hasText: '0.40' }).waitFor();
    await page.getByLabel('Dust field').selectOption('dustSurface'); await value.filter({ hasText: '300.0' }).waitFor(); scenarios++;
    await page.getByText('Point forecast', { exact: true }).click();
    await page.getByRole('button', { name: 'Load full point forecast', exact: true }).click();
    await page.locator('tbody tr').nth(1).waitFor();
    await page.waitForFunction(() => document.querySelector('tbody')?.textContent.includes('40.0') && document.querySelector('tbody')?.textContent.includes('300.0')); scenarios++;
    await page.screenshot({ path: `test-output/forecast-${viewport.width}.png` });
    await page.getByRole('button', { name: 'Satellite', exact: true }).click();
    await page.getByTestId('observation-stamp').waitFor();
    await page.waitForFunction(() => !document.querySelector('.loading'));
    const observed = await page.getByLabel('Observation time').inputValue();
    await page.evaluate(t => testHost.store.set('timestamp', t), Date.parse(manifest.frames[0].validTime));
    assert.equal(await page.getByLabel('Observation time').inputValue(), observed); assert.equal(await opaque(), true); scenarios++;
    await page.getByLabel('Satellite source').selectOption('meteosat');
    await page.waitForFunction(() => !document.querySelector('.loading'));
    assert.ok(await page.getByLabel('Observation time').locator('option').count() > 1);
    await page.getByLabel('Observation time').selectOption({ index: 1 });
    await page.waitForFunction(() => !document.querySelector('.loading')); scenarios++;
    await page.screenshot({ path: `test-output/satellite-${viewport.width}.png` });
    satFail = true; await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Satellite metadata unavailable' }).waitFor();
    await page.waitForFunction(() => { const c=document.querySelector('[data-geos-dust]');return c.getContext('2d').getImageData(c.width-5,c.height/2,1,1).data[3]===0; }); scenarios++;
    await page.getByRole('button', { name: 'Forecast', exact: true }).click(); await value.filter({ hasText: '40.0' }).waitFor();
    await page.getByLabel('Enable plugin').uncheck(); await value.filter({ hasText: 'Unavailable' }).waitFor();
    await page.getByLabel('Enable plugin').check(); await value.filter({ hasText: '40.0' }).waitFor(); scenarios++;
    await page.getByRole('button', { name: 'Minimize panel' }).click(); await page.getByRole('button', { name: /Dust forecast/ }).click();
    manifestFail = true; await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'GEOS forecast unavailable' }).waitFor(); await value.filter({ hasText: 'Unavailable' }).waitFor(); scenarios++;
    await page.evaluate(() => testPlugin.$destroy());
    assert.equal(await page.locator('[data-geos-dust]').count(), 0);
    assert.equal(await page.evaluate(() => testHost.listeners.size + testHost.clicks.size + [...testHost.events.values()].reduce((n, set) => n + set.size, 0)), 0);
    assert.deepEqual(errors, []); scenarios++; await context.close();
  }
  console.log(`${scenarios} desktop/mobile browser scenarios passed (mock Windy host, real compiled plugin and PNG decoder).`);
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: 'test-output/failure.png' }).catch(() => {});
    console.error('Browser failure page text:', await activePage.locator('body').innerText());
  }
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
