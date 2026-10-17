"""Check image dimensions, packing and global frame integrity before publishing data."""
import json
from pathlib import Path
import sys
import numpy as np
from PIL import Image
path = Path(sys.argv[1] if len(sys.argv) > 1 else 'generated/global/latest.json')
manifest = json.loads(path.read_text(encoding='utf-8'))
for frame in manifest['frames']:
    info = frame['native']
    if info['encoding'] != 'log16-rgb-pair-v1' or info['width'] != 1152 or info['height'] != 721:
        raise ValueError('Invalid native format')
    images = []
    for key in ['massPath', 'opticsPath']:
        target = (path.parent / info[key]).resolve()
        if not target.is_relative_to(path.parent.resolve()):
            raise ValueError('Invalid image path')
        with Image.open(target) as image:
            if image.mode != 'RGB' or image.size != (1152, 721):
                raise ValueError('Invalid native image')
            images.append(np.asarray(image, dtype=np.uint16))
    a, b = images
    codes = {'dustSurface': a[:, :, 0] * 256 + a[:, :, 1],
             'dustFine': a[:, :, 2] * 256 + b[:, :, 0], 'dustAod': b[:, :, 1] * 256 + b[:, :, 2]}
    for key, packed in codes.items():
        scale = info['scales'][key]
        if not np.isfinite(scale) or not 0 < scale <= 1:
            raise ValueError('Invalid packing scale')
        values = np.expm1(packed.astype(np.float64) * scale)
        if not np.isfinite(values[packed != 65535]).all():
            raise ValueError('Nonfinite native values')
print(f"Verified {len(manifest['frames'])} native source-grid frames")
