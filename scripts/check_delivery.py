"""Check published native delivery, including the browser CORS headers."""
import json
import urllib.request
from datetime import datetime, timezone

base = 'https://raw.githubusercontent.com/ramzik99/jordan-dust-fog/geos-dust-data/global/'
def get(path):
    req = urllib.request.Request(base + path, headers={'Origin': 'https://www.windy.com'})
    with urllib.request.urlopen(req, timeout=60) as response:
        assert response.headers.get('Access-Control-Allow-Origin') == '*', 'Missing native data CORS'
        return response.read()

manifest = json.loads(get('latest.json'))
now = datetime.now(timezone.utc)
run = datetime.fromisoformat(manifest['runTime'].replace('Z', '+00:00'))
assert 0 <= (now - run).total_seconds() <= 36 * 3600, 'Stale run'
descriptor = next(f for f in manifest['frames'] if datetime.fromisoformat(f['end'].replace('Z', '+00:00')) > now)
info = descriptor['native']
assert (info['width'], info['height']) == (1152, 721)
for key in ['massPath', 'opticsPath']:
    body = get(info[key])
    assert body[:8] == b'\x89PNG\r\n\x1a\n'
    assert (int.from_bytes(body[16:20], 'big'), int.from_bytes(body[20:24], 'big')) == (1152, 721)
    print(key, len(body), 'bytes; native dimensions and CORS verified')
print('Live native delivery: run', manifest['runTime'], 'periods', len(manifest['frames']))
