"""Deterministic source-grid fixtures; never contacts a forecast service."""
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import numpy as np
from PIL import Image
from native_dust import write_native_frame
from ingest_synoptic import write_field, GRID, LEVELS, UNITS

root = Path('test-fixture')
root.mkdir(exist_ok=True)
now = datetime.now(timezone.utc).replace(microsecond=0)
run = now.replace(hour=now.hour // 6 * 6, minute=0, second=0)
start = now.replace(hour=now.hour // 3 * 3, minute=0, second=0)
iso = lambda d: d.strftime('%Y-%m-%dT%H:%M:%SZ')
token = run.strftime('%Y%m%d_%H')
frames = []
for i in range(2):
    a = start + timedelta(hours=i * 3)
    valid = a + timedelta(minutes=90)
    stamp = valid.strftime('%Y%m%dT%H%M%SZ')
    fields = {key: np.full((721, 1152), value, dtype=float) for key, value in
              [('dustSurface', [40, 300][i]), ('dustFine', [4, 30][i]), ('dustAod', [.1, .4][i])]}
    for values in fields.values():
        values[0, 0] = np.nan
        values[-1, 0] = 0
    directory = Path('native/runs') / token
    scales = write_native_frame(fields, root / directory, stamp)
    frames.append({'start': iso(a), 'end': iso(a + timedelta(hours=3)), 'validTime': iso(valid),
                   'path': f'runs/{token}/{stamp}.json.gz',
                   'native': {'encoding': 'log16-rgb-pair-v1', 'width': 1152, 'height': 721,
                              'scales': scales, 'massPath': f'{directory.as_posix()}/{stamp}.mass.png',
                              'opticsPath': f'{directory.as_posix()}/{stamp}.optics.png'}})
manifest = {'schemaVersion': 2, 'source': 'NASA GEOS-FP', 'coverage': 'global',
            'runTime': iso(run), 'retrievedAt': iso(now),
            'sampling': {'latitudeDegrees': 1.25, 'longitudeDegrees': 1.25},
            'nativeResolution': {'latitudeDegrees': .25, 'longitudeDegrees': .3125},
            'units': {'dustSurface': 'ug m-3', 'dustFine': 'ug m-3', 'dustAod': '1'},
            'latitudes': [-90 + i * 1.25 for i in range(145)],
            'longitudes': [-180 + i * 1.25 for i in range(288)], 'frames': frames}
(root / 'latest.json').write_text(json.dumps(manifest), encoding='utf-8')
Image.new('RGB', (64, 64), (205, 70, 180)).save(root / 'satellite.png')

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
