import os
from fontTools.merge import Merger
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FDIR = os.path.join(HERE, '_fonts')
os.makedirs(FDIR, exist_ok=True)

SRC = os.path.join(HERE, '..', 'src', 'fonts')

VAR_TABLES = ['HVAR', 'VVAR', 'MVAR', 'STAT', 'fvar', 'gvar', 'avar', 'GDEF']

def merge_font(family, weight, out):
    parts = [f'{family}-{weight}-{r}.woff2' for r in ('latin', 'latin-ext', 'cyrillic', 'cyrillic-ext')]
    tmp = []
    for i, p in enumerate(parts):
        src = os.path.join(SRC, p)
        if not os.path.exists(src):
            continue
        f = TTFont(src)
        for t in VAR_TABLES:
            if t in f:
                del f[t]
        t = out + f'.part{i}.ttf'
        f.flavor = None
        f.save(t)
        tmp.append(t)
    f = Merger().merge(tmp)
    f.flavor = None
    f.save(out)
    for t in tmp:
        os.remove(t)

FONTS = {
    ('serif', 400): os.path.join(FDIR, 'spectral-400.ttf'),
    ('serif', 600): os.path.join(FDIR, 'spectral-600.ttf'),
    ('mono', 400): os.path.join(FDIR, 'jbm-400.ttf'),
    ('mono', 600): os.path.join(FDIR, 'jbm-500.ttf'),
}
merge_font('Spectral', '400', FONTS[('serif', 400)])
merge_font('Spectral', '600', FONTS[('serif', 600)])
merge_font('JetBrainsMono', '400', FONTS[('mono', 400)])
merge_font('JetBrainsMono', '500', FONTS[('mono', 600)])

def serif(sz, bold=False):
    return ImageFont.truetype(FONTS[('serif', 600 if bold else 400)], sz)
def mono(sz, bold=False):
    return ImageFont.truetype(FONTS[('mono', 600 if bold else 400)], sz)

BG = '#16130d'
INK = '#F5F0E4'
DIM = '#c8c1b0'
FAINT = '#8f856f'
GOLD = '#F2B23E'
DANGER = '#E05442'
DANGERBR = '#F47C6A'
ALARMBG = '#1a0d0a'
LINE = (245, 240, 228, 30)
LINESTRONG = (245, 240, 228, 55)
TIER = {'COGO': DANGER, 'INSTO': GOLD, 'MONEO': FAINT}

def track(draw, x, y, text, font, fill, tracking=0, anchor='l'):
    widths = [font.getlength(c) for c in text]
    total = sum(widths) + tracking * (len(text) - 1)
    if anchor == 'm':
        x -= total / 2
    elif anchor == 'r':
        x -= total
    for c, w in zip(text, widths):
        draw.text((x, y), c, font=font, fill=fill, anchor='lm')
        x += w + tracking

def rot_band(img, cx, cy, w, h, color, angle):
    pad = 6
    layer = Image.new('RGBA', (int(w) + pad * 2, int(h) + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rectangle([pad, pad, pad + w, pad + h], fill=color)
    layer = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))

def fasces(img, cx, top, height, rod_w, gap, n=4, color=GOLD, band=DANGER, angle=-18, band_factor=1.5):
    d = ImageDraw.Draw(img)
    total = n * rod_w + (n - 1) * gap
    x0 = cx - total / 2
    for i in range(n):
        x = x0 + i * (rod_w + gap)
        d.rectangle([x, top, x + rod_w, top + height], fill=color)
    rot_band(img, cx, top + height * 0.5, total * band_factor, rod_w, band, angle)

def glow_node(img, cx, cy, r, color, blur=None):
    blur = blur or r * 1.4
    pad = int(r + blur) * 2
    g = Image.new('RGBA', (pad, pad), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    c = pad / 2
    gd.ellipse([c - r, c - r, c + r, c + r], fill=color)
    g = g.filter(ImageFilter.GaussianBlur(blur))
    img.alpha_composite(g, (int(cx - c), int(cy - c)))
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)

OUT = HERE

