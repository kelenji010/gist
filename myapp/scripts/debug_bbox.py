"""Find content bbox and dark grid lines on the board sheet."""
from pathlib import Path
from PIL import Image
import numpy as np

ASSETS = Path(r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets")
OUT = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\scripts\debug_crops")
BOARD_PATH = ASSETS / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboard001-32fd3424-71d2-42ba-8272-1e9dfa903a29.png"

board = Image.open(BOARD_PATH).convert("RGB")
arr = np.asarray(board, dtype=np.float32)
gray = arr.mean(axis=2)
# content = not near-white
content = gray < 250
ys, xs = np.where(content)
print("content bbox", xs.min(), ys.min(), xs.max(), ys.max())

# Crop to content
x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
pad = 4
x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
x1, y1 = min(board.width, x1 + pad), min(board.height, y1 + pad)
cropped = board.crop((x0, y0, x1, y1))
cropped.save(OUT / "content_bbox.png")
print("cropped size", cropped.size)

# Split content into top strip vs bottom by finding a thick white horizontal gap
g = gray[y0:y1, x0:x1]
row_dark = (g < 240).mean(axis=1)
# Find a band of mostly-white rows in the middle
white_rows = row_dark < 0.01
# longest white run after first content
runs = []
i = 0
n = len(white_rows)
while i < n:
    if not white_rows[i]:
        i += 1
        continue
    j = i
    while j < n and white_rows[j]:
        j += 1
    runs.append((i, j, j - i))
    i = j
print("white runs", runs[:10], "... total", len(runs))
# pick a significant white gap not at edges
gaps = [r for r in runs if r[2] > 8 and r[0] > 20 and r[1] < n - 20]
print("mid gaps", gaps)

if gaps:
    gap = max(gaps, key=lambda r: r[2])
    split = gap[0] + (gap[1] - gap[0]) // 2
    print("split at", split)
    top = cropped.crop((0, 0, cropped.width, split))
    bot = cropped.crop((0, split, cropped.width, cropped.height))
    top.save(OUT / "top_strip.png")
    bot.save(OUT / "bot_grid.png")
    print("top", top.size, "bot", bot.size)

    # Now split bot into 3x3 using content bbox of bot
    ba = np.asarray(bot.convert("L"), dtype=np.float32)
    # vertical lines: columns with high dark fraction
    col_dark = (ba < 200).mean(axis=0)
    row_dark2 = (ba < 200).mean(axis=1)

    def line_positions(proj, expected):
        # sliding window peaks of darkness for grid lines (thin)
        # Instead: find cell centers by dividing content where proj is nonzero
        content_idx = np.where(proj > 0.005)[0]
        if len(content_idx) == 0:
            return []
        # Use equal division of content span
        lo, hi = content_idx[0], content_idx[-1]
        edges = [lo + (hi - lo) * i / expected for i in range(expected + 1)]
        return edges

    # Better approach: detect vertical grid lines as narrow dark spikes
    def find_lines(proj, n_lines, is_row=False):
        # proj high = more ink. Grid lines are continuous across.
        # For board borders: dark fraction high across the other axis
        thresh = np.percentile(proj, 85)
        dark = proj > max(thresh, 0.15)
        # also try absolute
        dark2 = proj > 0.25
        for dlabel, d in [("p85", dark), ("0.25", dark2)]:
            idxs = []
            i = 0
            while i < len(d):
                if not d[i]:
                    i += 1
                    continue
                j = i
                while j < len(d) and d[j]:
                    j += 1
                if j - i >= 1:
                    idxs.append((i + j) // 2)
                i = j
            print(f"  lines {dlabel}: {len(idxs)}", idxs[:20])
        # equal split fallback using content extent
        content_idx = np.where(proj > 0.01)[0]
        lo, hi = int(content_idx[0]), int(content_idx[-1])
        return [lo + (hi - lo) * i / (n_lines - 1) for i in range(n_lines)]

    print("bot col analysis")
    vedges = find_lines(col_dark, 4)
    print("bot row analysis")
    hedges = find_lines(row_dark2, 4)
    print("vedges", vedges)
    print("hedges", hedges)

    # Crop with equal 3x3 inside bot content
    names = [
        "empty1", "awl", "empty2",
        "hand", "jay", "himantes2",
        "wisdom", "eye-chart", "eye",
    ]
    bh, bw = ba.shape
    # Use full bot with small margin
    m = 8
    for r in range(3):
        for c in range(3):
            L = m + int(c * (bw - 2 * m) / 3)
            R = m + int((c + 1) * (bw - 2 * m) / 3)
            T = m + int(r * (bh - 2 * m) / 3)
            B = m + int((r + 1) * (bh - 2 * m) / 3)
            inset = 12
            cell = bot.crop((L + inset, T + inset, R - inset, B - inset))
            name = names[r * 3 + c]
            cell.save(OUT / f"bot_{name}.png")
            avg = float(np.asarray(cell.convert("L")).mean())
            print(name, "avg", round(avg, 1), cell.size)
