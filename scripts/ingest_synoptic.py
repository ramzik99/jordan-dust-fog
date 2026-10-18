"""Shared contour field encoding and validation."""
from datetime import datetime, timedelta, timezone
import gzip
import json
from pathlib import Path
import numpy as np
UTC = timezone.utc

def iso(value):
    return value.astimezone(UTC).isoformat(timespec='seconds').replace('+00:00', 'Z')

LEVELS = [925, 850, 700, 500, 300]
UNITS = {'gh': 'dam', 'temp': 'degC'}
GRID = {'width': 288, 'height': 145, 'longitudeStart': -180, 'latitudeStart': -90, 'step': 1.25}

def convert_field(values, field, surface_pressure=None, level=None):
    raw = np.asarray(values, dtype=float)
    bounds = {'gh': (-1000, 60000), 'temp': (100, 400)}
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

