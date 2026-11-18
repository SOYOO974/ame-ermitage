"""Génère la planche A4 « 4 mots à coller dans le cahier de texte » avec QR code.

Usage : python scripts/build-flyer.py
Sorties : print/flyer-cahier.html et print/flyer-cahier.pdf (Chrome headless).
"""

import subprocess
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H

URL = "https://gardiensdulagon.re"
URL_LABEL = "gardiensdulagon.re"

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "print"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

NAVY = "#06324a"
TEAL = "#0e7a99"
CORAL = "#dc4f33"
GOLD = "#fbd679"


def qr_svg() -> str:
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, border=0)
    qr.add_data(URL)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)
    quiet = 2
    size = n + quiet * 2

    # Zone centrale réservée au logo (~19 % de la largeur : bien sous la marge du niveau H).
    c = n / 2
    logo_r = n * 0.155

    def in_finder(x: int, y: int) -> bool:
        return (x < 7 and y < 7) or (x >= n - 7 and y < 7) or (x < 7 and y >= n - 7)

    def in_logo(x: int, y: int) -> bool:
        return (x + 0.5 - c) ** 2 + (y + 0.5 - c) ** 2 < (logo_r + 0.9) ** 2

    dots = []
    for y in range(n):
        for x in range(n):
            if m[y][x] and not in_finder(x, y) and not in_logo(x, y):
                dots.append(f'<circle cx="{x + quiet + 0.5}" cy="{y + quiet + 0.5}" r="0.46"/>')

    eyes = []
    for ex, ey in ((0, 0), (n - 7, 0), (0, n - 7)):
        X, Y = ex + quiet, ey + quiet
        eyes.append(
            f'<rect x="{X + 0.5}" y="{Y + 0.5}" width="6" height="6" rx="1.9" fill="none" stroke="{NAVY}" stroke-width="1"/>'
            f'<rect x="{X + 2}" y="{Y + 2}" width="3" height="3" rx="0.9" fill="{CORAL}"/>'
        )

    cx = cy = quiet + c
    s = logo_r * 2 * 0.78 / 48  # emblème 48×48 mis à l'échelle dans le disque
    emblem = (
        f'<g transform="translate({cx - 24 * s} {cy - 24 * s}) scale({s})" fill="none" stroke="{GOLD}" '
        f'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
        '<path d="M15 24a9 9 0 0 1 18 0"/>'
        '<path d="M24 9v3M13.4 13.4l2.1 2.1M34.6 13.4l-2.1 2.1"/>'
        '<path d="M8 28c2.7-2.4 5.3-2.4 8 0s5.3 2.4 8 0 5.3-2.4 8 0 5.3 2.4 8 0"/>'
        '<path d="M11 34c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 4.3-2 6.5 0 4.3 2 6.5 0"/>'
        "</g>"
    )

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" class="qr">'
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{TEAL}"/><stop offset="1" stop-color="{NAVY}"/></linearGradient></defs>'
        f'<rect width="{size}" height="{size}" fill="#fff"/>'
        f'<g fill="url(#g)">{"".join(dots)}</g>'
        f'{"".join(eyes)}'
        f'<circle cx="{cx}" cy="{cy}" r="{logo_r}" fill="{NAVY}"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{logo_r - 0.45}" fill="none" stroke="{GOLD}" stroke-width="0.25"/>'
        f"{emblem}</svg>"
    )


def card(qr: str) -> str:
    return f"""
<section class="card">
  <header>
    <p class="kicker">Aire Marine Éducative de l'Ermitage</p>
    <h1>Les Gardiens du Lagon</h1>
  </header>
  <p class="lead">À toi de jouer à la maison&nbsp;!</p>
  <p>En classe, nous avons découvert le jeu créé avec les élèves de CM2&nbsp;: un quiz sur les poissons, les coraux et les plantes du lagon, et 12&nbsp;cartes dessinées par la classe à collectionner.</p>
  <div class="qr-wrap">{qr}</div>
  <p class="url">{URL_LABEL}</p>
  <p class="small">Gratuit, sans publicité ni inscription. Aucune donnée personnelle collectée. La partie est enregistrée sur le téléphone, la tablette ou l'ordinateur utilisé.</p>
  <p class="sign">La classe de CM2 de Mme Pavion</p>
</section>"""


SCISSORS = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="#7a8f99" stroke-width="1.5" stroke-linecap="round">'
    '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg>'
)


def html(qr: str) -> str:
    cards = "".join(card(qr) for _ in range(4))
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Gardiens du Lagon : mot pour le cahier</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; margin: 0; }}
html, body {{ width: 210mm; height: 297mm; }}
body {{ font-family: 'Plus Jakarta Sans', sans-serif; color: {NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }}
.sheet {{ position: relative; width: 210mm; height: 297mm; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }}
.cut-v {{ position: absolute; left: 105mm; top: 0; bottom: 0; border-left: 0.3mm dashed #b7c4ca; }}
.cut-h {{ position: absolute; top: 148.5mm; left: 0; right: 0; border-top: 0.3mm dashed #b7c4ca; }}
.scissors {{ position: absolute; width: 4.5mm; height: 4.5mm; background: #fff; }}
.card {{ padding: 8mm 8.5mm 7mm; display: flex; flex-direction: column; align-items: center; text-align: center; }}
header {{ width: 100%; background: linear-gradient(160deg, #0a5d7a, {NAVY} 75%); border-radius: 4mm; padding: 3.4mm 3mm 3.2mm; box-shadow: inset 0 -0.8mm 0 {GOLD}; }}
.kicker {{ font-size: 2.35mm; letter-spacing: 0.14em; text-transform: uppercase; color: #8fe6e0; font-weight: 600; }}
h1 {{ font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 6.4mm; line-height: 1.05; color: {GOLD}; margin-top: 1mm; }}
.lead {{ font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 4.6mm; color: {CORAL}; margin-top: 3.6mm; }}
p {{ font-size: 3.05mm; line-height: 1.42; }}
.lead + p {{ margin-top: 1.6mm; }}
.qr-wrap {{ margin-top: 3.4mm; padding: 2mm; border-radius: 4mm; border: 0.35mm solid #cfe9ec; background: #fff; }}
.qr {{ display: block; width: 50mm; height: 50mm; }}
.url {{ font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 4.4mm; margin-top: 2mm; letter-spacing: 0.01em; }}
.small {{ font-size: 2.35mm; line-height: 1.4; color: #4c7184; margin-top: 2.2mm; }}
.sign {{ font-size: 2.6mm; font-weight: 600; margin-top: auto; color: #2b5568; }}
</style></head>
<body><div class="sheet">{cards}
<div class="cut-v"></div><div class="cut-h"></div>
<div class="scissors" style="left: 102.75mm; top: 3mm; transform: rotate(-90deg)">{SCISSORS}</div>
<div class="scissors" style="left: 3mm; top: 146.25mm">{SCISSORS}</div>
</div></body></html>"""


def main() -> None:
    OUT.mkdir(exist_ok=True)
    svg = qr_svg()
    (OUT / "qr-gardiensdulagon.svg").write_text(svg, encoding="utf-8")
    page = OUT / "flyer-cahier.html"
    page.write_text(html(svg), encoding="utf-8")
    pdf = OUT / "flyer-cahier.pdf"
    subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         "--virtual-time-budget=8000", f"--print-to-pdf={pdf}", page.as_uri()],
        check=True, capture_output=True,
    )
    print(f"OK : {pdf}")


if __name__ == "__main__":
    main()
