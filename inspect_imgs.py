from PIL import Image
import os
base = r"D:\dhanalaxmi.group\public\images\brochures"
for proj in sorted(os.listdir(base)):
    d = os.path.join(base, proj)
    print("====", proj)
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        try:
            im = Image.open(p)
            print(" ", f, im.size)
        except Exception as e:
            print(" ", f, "ERR", e)
