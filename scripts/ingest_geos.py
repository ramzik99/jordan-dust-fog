"""Retrieve one pinned GEOS-FP cycle and atomically export a regional JSON forecast.

No source errors are replaced by synthetic/zero data. Run with --output data/latest.json.
"""
import argparse
from datetime import datetime, timedelta, timezone
import json
import math
from pathlib import Path
import re
import socket
import urllib.request

BASE = 'https://opendap.nccs.nasa.gov/dods/GEOS-5/fp/0.25_deg/fcast'
COLLECTION = 'tavg3_2d_aer_Nx'
VARIABLES = {'dusmass': ('dustSurface', 1e9), 'dusmass25': ('dustFine', 1e9), 'duexttau': ('dustAod', 1)}
UTC = timezone.utc

def iso(value):
    return value.astimezone(UTC).isoformat(timespec='seconds').replace('+00:00', 'Z')

def find_cycles(html, now):
    candidates = []
    for token in set(re.findall(r'tavg3_2d_aer_Nx\.(\d{8}_\d{2})', html)):
        try:
            run = datetime.strptime(token, '%Y%m%d_%H').replace(tzinfo=UTC)
        except ValueError:
            continue
        if run.hour in (0, 6, 12, 18) and timedelta(0) <= now - run <= timedelta(hours=36):
            candidates.append((run, token))
    return sorted(candidates, reverse=True)

def clean_value(value, factor):
    value = float(value)
    if not math.isfinite(value) or value < 0 or value >= 1e14:
        return None
    return round(value * factor, 5)

def make_intervals(times, run):
    if not times or any(t.tzinfo is None for t in times):
        raise ValueError('Missing or timezone-naive valid times')
    if any(b - a != timedelta(hours=3) for a, b in zip(times, times[1:])):
        raise ValueError('Unexpected GEOS sampling cadence')
    intervals = [(t - timedelta(minutes=90), t + timedelta(minutes=90)) for t in times]
    if intervals[0][0] < run:
        raise ValueError('Forecast interval predates pinned run')
    return intervals

def read_cycle(token, run, now):
    import cftime
    import numpy as np
    import xarray as xr
    url = f'{BASE}/{COLLECTION}/{COLLECTION}.{token}'
    # The 0.25_deg catalogue is 0.25 latitude by 0.3125 longitude, not square 0.25 degrees.
    with xr.open_dataset(url, engine='netcdf4', decode_times=False) as ds:
        for key in VARIABLES:
            if key not in ds or ds[key].dims != ('time', 'lat', 'lon'):
                raise ValueError(f'Missing or unexpected dimensions for {key}')
            declared = str(ds[key].attrs.get('units', '')).replace(' ', '').lower()
            accepted = ('kgm-3', 'kg/m3', 'kgm^-3', 'kg/m^3') if key != 'duexttau' else ('1', 'dimensionless')
            if declared and declared not in accepted:
                raise ValueError(f'Unexpected source units for {key}: {declared}')
        # Includes Jordan and an upwind buffer; source grid remains unchanged.
        region = ds[list(VARIABLES)].sel(lat=slice(28, 34), lon=slice(34, 40)).load()
        ys, xs = region.lat.values.tolist(), region.lon.values.tolist()
        if len(ys) < 2 or len(xs) < 2 or not all(b > a for a, b in zip(ys, ys[1:])) or not all(b > a for a, b in zip(xs, xs[1:])):
            raise ValueError('Invalid source coordinate grid')
        decoded = cftime.num2date(region.time.values, ds.time.attrs['units'],
            calendar=ds.time.attrs.get('calendar', 'standard'), only_use_cftime_datetimes=False)
        times = [datetime(t.year, t.month, t.day, t.hour, t.minute, t.second, tzinfo=UTC) for t in decoded]
        intervals = make_intervals(times, run)
        frames = []
        for i, (start, end) in enumerate(intervals):
            if end <= now or start > run + timedelta(hours=120):
                continue
            frame = {'start': iso(start), 'end': iso(end), 'validTime': iso(times[i])}
            for source, (target, factor) in VARIABLES.items():
                values = np.asarray(region[source].isel(time=i).values)
                frame[target] = [[clean_value(v, factor) for v in row] for row in values]
            frames.append(frame)
        if not frames or not any(v is not None for f in frames for row in f['dustSurface'] for v in row):
            raise ValueError('No usable future dust data')
        return {'schemaVersion': 1, 'source': 'NASA GEOS-FP', 'datasetUrl': url,
            'runTime': iso(run), 'retrievedAt': iso(now), 'averaging': '3-hour mean, timestamp at interval centre',
            'nativeResolution': {'latitudeDegrees': 0.25, 'longitudeDegrees': 0.3125},
            'units': {'dustSurface': 'ug m-3', 'dustFine': 'ug m-3', 'dustAod': '1'},
            'unitBasis': 'GEOS-FP file specification; checked against variable units when supplied',
            'latitudes': ys, 'longitudes': xs, 'frames': frames,
            'fog': {'status': 'unavailable', 'reason': 'Forecast integration pending'},
            'satellite': {'status': 'unavailable', 'reason': 'Observation feed not connected'}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='data/latest.json')
    args = parser.parse_args()
    socket.setdefaulttimeout(45)
    now = datetime.now(UTC)
    with urllib.request.urlopen(f'{BASE}/{COLLECTION}/', timeout=45) as response:
        html = response.read().decode('utf-8')
    cycles = find_cycles(html, now)
    if not cycles:
        raise RuntimeError('No GEOS-FP cycle within 36 hours; refusing stale data')
    errors = []
    for run, token in cycles[:4]:
        try:
            data = read_cycle(token, run, now)
            break
        except Exception as exc:
            errors.append(f'{token}: {exc}')
    else:
        raise RuntimeError('GEOS retrieval failed: ' + '; '.join(errors))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, allow_nan=False, separators=(',', ':')), encoding='utf-8')
    temporary.replace(output)
    print(f"Saved {len(data['frames'])} forecast frames from {data['runTime']}")

if __name__ == '__main__':
    main()