# ---------- ICON ----------
def build_icon():
    S = 1024
    img = Image.new('RGBA', (S, S), BG)
    k = S / 512
    border = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(border)
    bd.rectangle([40 * k, 40 * k, S - 40 * k, S - 40 * k], outline=(242, 178, 62, 50), width=int(3 * k))
    img.alpha_composite(border)
    fasces(img, S / 2, 120 * k, 280 * k, 30 * k, 20 * k, band_factor=1.5)
    img.convert('RGB').resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'icon-512.png'))
    img.convert('RGB').save(os.path.join(OUT, 'icon-1024.png'))

# ---------- COVER ----------
def build_cover():
    W, H = 1200, 630
    img = Image.new('RGBA', (W, H), BG)
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(245, 240, 228, 9), width=1)
    fasces(img, 210, 160, 310, 22, 16, band_factor=2.0)
    d.line([(410, 150), (410, 480)], fill=LINESTRONG, width=1)
    track(d, 455, 290, 'LICTOR', serif(150, True), INK, tracking=4, anchor='l')
    track(d, 458, 392, 'sine mora', mono(30), GOLD, tracking=10, anchor='l')
    track(d, 458, 452, 'дедлайны, которые не отпускают', mono(24), DIM, tracking=1, anchor='l')
    img.convert('RGB').save(os.path.join(OUT, 'cover-1200x630.png'))

def header(img, page):
    d = ImageDraw.Draw(img)
    track(d, 90, 110, 'LICTOR', mono(26, True), GOLD, tracking=5, anchor='l')
    track(d, 990, 110, 'sine mora', mono(22), DIM, tracking=6, anchor='r')
    d.line([(90, 152), (990, 152)], fill=LINE, width=1)
    track(d, 90, 1852, page, mono(22), FAINT, tracking=4, anchor='l')
    track(d, 990, 1852, 'v1.0.2', mono(22), FAINT, tracking=2, anchor='r')

# ---------- SHOT 1 : TASKS ----------
def build_shot1():
    W, H = 1080, 1920
    img = Image.new('RGBA', (W, H), BG)
    header(img, '01 — ЗАДАЧИ')
    d = ImageDraw.Draw(img)
    d.text((90, 300), 'Список, который', font=serif(82, True), fill=INK, anchor='lm')
    d.text((90, 392), 'не отпускает.', font=serif(82, True), fill=GOLD, anchor='lm')
    track(d, 90, 480, 'три тира давления. ни одной забытой задачи.', mono(25), DIM, tracking=1, anchor='l')
    rows = [
        ('COGO', 'Позвонить инвестору', 'Когда мягко — уже поздно.', 'просрочено 2:14', DANGER),
        ('INSTO', 'Сдать главу ВКР', 'Срок не спросит, готов ли ты.', 'сегодня 18:00', DIM),
        ('MONEO', 'Разобрать почту', 'Малое тоже копится.', 'завтра', DIM),
        ('INSTO', 'Тренировка — ноги', 'Тело помнит дисциплину.', '19:30', DIM),
    ]
    y = 610
    rh = 250
    for tier, title, quote, time, tcol in rows:
        d.line([(90, y), (990, y)], fill=LINE, width=1)
        cy = y + rh / 2
        d.rectangle([92, cy - 46, 110, cy - 28], fill=TIER[tier])
        track(d, 92, cy + 6, tier, mono(17, True), TIER[tier], tracking=2, anchor='l')
        d.text((150, cy - 28), title, font=serif(46), fill=INK, anchor='lm')
        track(d, 150, cy + 34, quote, mono(24), DIM, tracking=0, anchor='l')
        track(d, 990, cy - 28, time, mono(30), tcol, tracking=1, anchor='r')
        y += rh
    d.line([(90, y), (990, y)], fill=LINE, width=1)
    img.convert('RGB').save(os.path.join(OUT, 'shot-01-tasks.png'))

