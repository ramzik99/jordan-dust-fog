"""Publish sampled GEOS-FP instantaneous meteorology for independent isolines."""
import argparse
from datetime import datetime, timedelta, timezone
import gzip
import json
from pathlib import Path
import re
import socket
import urllib.request
import numpy as np
BASE = 'https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast'
UTC = timezone.utc

def iso(value):
    return value.astimezone(UTC).isoformat(timespec='seconds').replace('+00:00', 'Z')

COLLECTION = 'inst3_3d_asm_Np'
LEVELS = [925, 850, 700, 500, 300]
UNITS = {'gh': 'dam', 'temp': 'degC', 'mslp': 'hPa'}
GRID = {'width': 288, 'height': 145, 'longitudeStart': -180, 'latitudeStart': -90, 'step': 1.25}

def convert_field(values, field, surface_pressure=None, level=None):
    raw = np.asarray(values, dtype=float)
    bounds = {'gh': (-1000, 60000), 'temp': (100, 400), 'mslp': (80000, 110000)}
    lo, hi = bounds[field]
    valid = np.isfinite(raw) & (raw >= lo) & (raw <= hi)
    if surface_pressure is not None and level is not None:
        ps = np.asarray(surface_pressure, dtype=float)
        valid &= np.isfinite(ps) & (ps >= level * 100) & (ps < 1e14)
    result = raw - 273.15 if field == 'temp' else raw / (10 if field == 'gh' else 100)
    return np.where(valid, np.round(result, 1), np.nan)

def write_field(root, token, valid, field, level, values, run):
    stamp = valid.strftime('%Y%m%dT%H%M%SZ')
    path = root / 'runs' / token / stamp / f'{field}-{level}.json.gz'
    path.parent.mkdir(parents=True, exist_ok=True)
    flat = np.asarray(values).ravel()
    product = {'schemaVersion': 1, 'runTime': iso(run), 'validTime': iso(valid), 'field': field,
               'level': level, 'units': UNITS[field], 'values': [float(v) if np.isfinite(v) else None for v in flat]}
    body = json.dumps(product, separators=(',', ':'), allow_nan=False).encode()
    path.write_bytes(gzip.compress(body, compresslevel=6, mtime=0))

def decoded_times(source):
    import cftime
    decoded = cftime.num2date(source.time.values, source.time.attrs['units'],
                             calendar=source.time.attrs.get('calendar', 'standard'), only_use_cftime_datetimes=False)
    return [datetime(t.year, t.month, t.day, t.hour, t.minute, t.second, tzinfo=UTC) for t in decoded]

