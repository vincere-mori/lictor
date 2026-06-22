import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, '..', 'android', 'app', 'src', 'main', 'res')

BG = '#16130d'
GOLD = '#F2B23E'
DANGER = '#E05442'
BORDER = (242, 178, 62, 50)

# плотности: каталог -> (legacy/round, adaptive foreground)
DPI = {
    'mdpi': (48, 108),
    'hdpi': (72, 162),
    'xhdpi': (96, 216),
    'xxhdpi': (144, 324),
    'xxxhdpi': (192, 432),
}


def rot_band(img, cx, cy, w, h, color, angle):
    pad = 6
    layer = Image.new('RGBA', (int(w) + pad * 2, int(h) + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(layer).rectangle([pad, pad, pad + w, pad + h], fill=color)
    layer = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))


def fasces(img, cx, top, height, rod_w, gap, n=4, band_factor=1.5):
    d = ImageDraw.Draw(img)
    total = n * rod_w + (n - 1) * gap
    x0 = cx - total / 2
    for i in range(n):
        x = x0 + i * (rod_w + gap)
        d.rectangle([x, top, x + rod_w, top + height], fill=GOLD)
    rot_band(img, cx, top + height * 0.5, total * band_factor, rod_w, DANGER, -18)


def master_square(border=True):
    # композит как в сторовой иконке, 1024
    S = 1024
    img = Image.new('RGBA', (S, S), BG)
    k = S / 512
    if border:
        bl = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(bl).rectangle([40 * k, 40 * k, S - 40 * k, S - 40 * k], outline=BORDER, width=int(3 * k))
        img.alpha_composite(bl)
    fasces(img, S / 2, 120 * k, 280 * k, 30 * k, 20 * k)
    return img


def master_foreground():
    # только фасции по центру, в safe zone адаптивной иконки, прозрачный фон
    S = 1728
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    rod_w = S * 0.045
    gap = S * 0.03
    height = S * 0.46
    fasces(img, S / 2, (S - height) / 2, height, rod_w, gap)
    return img


def circle_mask(img):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, img.size[0], img.size[1]], fill=255)
    out = img.copy()
    out.putalpha(m)
    return out


def save(img, size, path):
    img.convert('RGBA').resize((size, size), Image.LANCZOS).save(path)


sq = master_square()
rnd = circle_mask(master_square(border=False).convert('RGBA'))
fg = master_foreground()

for d, (legacy, fore) in DPI.items():
    base = os.path.join(RES, f'mipmap-{d}')
    save(sq, legacy, os.path.join(base, 'ic_launcher.png'))
    save(rnd, legacy, os.path.join(base, 'ic_launcher_round.png'))
    save(fg, fore, os.path.join(base, 'ic_launcher_foreground.png'))

# splash: тёмный фон + фасции по центру
sp = Image.new('RGBA', (1080, 1920), BG)
fasces(sp, 540, 860, 200, 22, 16)
sp.convert('RGB').save(os.path.join(RES, 'drawable', 'splash.png'))

print('done')
