"""Global three-hourly upper-air contours through forecast hour 384."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from pathlib import Path
import argparse
import json
import re
import tempfile
import time
import urllib.parse
import urllib.request
import numpy as np
from ingest_synoptic import UTC, iso, GRID, LEVELS, UNITS, convert_field, write_field

def selected_ranges(index):
    rows = [line.split(':') for line in index.splitlines() if line.strip()]
    result = []
    for i, row in enumerate(rows):
        if len(row) < 6:
            raise ValueError('Malformed forecast index')
        name, level = row[3:5]
        if name in ('HGT','TMP') and level in {f'{v} mb' for v in LEVELS} or name == 'PRES' and level == 'surface':
            result.append((name, level, int(row[1]), int(rows[i+1][1])-1 if i+1 < len(rows) else None))
    if len(result) != 11 or len({(a,b) for a,b,_,_ in result}) != 11:
        raise ValueError('Forecast index is missing a required field')
    return result

def request(url, byte_range=None):
    headers = {'User-Agent':'SynopticAtlas/1.2 forecast-contours'}
    if byte_range:
        lo,hi=byte_range;headers['Range']=f'bytes={lo}-{hi if hi is not None else ""}'
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=60) as response:
                if byte_range and (response.status != 206 or not response.headers.get('Content-Range','').startswith(f'bytes {byte_range[0]}-')):
                    raise ValueError('Server ignored forecast byte range')
                body=response.read(20*1024*1024+1)
                if len(body)>20*1024*1024:raise ValueError('Forecast exceeds size limit')
                if byte_range and byte_range[1] is not None and len(body)!=byte_range[1]-byte_range[0]+1:
                    raise ValueError('Incomplete forecast byte range')
                return body
        except Exception:
            if attempt == 2:raise
            time.sleep(attempt+1)

def download(run,hour,backend):
    filename=f'gfs.t{run:%H}z.pgrb2.1p00.f{hour:03d}'
    if backend=='s3':
        url=f'https://noaa-gfs-bdp.s3.amazonaws.com/gfs.{run:%Y%m%d}/{run:%H}/atmos/{filename}'
        return b''.join(request(url,(lo,hi)) for _,_,lo,hi in selected_ranges(request(url+'.idx').decode()))
    params={'file':filename,'dir':f'/gfs.{run:%Y%m%d}/{run:%H}/atmos','var_HGT':'on','var_TMP':'on','var_PRES':'on','lev_surface':'on'}
    params.update({f'lev_{v}_mb':'on' for v in LEVELS})
    return request('https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?'+urllib.parse.urlencode(params))

def sample_grid(values):
    if values.shape!=(181,360):raise ValueError('Unexpected source grid dimensions')
    values=np.roll(values[::-1],180,axis=1)
    yf=np.arange(145)*1.25;xf=np.arange(288)*1.25
    ya=np.floor(yf).astype(int);yb=np.minimum(ya+1,180)
    xa=np.floor(xf).astype(int);xb=(xa+1)%360
    wy=(yf-ya)[:,None];wx=(xf-xa)[None,:]
    corners=[values[ya[:,None],xa],values[ya[:,None],xb],values[yb[:,None],xa],values[yb[:,None],xb]]
    valid=np.logical_and.reduce([np.isfinite(v) for v in corners])
    result=(corners[0]*(1-wx)+corners[1]*wx)*(1-wy)+(corners[2]*(1-wx)+corners[3]*wx)*wy
    return np.where(valid,result,np.nan)

def decode(body,run,hour):
    from eccodes import codes_grib_new_from_file,codes_get,codes_get_values,codes_release
    products={}
    with tempfile.TemporaryFile() as stream:
        stream.write(body);stream.seek(0)
        while True:
            handle=codes_grib_new_from_file(stream)
            if handle is None:break
            try:
                kind=codes_get(handle,'typeOfLevel');name=codes_get(handle,'shortName');level=int(codes_get(handle,'level'))
                key=('gh',level) if kind=='isobaricInhPa' and name=='gh' and level in LEVELS else ('temp',level) if kind=='isobaricInhPa' and name=='t' and level in LEVELS else ('ps',0) if kind=='surface' and name in ('sp','pres') else None
                if key is None:continue
                if key in products:raise ValueError('Duplicate forecast field')
                if int(codes_get(handle,'dataDate'))!=int(run.strftime('%Y%m%d')) or int(codes_get(handle,'dataTime'))!=run.hour*100 or int(codes_get(handle,'endStep'))!=hour or int(codes_get(handle,'stepUnits'))!=1 or codes_get(handle,'stepType')!='instant':
                    raise ValueError('Forecast field time does not match cycle')
                if codes_get(handle,'units') not in {'gh':('gpm','m'),'temp':('K',),'ps':('Pa',)}[key[0]]:raise ValueError('Unexpected forecast units')
                if (int(codes_get(handle,'Ni')),int(codes_get(handle,'Nj')))!=(360,181) or float(codes_get(handle,'latitudeOfFirstGridPointInDegrees'))!=90 or float(codes_get(handle,'latitudeOfLastGridPointInDegrees'))!=-90 or float(codes_get(handle,'longitudeOfFirstGridPointInDegrees'))!=0 or float(codes_get(handle,'longitudeOfLastGridPointInDegrees'))!=359 or int(codes_get(handle,'jScansPositively'))!=0 or int(codes_get(handle,'jPointsAreConsecutive'))!=0:
                    raise ValueError('Unexpected source grid coordinates')
                values=np.asarray(codes_get_values(handle)).reshape(181,360)
                valid=np.isfinite(values)&(np.abs(values)<1e14)
                if int(codes_get(handle,'bitmapPresent')):valid &= values!=float(codes_get(handle,'missingValue'))
                values=np.where(valid,values,np.nan)
                products[key]=sample_grid(values)
            finally:codes_release(handle)
    expected={(field,lev) for field in UNITS for lev in LEVELS}|{('ps',0)}
    if set(products)!=expected:raise ValueError('Missing required forecast fields: '+str(expected-set(products)))
    result={}
    for field in UNITS:
        for level in LEVELS:
            values=convert_field(products[field,level],field,products['ps',0],level)
            if np.isfinite(values).sum()<values.size*.25:raise ValueError('Incomplete upper-air forecast')
            result[field,level]=values
    return result

def snapshot(root,run,hour,backend,body=None):
    fields=decode(body if body is not None else download(run,hour,backend),run,hour)
    valid=run+timedelta(hours=hour)
    for (field,level),values in fields.items():write_field(root,run.strftime('%Y%m%d_%H'),valid,field,level,values,run)
    print(f'Validated forecast hour {hour:03d}',flush=True)
    return {'validTime':iso(valid)}

def retrieve(run,now,root):
    previous=json.loads((root/'latest.json').read_text()) if (root/'latest.json').exists() else None
    if run+timedelta(hours=384)<now+timedelta(hours=360):raise ValueError('Cycle does not cover 360-hour timeline')
    backend='s3'
    try:tail=download(run,384,backend)
    except Exception:backend='nomads';tail=download(run,384,backend)
    frames=[snapshot(root,run,384,backend,tail)]
    first=max(0,int((now-run).total_seconds()//10800)*3)
    with ThreadPoolExecutor(max_workers=3 if backend=='s3' else 1) as pool:
        jobs=[pool.submit(snapshot,root,run,h,backend) for h in range(first,384,3)]
        for job in as_completed(jobs):frames.append(job.result())
    frames.sort(key=lambda f:f['validTime'])
    product={'schemaVersion':1,'source':'NOAA GFS','collection':'gfs_1p00','runTime':iso(run),'retrievedAt':iso(now),'grid':GRID,'levels':LEVELS,'units':UNITS,'forecastHours':384,'frames':frames}
    root.mkdir(parents=True,exist_ok=True)
    (root/'latest.json').write_text(json.dumps(product,separators=(',',':')),encoding='utf-8')
    keep={run.strftime('%Y%m%d_%H')}
    if previous:keep.add(datetime.fromisoformat(previous['runTime'].replace('Z','+00:00')).strftime('%Y%m%d_%H'))
    runs=(root/'runs').resolve()
    for old in runs.iterdir():
        if old.is_symlink() or not old.is_dir() or old.name in keep or not re.fullmatch(r'\d{8}_\d{2}',old.name):continue
        for item in old.glob('*/*.json.gz'):
            if not item.is_symlink() and item.resolve().is_relative_to(runs):item.unlink()
        for stamp in old.iterdir():
            if stamp.is_dir() and not stamp.is_symlink() and not any(stamp.iterdir()):stamp.rmdir()
        if not any(old.iterdir()):old.rmdir()
    print(f'Published {len(frames)} snapshots; last valid {frames[-1]["validTime"]}',flush=True)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='generated/contours');args=parser.parse_args()
    now=datetime.now(UTC);newest=now.replace(hour=now.hour//6*6,minute=0,second=0,microsecond=0)-timedelta(hours=6)
    root=Path(args.output)
    previous=json.loads((root/'latest.json').read_text()) if (root/'latest.json').exists() else None
    for offset in (0,6,12):
        run=newest-timedelta(hours=offset)
        if previous and previous['runTime']>iso(run):continue
        try:retrieve(run,now,root);return
        except Exception as exc:print(f'Cycle {run} failed: {exc}',flush=True)
    raise RuntimeError('Forecast retrieval failed for all complete cycles')

if __name__=='__main__':main()