def retrieve(token, run, now, root):
    import xarray as xr
    url = f'{BASE}/{COLLECTION}/{COLLECTION}.{token}'
    previous = json.loads((root / 'latest.json').read_text()) if (root / 'latest.json').exists() else None
    if previous and previous['runTime'] > iso(run):
        raise ValueError('Refusing to regress contour run')
    with xr.open_dataset(url, engine='netcdf4', decode_times=False) as source:
        for key, dims in [('h', ('time', 'lev', 'lat', 'lon')), ('t', ('time', 'lev', 'lat', 'lon')),
                          ('slp', ('time', 'lat', 'lon')), ('ps', ('time', 'lat', 'lon'))]:
            if key not in source or source[key].dims != dims:
                raise ValueError(f'Unexpected source dimensions for {key}')
            units = str(source[key].attrs.get('units', '')).strip().lower()
            accepted = {'h': ('m', 'meter', 'metres'), 't': ('k', 'kelvin'), 'slp': ('pa',), 'ps': ('pa',)}
            if units and units not in accepted[key]:
                raise ValueError(f'Unexpected source units for {key}: {units}')
        ys, xs = np.asarray(source.lat.values), np.asarray(source.lon.values)
        if ys.shape != (721,) or xs.shape != (1152,) or not np.allclose(ys, np.linspace(-90, 90, 721)) or not np.allclose(xs, -180 + np.arange(1152) * .3125):
            raise ValueError('Unexpected source grid')
        lev_units = str(source.lev.attrs.get('units', '')).lower()
        if lev_units not in ('millibar', 'hpa', 'mb'):
            raise ValueError('Unexpected pressure-level units')
        levels = source.lev.values.tolist()
        if any(level not in levels for level in LEVELS):
            raise ValueError('Missing requested pressure level')
        times = decoded_times(source)
        if any(b - a != timedelta(hours=3) for a, b in zip(times, times[1:])):
            raise ValueError('Unexpected instantaneous time cadence')
        indices = [i for i, valid in enumerate(times) if max(run, now - timedelta(hours=3)) <= valid <= run + timedelta(hours=120)]
        if len(indices) < 2 or times[indices[-1]] <= now:
            raise ValueError('Insufficient future meteorological snapshots')
        selection = dict(time=slice(indices[0], indices[-1] + 1), lat=slice(None, None, 5), lon=slice(None, None, 4))
        print(f'Downloading {len(indices)} instantaneous snapshots for {token}', flush=True)
        ps = source.ps.isel(**selection).values
        slp = source.slp.isel(**selection).values
        for i, original in enumerate(indices):
            values = convert_field(slp[i], 'mslp')
            if np.isfinite(values).sum() < values.size * .5:
                raise ValueError('Incomplete mean sea-level pressure field')
            write_field(root, token, times[original], 'mslp', 0, values, run)
        for field, name in [('gh', 'h'), ('temp', 't')]:
            for level in LEVELS:
                raw = source[name].isel(lev=levels.index(level), **selection).values
                for i, original in enumerate(indices):
                    values = convert_field(raw[i], field, ps[i], level)
                    if np.isfinite(values).sum() < values.size * .25:
                        raise ValueError(f'Incomplete {field} field at {level} hPa')
                    write_field(root, token, times[original], field, level, values, run)
                print(f'Encoded {field} at {level} hPa', flush=True)
        product = {'schemaVersion': 1, 'source': 'NASA GEOS-FP', 'collection': COLLECTION, 'datasetUrl': url,
                   'runTime': iso(run), 'retrievedAt': iso(now), 'grid': GRID, 'levels': LEVELS, 'units': UNITS,
                   'temporalSampling': '3-hourly instantaneous snapshots; not dust averaging intervals',
                   'spatialSampling': '1.25-degree native-node sampling for synoptic contours',
                   'unitBasis': 'GEOS-FP file specification; checked against source units when supplied',
                   'frames': [{'validTime': iso(times[i])} for i in indices]}
        root.mkdir(parents=True, exist_ok=True)
        (root / 'latest.json').write_text(json.dumps(product, separators=(',', ':')), encoding='utf-8')
    # Only generated, strictly named run directories inside this output root are pruned.
    keep = {token}
    if previous:
        keep.add(datetime.fromisoformat(previous['runTime'].replace('Z', '+00:00')).strftime('%Y%m%d_%H'))
    runs = (root / 'runs').resolve()
    for old in runs.iterdir():
        if old.is_symlink() or not old.is_dir() or old.name in keep or not re.fullmatch(r'\d{8}_\d{2}', old.name):
            continue
        for stamp in old.iterdir():
            if stamp.is_symlink() or not stamp.is_dir() or not re.fullmatch(r'\d{8}T\d{6}Z', stamp.name):
                continue
            for item in stamp.glob('*.json.gz'):
                if item.resolve().is_relative_to(runs):
                    item.unlink()
            if not any(stamp.iterdir()):
                stamp.rmdir()
        if not any(old.iterdir()):
            old.rmdir()
    print(f"Validated contour run {product['runTime']} with {len(product['frames'])} snapshots", flush=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='generated/contours')
    args = parser.parse_args()
    socket.setdefaulttimeout(60)
    now = datetime.now(UTC)
    with urllib.request.urlopen(f'{BASE}/{COLLECTION}/', timeout=60) as response:
        html = response.read().decode()
    candidates = []
    for token in set(re.findall(re.escape(COLLECTION) + r'\.(\d{8}_\d{2})', html)):
        try:
            run = datetime.strptime(token, '%Y%m%d_%H').replace(tzinfo=UTC)
            if run.hour in (0, 6, 12, 18) and timedelta(0) <= now - run <= timedelta(hours=36):
                candidates.append((run, token))
        except ValueError:
            continue
    errors = []
    for run, token in sorted(candidates, reverse=True)[:3]:
        try:
            retrieve(token, run, now, Path(args.output))
            return
        except Exception as exc:
            print(f'Contour cycle {token} failed: {exc}', flush=True)
            errors.append(f'{token}: {exc}')
    raise RuntimeError('GEOS meteorology retrieval failed: ' + '; '.join(errors))

if __name__ == '__main__':
    main()
