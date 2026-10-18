"""Integration check: actual provider metadata AND dated PNG maps, with CORS."""
import urllib.request
from urllib.parse import urlencode
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

for endpoint, name in [('mumi', 'wideareacoverage_rgb_dust'), ('mtg_fd', 'rgb_dust')]:
    base = f'https://view.eumetsat.int/geoserver/{endpoint}/wms'
    def get(url):
        req = urllib.request.Request(url, headers={'Origin': 'https://www.windy.com'})
        with urllib.request.urlopen(req, timeout=60) as response:
            assert response.headers.get('Access-Control-Allow-Origin') == '*', 'Missing browser CORS'
            return response.read(), response.headers.get('Content-Type')
    metadata, _ = get(base + '?SERVICE=WMS&REQUEST=GetCapabilities')
    root = ET.fromstring(metadata)
    layer = next(layer for layer in root.findall('.//{*}Layer') if layer.findtext('{*}Name', '').split(':')[-1] == name)
    dimension = next(d for d in layer.findall('{*}Dimension') if d.attrib.get('name') == 'time')
    latest = dimension.attrib['default']
    assert (datetime.now(timezone.utc) - datetime.fromisoformat(latest.replace('Z', '+00:00'))).total_seconds() < 43200
    params = dict(SERVICE='WMS', VERSION='1.1.1', REQUEST='GetMap', LAYERS=name, STYLES='', SRS='EPSG:3857',
                  BBOX='3200000,3100000,5000000,4600000', WIDTH=256, HEIGHT=256, FORMAT='image/png', TRANSPARENT='true', TIME=latest)
    body, mime = get(base + '?' + urlencode(params))
    assert mime.startswith('image/png') and body[:8] == b'\x89PNG\r\n\x1a\n', (mime, body[:300])
    print(endpoint, name, 'observed', latest, 'PNG bytes', len(body), 'CORS verified')