# ---------- SHOT 2 : ALARM ----------
def build_shot2():
    W, H = 1080, 1920
    img = Image.new('RGBA', (W, H), ALARMBG)
    d = ImageDraw.Draw(img)
    track(d, 540, 470, 'COGO · СРОК ПРОШЁЛ', mono(30, True), DANGERBR, tracking=10, anchor='m')
    d.line([(360, 530), (720, 530)], fill=DANGER, width=2)
    d.text((540, 760), 'Позвонить', font=serif(118, True), fill=INK, anchor='mm')
    d.text((540, 900), 'инвестору', font=serif(118, True), fill=INK, anchor='mm')
    track(d, 540, 1070, '− 2:14:08', mono(92, True), DANGER, tracking=4, anchor='m')
    d.text((540, 1230), 'Когда мягко — уже поздно.', font=serif(44), fill=DIM, anchor='mm')
    bw, bh = 560, 104
    bx, by = 540 - bw / 2, 1560
    bl = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(bl).rectangle([bx, by, bx + bw, by + bh], outline=(224, 84, 66, 160), width=2)
    img.alpha_composite(bl)
    track(d, 540, by + bh / 2, 'отложить — удерживать', mono(30), DIM, tracking=2, anchor='m')
    track(d, 90, 1852, '02 — COGO', mono(22), '#7a6f5e', tracking=4, anchor='l')
    track(d, 990, 1852, 'v1.0.2', mono(22), '#7a6f5e', tracking=2, anchor='r')
    img.convert('RGB').save(os.path.join(OUT, 'shot-02-alarm.png'))

# ---------- SHOT 3 : BRAIN / GRAPH ----------
def build_shot3():
    W, H = 1080, 1920
    img = Image.new('RGBA', (W, H), BG)
    header(img, '03 — МОЗГ')
    d = ImageDraw.Draw(img)
    d.text((90, 300), 'Видишь связи.', font=serif(82, True), fill=INK, anchor='lm')
    d.text((90, 392), 'Видишь систему.', font=serif(82, True), fill=GOLD, anchor='lm')
    track(d, 90, 480, 'мозг учит окна отклика и куда поставить задачу.', mono(25), DIM, tracking=1, anchor='l')
    stats = [('12', 'дней подряд'), ('47', 'за неделю'), ('5', 'активно')]
    sx = 90
    for num, lab in stats:
        d.text((sx, 600), num, font=serif(70, True), fill=GOLD, anchor='lm')
        track(d, sx, 660, lab, mono(23), DIM, tracking=1, anchor='l')
        sx += 300

    groups = {'g1': (340, 1100, 26, 'Деньги'), 'g2': (760, 1200, 30, 'ВКР'), 'g3': (470, 1500, 24, 'Спорт')}
    tasks = [
        ('g1', 240, 1010, DANGER), ('g1', 300, 1210, GOLD), ('g1', 430, 1000, FAINT),
        ('g2', 910, 1110, GOLD), ('g2', 920, 1300, DANGER), ('g2', 820, 1360, FAINT), ('g2', 690, 1060, GOLD),
        ('g3', 360, 1590, GOLD), ('g3', 580, 1620, FAINT), ('g3', 420, 1390, DANGER),
    ]
    ll = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(ll)
    for gid, x, y, col in tasks:
        gx, gy, gr, _ = groups[gid]
        ld.line([(gx, gy), (x, y)], fill=LINESTRONG, width=2)
    ld.line([groups['g1'][:2], groups['g2'][:2]], fill=LINE, width=2)
    ld.line([groups['g1'][:2], groups['g3'][:2]], fill=LINE, width=2)
    ld.line([groups['g2'][:2], groups['g3'][:2]], fill=LINE, width=2)
    img.alpha_composite(ll)

    for gid, x, y, col in tasks:
        glow_node(img, x, y, 13, col, blur=16)
    for gid, (x, y, r, name) in groups.items():
        glow_node(img, x, y, r, GOLD, blur=26)
        track(ImageDraw.Draw(img), x, y + r + 26, name, mono(24), INK, tracking=1, anchor='m')

    img.convert('RGB').save(os.path.join(OUT, 'shot-03-brain.png'))

build_icon()
build_cover()
build_shot1()
build_shot2()
build_shot3()
print('done:', [f for f in os.listdir(OUT) if f.endswith('.png')])
