from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os

W, H = 1200, 400

# ── Logo (transparent PNG) ──────────────────────────────────────
logo = Image.new("RGBA", (600, 180), (0, 0, 0, 0))
d = ImageDraw.Draw(logo)

# Outer ring
for r, a in [(88, 255), (86, 180), (84, 80)]:
    d.ellipse([300-r, 90-r, 300+r, 90+r], outline=(201, 168, 76, a), width=3)

# OM symbol
try:
    f_om = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
except:
    f_om = ImageFont.load_default()
d.text((300, 90), "ॐ", font=f_om, fill=(212, 136, 27, 255), anchor="mm")

# Brand text
try:
    f_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 32)
    f_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
except:
    f_big = f_small = ImageFont.load_default()

d.text((300, 148), "BHAGWATI ENTERPRISES", font=f_big, fill=(74, 15, 28, 255), anchor="mm")
d.text((300, 172), "SACRED · SPIRITUAL · AUTHENTIC", font=f_small, fill=(140, 45, 63, 200), anchor="mm")

logo.save("/home/claude/bhagwati-zip/images/logo.png")
print("logo.png ✓")

# ── Logo white variant (for dark backgrounds) ───────────────────
logo_w = Image.new("RGBA", (600, 180), (0, 0, 0, 0))
dw = ImageDraw.Draw(logo_w)
for r, a in [(88, 200), (86, 130), (84, 60)]:
    dw.ellipse([300-r, 90-r, 300+r, 90+r], outline=(240, 208, 128, a), width=3)
dw.text((300, 90), "ॐ", font=f_om, fill=(240, 200, 80, 255), anchor="mm")
dw.text((300, 148), "BHAGWATI ENTERPRISES", font=f_big, fill=(253, 246, 236, 255), anchor="mm")
dw.text((300, 172), "SACRED · SPIRITUAL · AUTHENTIC", font=f_small, fill=(201, 168, 76, 220), anchor="mm")
logo_w.save("/home/claude/bhagwati-zip/images/logo-white.png")
print("logo-white.png ✓")

# ── Favicon (32x32) ─────────────────────────────────────────────
fav = Image.new("RGBA", (64, 64), (74, 15, 28, 255))
df = ImageDraw.Draw(fav)
try:
    ff = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
except:
    ff = ImageFont.load_default()
df.text((32, 32), "ॐ", font=ff, fill=(212, 136, 27, 255), anchor="mm")
fav = fav.resize((32, 32), Image.LANCZOS)
fav.save("/home/claude/bhagwati-zip/images/favicon.png")
print("favicon.png ✓")

# ── Hero gradient background ─────────────────────────────────────
hero = Image.new("RGB", (1400, 800))
ph = ImageDraw.Draw(hero)
for y in range(800):
    r = int(74  + (42-74)  * y/800)
    g = int(15  + (10-15)  * y/800)
    b = int(28  + (15-28)  * y/800)
    ph.line([(0,y),(1400,y)], fill=(r,g,b))
# Gold radial glow
for radius in range(300, 0, -1):
    alpha = int(30 * (1 - radius/300))
    ph.ellipse([700-radius, 350-radius, 700+radius, 350+radius],
               fill=None, outline=(212, 136, 27))
# Lotus petal pattern (decorative)
cx, cy = 700, 350
for i in range(8):
    angle = math.radians(i * 45)
    x1 = cx + int(200 * math.cos(angle))
    y1 = cy + int(200 * math.sin(angle))
    ph.ellipse([x1-30, y1-30, x1+30, y1+30], outline=(201, 168, 76, ), width=1)
hero.save("/home/claude/bhagwati-zip/images/hero-bg.jpg", quality=88)
print("hero-bg.jpg ✓")

# ── About section image (warm saffron tone) ──────────────────────
about = Image.new("RGB", (800, 1000))
da = ImageDraw.Draw(about)
for y in range(1000):
    r = int(180 + (220-180) * y/1000)
    g = int(120 + (160-120) * y/1000)
    b = int(60  + (100-60)  * y/1000)
    da.line([(0,y),(800,y)], fill=(r,g,b))
# Decorative mandala lines
for ring in range(5):
    rr = 80 + ring*60
    da.ellipse([400-rr, 500-rr, 400+rr, 500+rr], outline=(255,220,100), width=1)
try:
    fa = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
except:
    fa = ImageFont.load_default()
da.text((400, 500), "ॐ", font=fa, fill=(255,220,100), anchor="mm")
about.save("/home/claude/bhagwati-zip/images/about-main.jpg", quality=85)
print("about-main.jpg ✓")

# ── About accent image ───────────────────────────────────────────
acc = Image.new("RGB", (400, 400))
dac = ImageDraw.Draw(acc)
for y in range(400):
    r = int(107 + (74-107)*y/400)
    g = int(26  + (15-26) *y/400)
    b = int(42  + (28-42) *y/400)
    dac.line([(0,y),(400,y)], fill=(r,g,b))
for ring in range(4):
    rr = 40 + ring*30
    dac.ellipse([200-rr,200-rr,200+rr,200+rr], outline=(212,136,27), width=1)
try:
    fac = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
except:
    fac = ImageFont.load_default()
dac.text((200,200), "🙏", font=fac, fill=(240,200,80), anchor="mm")
acc.save("/home/claude/bhagwati-zip/images/about-accent.jpg", quality=85)
print("about-accent.jpg ✓")

# ── Placeholder product image ────────────────────────────────────
def make_product_placeholder(filename, label, color1, color2):
    img = Image.new("RGB", (500, 500))
    d2 = ImageDraw.Draw(img)
    for y in range(500):
        r = int(color1[0] + (color2[0]-color1[0])*y/500)
        g = int(color1[1] + (color2[1]-color1[1])*y/500)
        b = int(color1[2] + (color2[2]-color1[2])*y/500)
        d2.line([(0,y),(500,y)], fill=(r,g,b))
    for ring in [80,60,40]:
        d2.ellipse([250-ring,250-ring,250+ring,250+ring], outline=(255,220,120), width=1)
    try:
        fl = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
        ft = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        fl = ft = ImageFont.load_default()
    d2.text((250,220), "ॐ", font=fl, fill=(255,220,100), anchor="mm")
    d2.text((250,300), label, font=ft, fill=(255,240,200), anchor="mm")
    img.save(f"/home/claude/bhagwati-zip/images/{filename}", quality=85)
    print(f"{filename} ✓")

make_product_placeholder("product-placeholder.jpg", "Bhagwati Enterprises", (107,26,42),(74,15,28))
make_product_placeholder("product-idol.jpg",     "Idols & Murtis",     (100,60,20),(60,30,10))
make_product_placeholder("product-pooja.jpg",    "Pooja Essentials",   (120,40,40),(80,20,20))
make_product_placeholder("product-incense.jpg",  "Incense & Dhoop",    (40,80,60),(20,50,40))
make_product_placeholder("product-thali.jpg",    "Puja Thali",         (80,60,20),(50,35,10))
make_product_placeholder("product-books.jpg",    "Sacred Books",       (30,50,90),(15,25,60))
make_product_placeholder("product-decor.jpg",    "Spiritual Decor",    (70,30,70),(40,15,50))

print("\nAll images generated ✓")
