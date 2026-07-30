"""
Crop icons using detected grid bounds (board grid is left-aligned in the sheet).
"""
from pathlib import Path
from PIL import Image
import numpy as np

ASSETS = Path(r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets")
OUT = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\static\icons")
OUT.mkdir(parents=True, exist_ok=True)

BOARD_PATH = ASSETS / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboard001-32fd3424-71d2-42ba-8272-1e9dfa903a29.png"
FILL_PATH = ASSETS / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboardfillin-7bafd063-fc0d-4633-a81b-65670c498e3f.png"


def make_transparent(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.asarray(rgba).copy()
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    white = (r > 242) & (g > 242) & (b > 242)
    cream = (r > 215) & (g > 205) & (b > 185)
    light = (r > 230) & (g > 230) & (b > 230)
    arr[white | cream | light, 3] = 0
    return Image.fromarray(arr, "RGBA")


def save_icon(img: Image.Image, name: str):
    out = make_transparent(img)
    bbox = out.getbbox()
    if not bbox:
        print("EMPTY", name)
        Image.new("RGBA", (64, 64), (0, 0, 0, 0)).save(OUT / f"{name}.png")
        return
    x0, y0, x1, y1 = bbox
    pad = max(8, int(min(x1 - x0, y1 - y0) * 0.08))
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(out.width, x1 + pad), min(out.height, y1 + pad)
    out = out.crop((x0, y0, x1, y1))
    side = max(out.width, out.height, 64)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
    canvas.save(OUT / f"{name}.png")
    print("saved", name, canvas.size)


def split(img, rows, cols, inset=0.1):
    w, h = img.size
    cells = []
    for r in range(rows):
        for c in range(cols):
            L = int(c * w / cols)
            T = int(r * h / rows)
            R = int((c + 1) * w / cols)
            B = int((r + 1) * h / rows)
            dx, dy = int((R - L) * inset), int((B - T) * inset)
            cells.append(img.crop((L + dx, T + dy, R - dx, B - dy)))
    return cells


def main():
    board = Image.open(BOARD_PATH).convert("RGB")
    fill = Image.open(FILL_PATH).convert("RGB")
    arr = np.asarray(board.convert("L"), dtype=np.float32)

    # Content bbox
    ys, xs = np.where(arr < 250)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    sheet = board.crop((x0, y0, x1, y1))
    g = np.asarray(sheet.convert("L"), dtype=np.float32)
    row_ink = (g < 240).mean(axis=1)
    white = row_ink < 0.01
    # gap between top strip and board
    gap_start = None
    i = 40
    while i < len(white) - 40:
        if white[i]:
            j = i
            while j < len(white) and white[j]:
                j += 1
            if j - i > 20:
                gap_start, gap_end = i, j
                break
            i = j
        else:
            i += 1
    split_y = (gap_start + gap_end) // 2
    top = sheet.crop((0, 0, sheet.width, split_y))
    bot = sheet.crop((0, split_y, sheet.width, sheet.height))

    def trim_ink(img):
        a = np.asarray(img.convert("L"), dtype=np.float32)
        col_ink = (a < 240).mean(axis=0)
        row_ink = (a < 240).mean(axis=1)
        ink_cols = np.where(col_ink > 0.01)[0]
        ink_rows = np.where(row_ink > 0.01)[0]
        return img.crop(
            (
                int(ink_cols[0]),
                int(ink_rows[0]),
                int(ink_cols[-1]) + 1,
                int(ink_rows[-1]) + 1,
            )
        )

    # Both strips are left-aligned in a wider canvas — crop to ink first
    top = trim_ink(top)
    grid = trim_ink(bot)
    print("top size", top.size, "grid size", grid.size)

    for name, cell in zip(["mitt", "owl", "algae"], split(top, 1, 3, inset=0.12)):
        save_icon(cell, name)

    names = [
        None, "awl", None,
        "hand", "jay", "himantes2",
        "wisdom", "eye-chart", "eye",
    ]
    for name, cell in zip(names, split(grid, 3, 3, inset=0.12)):
        if name:
            save_icon(cell, name)

    # Fill sheet — full image is the 2x3 grid
    fill_names = [
        "himantes1", "athena", "hera",
        "aphrodite", "helmet", "mittens",
    ]
    # Trim fill sheet content
    fa = np.asarray(fill.convert("L"), dtype=np.float32)
    ys, xs = np.where(fa < 245)
    fx0, fy0, fx1, fy1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    fill_grid = fill.crop((fx0, fy0, fx1, fy1))
    print("fill grid", fill_grid.size)
    for name, cell in zip(fill_names, split(fill_grid, 2, 3, inset=0.08)):
        save_icon(cell, name)

    print("done ->", OUT)


if __name__ == "__main__":
    main()
