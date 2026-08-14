"""Strip white / drop-shadow backgrounds from luxury car icons."""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ICONS = Path(__file__).resolve().parents[1] / "static" / "icons"
FILES = ["lamborghini.png", "maserati.png", "rolls-royce.png"]


def flood(mask, seeds):
    H, W = mask.shape
    visited = np.zeros((H, W), dtype=bool)
    q = deque()
    for y, x in seeds:
        if 0 <= y < H and 0 <= x < W and mask[y, x] and not visited[y, x]:
            visited[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    return visited


def edge_seeds(H, W):
    seeds = []
    for x in range(W):
        seeds.append((0, x))
        seeds.append((H - 1, x))
    for y in range(H):
        seeds.append((y, 0))
        seeds.append((y, W - 1))
    return seeds


def knockout(img: Image.Image) -> Image.Image:
    arr = np.asarray(img.convert("RGBA")).copy()
    H, W = arr.shape[:2]
    r = arr[:, :, 0].astype(np.float32)
    g = arr[:, :, 1].astype(np.float32)
    b = arr[:, :, 2].astype(np.float32)
    mn = np.minimum(np.minimum(r, g), b)
    mx = np.maximum(np.maximum(r, g), b)
    sat = np.divide(mx - mn, mx, out=np.zeros_like(mx), where=mx > 0)
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    white = mn >= 236
    hit = flood(white, edge_seeds(H, W))
    arr[hit, 3] = 0

    # Soft drop shadows / leftover halos around the emblem, not interior chrome.
    shadow = (arr[:, :, 3] > 0) & (sat < 0.16) & (lum >= 200) & (mn >= 185)
    # Seed only where a neighbor is already transparent.
    trans = arr[:, :, 3] == 0
    seeds = []
    ys, xs = np.where(shadow)
    for y, x in zip(ys.tolist(), xs.tolist()):
        y0, y1 = max(0, y - 1), min(H, y + 2)
        x0, x1 = max(0, x - 1), min(W, x + 2)
        if trans[y0:y1, x0:x1].any():
            seeds.append((y, x))
    if seeds:
        hit_shadow = flood(shadow, seeds)
        arr[hit_shadow, 3] = 0

    # Anti-aliased fringe: fade remaining near-white pixels next to transparency.
    trans = arr[:, :, 3] == 0
    kernel = np.zeros((H, W), dtype=bool)
    kernel[1:, :] |= trans[:-1, :]
    kernel[:-1, :] |= trans[1:, :]
    kernel[:, 1:] |= trans[:, :-1]
    kernel[:, :-1] |= trans[:, 1:]
    fringe = kernel & (arr[:, :, 3] > 0) & (mn > 210)
    if fringe.any():
        fade = np.clip((255 - mn[fringe]) / 45.0, 0, 1)
        arr[fringe, 3] = (arr[fringe, 3].astype(np.float32) * fade).astype(np.uint8)

    out = Image.fromarray(arr, "RGBA")
    bbox = out.getbbox()
    if not bbox:
        return out
    x0, y0, x1, y1 = bbox
    pad = max(8, int(min(x1 - x0, y1 - y0) * 0.06))
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(out.width, x1 + pad), min(out.height, y1 + pad)
    cropped = out.crop((x0, y0, x1, y1))
    side = max(cropped.width, cropped.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(cropped, ((side - cropped.width) // 2, (side - cropped.height) // 2), cropped)
    return canvas


def main():
    for name in FILES:
        path = ICONS / name
        src = Image.open(path)
        out = knockout(src)
        out.save(path)
        opaque = int((np.asarray(out)[:, :, 3] > 8).mean() * 100)
        print(f"{name}: {src.size} -> {out.size}, opaque={opaque}%")


if __name__ == "__main__":
    main()
