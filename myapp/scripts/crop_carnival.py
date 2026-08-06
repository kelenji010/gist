"""
Crop carnival puzzle icons from the Gemini reference sheet.
"""
from pathlib import Path
from PIL import Image
import numpy as np

ASSETS = Path(
    r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets"
)
SRC = (
    ASSETS
    / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Gemini_Generated_Image_nchmqwnchmqwnchm-af57a709-2cc6-4c36-b1e7-e7c0fd3870e9.png"
)
OUT = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\static\icons")
DBG = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\scripts\debug_carnival")
OUT.mkdir(parents=True, exist_ok=True)
DBG.mkdir(parents=True, exist_ok=True)


def make_transparent(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.asarray(rgba).copy()
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    white = (r > 242) & (g > 242) & (b > 242)
    cream = (r > 215) & (g > 205) & (b > 185)
    light = (r > 230) & (g > 230) & (b > 230)
    arr[white | cream | light, 3] = 0
    return Image.fromarray(arr, "RGBA")


def save_icon(img: Image.Image, name: str, keep_bg: bool = False):
    if keep_bg:
        out = img.convert("RGBA")
    else:
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


def trim_ink(img, thr=240):
    a = np.asarray(img.convert("L"), dtype=np.float32)
    col_ink = (a < thr).mean(axis=0)
    row_ink = (a < thr).mean(axis=1)
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


def find_gaps(mask_1d, min_len=12):
    gaps = []
    i = 0
    n = len(mask_1d)
    while i < n:
        if mask_1d[i]:
            j = i
            while j < n and mask_1d[j]:
                j += 1
            if j - i >= min_len:
                gaps.append((i, j))
            i = j
        else:
            i += 1
    return gaps


def main():
    board = Image.open(SRC).convert("RGB")
    arr = np.asarray(board.convert("L"), dtype=np.float32)
    ys, xs = np.where(arr < 250)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    sheet = board.crop((x0, y0, x1, y1))
    g = np.asarray(sheet.convert("L"), dtype=np.float32)

    # Detect vertical gutter between main board and fill column
    col_ink = (g < 240).mean(axis=0)
    # Look for a low-ink band in the middle-right
    best = None
    for i in range(int(sheet.width * 0.45), int(sheet.width * 0.85)):
        window = col_ink[i : i + 20].mean()
        if best is None or window < best[0]:
            best = (window, i)
    gutter_x = best[1] + 10
    print("gutter_x", gutter_x, "ink", best[0])

    left = sheet.crop((0, 0, gutter_x, sheet.height))
    right = sheet.crop((gutter_x, 0, sheet.width, sheet.height))
    left = trim_ink(left)
    right = trim_ink(right)
    left.save(DBG / "left.png")
    right.save(DBG / "right.png")
    print("left", left.size, "right", right.size)

    # Split left into top strip + 3x3 via white gap
    la = np.asarray(left.convert("L"), dtype=np.float32)
    row_ink = (la < 240).mean(axis=1)
    white = row_ink < 0.02
    gaps = find_gaps(white, min_len=10)
    print("left row gaps", gaps)
    # Prefer a gap after the top strip (~20-40% down)
    split_y = None
    for a, b in gaps:
        mid = (a + b) // 2
        if 0.12 * left.height < mid < 0.45 * left.height:
            split_y = mid
            break
    if split_y is None and gaps:
        split_y = (gaps[0][0] + gaps[0][1]) // 2
    print("split_y", split_y)

    top = trim_ink(left.crop((0, 0, left.width, split_y)))
    grid = trim_ink(left.crop((0, split_y, left.width, left.height)))
    top.save(DBG / "top_trim.png")
    grid.save(DBG / "grid_trim.png")
    print("top", top.size, "grid", grid.size)

    for name, cell in zip(["car", "knee", "bull"], split(top, 1, 3, inset=0.12)):
        save_icon(cell, name)

    # Board cells — neon & bullseye keep dark/colorful backgrounds
    grid_names = [
        ("neon", True),
        ("bumper", False),
        ("minus", False),
        ("roller-coaster", False),
        ("clown", False),
        ("on", False),
        ("horn", False),
        ("red-cape", False),
        ("bullseye-target", False),
    ]
    for (name, keep_bg), cell in zip(grid_names, split(grid, 3, 3, inset=0.1)):
        save_icon(cell, name, keep_bg=keep_bg)

    # Fill column: 2 cols x 3 rows (bottom row empty)
    fill = trim_ink(right)
    fill.save(DBG / "fill_trim.png")
    # Only top 2 rows have icons
    fa = np.asarray(fill.convert("L"), dtype=np.float32)
    row_ink = (fa < 240).mean(axis=1)
    # find where content ends (before empty bottom cells)
    content_rows = np.where(row_ink > 0.02)[0]
    fill_content = fill.crop((0, 0, fill.width, int(content_rows[-1]) + 1))
    fill_content = trim_ink(fill_content)
    fill_content.save(DBG / "fill_content.png")
    print("fill_content", fill_content.size)

    fill_names = [
        ("x-ray", True),
        ("lamp", False),
        ("tusk", False),
        ("fingernail", False),
    ]
    # 2x2 of filled cells
    for (name, keep_bg), cell in zip(fill_names, split(fill_content, 2, 2, inset=0.08)):
        save_icon(cell, name, keep_bg=keep_bg)

    # Also save neon fill option (same as board neon) already done
    print("done ->", OUT)


if __name__ == "__main__":
    main()
