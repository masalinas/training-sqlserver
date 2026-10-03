#!/usr/bin/env python3
"""Monta miniaturas 2x2 de las diapositivas renderizadas. Uso: python montage.py imgdir [desde hasta]"""
import sys, pathlib
from PIL import Image

d = pathlib.Path(sys.argv[1])
files = sorted(d.glob('slide-*.jpg'))
lo = int(sys.argv[2]) if len(sys.argv) > 2 else 1
hi = int(sys.argv[3]) if len(sys.argv) > 3 else 10**6
files = [f for f in files if lo <= int(f.stem.split('-')[1]) <= hi]
for k in range(0, len(files), 4):
    group = files[k:k + 4]
    ims = [Image.open(f) for f in group]
    w, h = ims[0].size
    sheet = Image.new('RGB', (w * 2 + 10, h * 2 + 10), 'white')
    for i, im in enumerate(ims):
        sheet.paste(im, ((i % 2) * (w + 10), (i // 2) * (h + 10)))
    out = d / f'sheet-{k // 4 + 1:02d}.jpg'
    sheet.save(out, quality=85)
    print(out, [f.stem for f in group])
