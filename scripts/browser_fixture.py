"""Deterministic contour fixtures; never contacts a forecast service."""
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import numpy as np
from ingest_synoptic import write_field, GRID, LEVELS, UNITS, iso

root = Path('test-fixture')
root.mkdir(exist_ok=True)
now = datetime.now(timezone.utc).replace(microsecond=0)
run = now.replace(hour=now.hour // 6 * 6, minute=0, second=0)
start = now.replace(hour=now.hour // 3 * 3, minute=0, second=0)
token = run.strftime('%Y%m%d_%H')
synoptic = root / 'contours'
syn_frames = []
lat, lon = np.meshgrid(np.linspace(-90, 90, 145), -180 + np.arange(288) * 1.25, indexing='ij')
for i in range(2):
    valid = start + timedelta(hours=i * 3)
    slp = 1010 + 15 * np.sin(np.deg2rad(lat * 2)) + 10 * np.cos(np.deg2rad(lon)) + i
    write_field(synoptic, token, valid, 'mslp', 0, slp, run)
    for level, height, temperature in [(925, 75, 15), (850, 150, 10), (700, 300, 0), (500, 560, -15), (300, 920, -40)]:
        gh = height + 40 * np.sin(np.deg2rad(lat * 2)) + 20 * np.cos(np.deg2rad(lon)) + i * 4
        temp = temperature - 40 * np.abs(lat) / 90 + 10 * np.sin(np.deg2rad(lon)) + i
        write_field(synoptic, token, valid, 'gh', level, gh, run)
        write_field(synoptic, token, valid, 'temp', level, temp, run)
    syn_frames.append({'validTime': iso(valid)})
syn_manifest = {'schemaVersion': 1, 'source': 'NASA GEOS-FP', 'collection': 'inst3_3d_asm_Np',
                'runTime': iso(run), 'retrievedAt': iso(now), 'grid': GRID, 'levels': LEVELS, 'units': UNITS, 'frames': syn_frames}
(synoptic / 'latest.json').write_text(json.dumps(syn_manifest), encoding='utf-8')
