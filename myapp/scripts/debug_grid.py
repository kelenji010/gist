"""Debug: save raw cell crops without transparency to find correct grid."""
from pathlib import Path
from PIL import Image

ASSETS = Path(r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets")
OUT = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\scripts\debug_crops")
OUT.mkdir(parents=True, exist_ok=True)

BOARD_PATH = ASSETS / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboard001-32fd3424-71d2-42ba-8272-1e9dfa903a29.png"

board = Image.open(BOARD_PATH).convert("RGB")
w, h = board.size
print("board", w, h)

# Try a few top fractions for the 3x3
for top_frac in [0.28, 0.32, 0.35, 0.38]:
    y0 = int(h * top_frac)
    region = board.crop((0, y0, w, h))
    region.save(OUT / f"region_top{int(top_frac*100)}.png")
    rw, rh = region.size
    # save center of each cell
    for r in range(3):
        for c in range(3):
            L = int(c * rw / 3)
            T = int(r * rh / 3)
            R = int((c + 1) * rw / 3)
            B = int((r + 1) * rh / 3)
            cell = region.crop((L + 20, T + 20, R - 20, B - 20))
            cell.save(OUT / f"t{int(top_frac*100)}_r{r}c{c}.png")
            # darkness score
            g = cell.convert("L")
            avg = sum(g.getdata()) / (g.width * g.height)
            print(f"top{top_frac} r{r}c{c} avg={avg:.1f} size={cell.size}")

print("wrote", OUT)
