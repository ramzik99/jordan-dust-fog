"""Prepare source-grid GEOS-FP dust for the browser, without spatial downsampling.

Each native point uses 16-bit logarithmic packing per field. Two opaque RGB PNGs
carry the six bytes, avoiding browser alpha-premultiplication changes to data.
"""
import argparse
from datetime import datetime, timedelta
import json
from pathlib import Path
import re
import socket
import urllib.request
import numpy as np
from PIL import Image
from ingest_geos import BASE, COLLECTION, VARIABLES, UTC, iso, find_cycles, make_intervals, clean_value, write_global

ENCODING = 'log16-rgb-pair-v1'

def pack_field(values):
    values = np.asarray(values, dtype=np.float64)
    valid = np.isfinite(values) & (values >= 0) & (values < 1e14)
    maximum = float(np.max(values[valid])) if valid.any() else 0.0
    scale = max(float(np.log1p(maximum)), 1.0) / 65534.0
    codes = np.full(values.shape, 65535, dtype=np.uint16)
    codes[valid] = np.rint(np.log1p(values[valid]) / scale).astype(np.uint16)
    codes[valid & (values > 0)] = np.maximum(codes[valid & (values > 0)], 1)
    return codes, scale

def write_native_frame(fields, directory, stamp):
    codes, scales = {}, {}
    for key, values in fields.items():
        codes[key], scales[key] = pack_field(values)
    a, b, c = (codes[k] for k in ('dustSurface', 'dustFine', 'dustAod'))
    mass = np.stack([a >> 8, a & 255, b >> 8], axis=-1).astype(np.uint8)
    optics = np.stack([b & 255, c >> 8, c & 255], axis=-1).astype(np.uint8)
    directory.mkdir(parents=True, exist_ok=True)
    for suffix, pixels in [('mass', mass), ('optics', optics)]:
        target = directory / f'{stamp}.{suffix}.png'
        temporary = target.with_suffix('.png.tmp')
        Image.fromarray(pixels).save(temporary, format='PNG', compress_level=6)
        temporary.replace(target)
    return scales

