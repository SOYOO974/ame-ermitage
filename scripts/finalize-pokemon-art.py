"""Finalise les illustrations sublimées des cartes Pokémon des élèves.

Usage :
    python scripts/finalize-pokemon-art.py <dossier_png> <id> [<id> ...]

Pour chaque id, lit <dossier_png>/<id>.png (rendu Magnific téléchargé) et écrit
public/images/pokemon-ia/<id>.webp au format maison (1200 px de large, WebP q82),
puis produit la planche de contrôle scratch/qa-renders/sublimation.jpg :
dessin original de l'élève en haut, rendu IA en dessous, à valider avant commit.
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'public/images/pokemon-ia'
ORIG_DIR = ROOT / 'public/images/pokemon-originaux'
SHEET = ROOT / 'scratch/qa-renders/sublimation.jpg'
TILE_W, TILE_H = 420, 315


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    ids = sys.argv[2:]
    cols = min(len(ids), 4)
    rows = -(-len(ids) // cols)
    sheet = Image.new('RGB', (TILE_W * cols, TILE_H * 2 * rows), 'white')

    for i, card_id in enumerate(ids):
        art = Image.open(src / f'{card_id}.png').convert('RGB')
        out = art.copy()
        out.thumbnail((1200, 1200))
        out.save(OUT_DIR / f'{card_id}.webp', quality=82, method=6)
        print(f'{card_id}: {art.size} -> {out.size}, {(OUT_DIR / f"{card_id}.webp").stat().st_size // 1024} Ko')

        x, y = (i % cols) * TILE_W, (i // cols) * TILE_H * 2
        original_path = ORIG_DIR / f'{card_id}.webp'
        if original_path.exists():
            original = Image.open(original_path).convert('RGB')
            original.thumbnail((TILE_W, TILE_H))
            sheet.paste(original, (x + (TILE_W - original.width) // 2, y))
        else:
            print(f'  attention : dessin original absent ({original_path.name})')
        thumb = art.copy()
        thumb.thumbnail((TILE_W, TILE_H))
        sheet.paste(thumb, (x, y + TILE_H))

    SHEET.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEET, quality=85)
    print(f'Planche de contrôle : {SHEET}')


if __name__ == '__main__':
    main()
