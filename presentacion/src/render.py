#!/usr/bin/env python3
"""Renderiza un .pptx a JPG por diapositiva (LibreOffice → PDF → PyMuPDF).
Uso: python render.py deck.pptx outdir [dpi] [desde] [hasta]   (diapositivas 1-indexadas)"""
import subprocess, sys, pathlib, shutil
import pymupdf

deck = pathlib.Path(sys.argv[1]).resolve()
out = pathlib.Path(sys.argv[2]).resolve()
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 80
lo = int(sys.argv[4]) if len(sys.argv) > 4 else 1
hi = int(sys.argv[5]) if len(sys.argv) > 5 else 10**6
out.mkdir(parents=True, exist_ok=True)
for f in out.glob('*'):
    f.unlink()
soffice = pathlib.Path(__file__).resolve().parents[2] / '.agent/skills/pptx/scripts/office/soffice.py'
subprocess.run([sys.executable, str(soffice), '--headless', '--convert-to', 'pdf', '--outdir', str(out), str(deck)], check=True, stdout=subprocess.DEVNULL)
pdf = out / (deck.stem + '.pdf')
doc = pymupdf.open(pdf)
for i, page in enumerate(doc, 1):
    if lo <= i <= hi:
        page.get_pixmap(dpi=dpi).save(out / f'slide-{i:02d}.jpg')
print(f'{len(doc)} páginas → {out}')