def retrieve(token, run, now, output):
    import cftime
    import xarray as xr
    url = f'{BASE}/{COLLECTION}/{COLLECTION}.{token}'
    with xr.open_dataset(url, engine='netcdf4', decode_times=False) as source:
        for name in VARIABLES:
            if name not in source or source[name].dims != ('time', 'lat', 'lon'):
                raise ValueError(f'Missing source field or dimensions: {name}')
            unit = str(source[name].attrs.get('units', '')).replace(' ', '').lower()
            accepted = ('1', 'dimensionless') if name == 'duexttau' else ('kgm-3', 'kg/m3', 'kgm^-3', 'kg/m^3')
            if unit and unit not in accepted:
                raise ValueError(f'Unexpected units for {name}: {unit}')
        ys, xs = source.lat.values.tolist(), source.lon.values.tolist()
        if len(ys) != 721 or len(xs) != 1152 or ys[0] != -90 or ys[-1] != 90 or xs[0] != -180 or xs[-1] != 179.6875:
            raise ValueError('Unexpected native GEOS grid')
        if any(abs(b - a - .25) > 1e-7 for a, b in zip(ys, ys[1:])) or any(abs(b - a - .3125) > 1e-7 for a, b in zip(xs, xs[1:])):
            raise ValueError('Nonuniform native grid')
        decoded = cftime.num2date(source.time.values, source.time.attrs['units'],
            calendar=source.time.attrs.get('calendar', 'standard'), only_use_cftime_datetimes=False)
        times = [datetime(t.year, t.month, t.day, t.hour, t.minute, t.second, tzinfo=UTC) for t in decoded]
        intervals = make_intervals(times, run)
        selected = [i for i, (start, end) in enumerate(intervals)
            if start >= run and end > now and end <= run + timedelta(hours=120)]
        if not selected:
            raise ValueError('No supported future native intervals')
        # Keep native arrays numeric; do not expand millions of values into Python lists.
        print(f'Downloading {len(selected)} native periods from {token}', flush=True)
        data = source[list(VARIABLES)].isel(time=slice(selected[0], selected[-1] + 1)).load()
        print('Native arrays downloaded; encoding frames', flush=True)
        previous = json.loads(output.read_text(encoding='utf-8')) if output.exists() else None
        if previous and previous['runTime'] > iso(run):
            raise ValueError('Refusing to regress the model cycle')
        frames = []
        any_valid = False
        for local_index, original_index in enumerate(selected):
            start, end = intervals[original_index]
            frame = {'start': iso(start), 'end': iso(end), 'validTime': iso(times[original_index])}
            fields = {}
            for source_name, (key, factor) in VARIABLES.items():
                raw = np.asarray(data[source_name].isel(time=local_index).values, dtype=np.float64)
                fields[key] = np.where(np.isfinite(raw) & (raw >= 0) & (raw < 1e14), raw * factor, np.nan)
                frame[key] = [[clean_value(v, 1) for v in row] for row in fields[key][::5, ::4]]
            any_valid = any_valid or bool(np.isfinite(fields['dustSurface']).any())
            stamp = times[original_index].strftime('%Y%m%dT%H%M%SZ')
            directory = output.parent / 'native' / 'runs' / token
            scales = write_native_frame(fields, directory, stamp)
            frame['native'] = {'encoding': ENCODING, 'width': 1152, 'height': 721, 'scales': scales,
                'massPath': f'native/runs/{token}/{stamp}.mass.png',
                'opticsPath': f'native/runs/{token}/{stamp}.optics.png'}
            frames.append(frame)
            print(f'Encoded {local_index + 1}/{len(selected)} native periods', flush=True)
        if not any_valid:
            raise ValueError('Native dust surface field is entirely missing')
        product = {'schemaVersion': 1, 'source': 'NASA GEOS-FP', 'datasetUrl': url,
            'runTime': iso(run), 'retrievedAt': iso(now), 'coverage': 'global',
            'nativeResolution': {'latitudeDegrees': .25, 'longitudeDegrees': .3125},
            'sampling': {'latitudeDegrees': 1.25, 'longitudeDegrees': 1.25, 'method': 'native-node subsampling'},
            'units': {'dustSurface': 'ug m-3', 'dustFine': 'ug m-3', 'dustAod': '1'},
            'averaging': '3-hour mean, timestamp at interval centre',
            'packing': 'Native source-grid values use 16-bit log1p quantization; 65535 means missing; zero stays zero',
            'latitudes': ys[::5], 'longitudes': xs[::4], 'frames': frames}
        write_global(product, output)
        keep = {token}
        if previous:
            keep.add(datetime.fromisoformat(previous['runTime'].replace('Z', '+00:00')).strftime('%Y%m%d_%H'))
        root = (output.parent / 'native' / 'runs').resolve()
        for old in root.iterdir():
            if old.name in keep or old.is_symlink() or not old.is_dir() or not re.fullmatch(r'\d{8}_\d{2}', old.name):
                continue
            for item in old.glob('*.png'):
                if item.resolve().is_relative_to(root):
                    item.unlink()
            if not any(old.iterdir()):
                old.rmdir()
        return product

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='generated/global/latest.json')
    args = parser.parse_args()
    socket.setdefaulttimeout(45)
    now = datetime.now(UTC)
    with urllib.request.urlopen(f'{BASE}/{COLLECTION}/', timeout=45) as response:
        cycles = find_cycles(response.read().decode('utf-8'), now)
    errors = []
    for run, token in cycles[:3]:
        try:
            product = retrieve(token, run, now, Path(args.output))
            print(f"Validated source export: {product['runTime']}, {len(product['frames'])} native periods", flush=True)
            return
        except Exception as exc:
            print(f'Native cycle {token} failed: {exc}', flush=True)
            errors.append(f'{token}: {exc}')
    raise RuntimeError('Native GEOS retrieval failed: ' + '; '.join(errors))

if __name__ == '__main__':
    main()
