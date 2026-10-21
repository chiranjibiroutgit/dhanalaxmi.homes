import pymupdf, os
base = r"D:\dhanalaxmi.group"
pdf = os.path.join(base, "Sea Princess 1 Brochure.pdf")
doc = pymupdf.open(pdf)
out = os.path.join(base, "public", "images", "brochures", "prop_102_seaprincess")
os.makedirs(out, exist_ok=True)
n = 0
for pno, page in enumerate(doc):
    for im in page.get_images(full=True):
        xref = im[0]
        try:
            pix = pymupdf.Pixmap(doc, xref)
            if pix.n - pix.alpha > 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            if pix.width < 300 or pix.height < 150:
                continue
            pix.save(os.path.join(out, f"p{pno+1:02d}_img{n}.jpg"))
            n += 1
        except Exception:
            pass
    pix = page.get_pixmap(dpi=72)
    pix.save(os.path.join(out, f"p{pno+1:02d}_page.jpg"))
doc.close()
print("sea princess extracted:", n)
for f in sorted(os.listdir(out)):
    print(f, os.path.getsize(os.path.join(out, f)))
