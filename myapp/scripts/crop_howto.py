"""Crop howto demo icons from the reference sheet (rebus + theme examples)."""
from pathlib import Path
from PIL import Image
import numpy as np

SRC = Path(
    r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets"
    r"\c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    r"Gemini_Generated_Image_5vt87h5vt87h5vt8-88feddaf-370a-4280-9137-57c39d51af0b.png"
)
OUT = Path(__file__).resolve().parents[1] / "static" / "howto"
OUT.mkdir(parents=True, exist_ok=True)


def make_transparent(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    a = np.asarray(rgba).copy()
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    white = (r > 240) & (g > 240) & (b > 240)
    a[white, 3] = 0
    return Image.fromarray(a, "RGBA")


def save_icon(im: Image.Image, name: str, trim_bottom: float | None = None):
    if trim_bottom is not None:
        im = im.crop((0, 0, im.width, int(im.height * trim_bottom)))
    out = make_transparent(im)
    bbox = out.getbbox()
    if not bbox:
        print("EMPTY", name)
        return
    x0, y0, x1, y1 = bbox
    pad = 8
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(out.width, x1 + pad), min(out.height, y1 + pad)
    out = out.crop((x0, y0, x1, y1))
    side = max(out.width, out.height, 64)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
    canvas.save(OUT / f"{name}.png")
    print("saved", name, canvas.size)


def vedges(arr, thresh=0.28):
    c = (arr < 90).mean(axis=0)
    xs = np.where(c > thresh)[0]
    if len(xs) == 0:
        return []
    groups = [[xs[0]]]
    for x in xs[1:]:
        if x - groups[-1][-1] <= 4:
            groups[-1].append(x)
        else:
            groups.append([x])
    return [int(np.mean(g)) for g in groups]


def cells_from_edges(img, edges, inset=0.08):
    """edges are vertical line x positions; return crops between consecutive edges."""
    if len(edges) < 2:
        return []
    # also need horizontal bounds from content
    g = np.asarray(img.convert("L"))
    row = (g < 230).mean(axis=1)
    ys = np.where(row > 0.02)[0]
    y0, y1 = int(ys[0]), int(ys[-1]) + 1
    out = []
    for i in range(len(edges) - 1):
        x0, x1 = edges[i], edges[i + 1]
        # skip tiny gaps (double lines)
        if x1 - x0 < 40:
            continue
        dx = int((x1 - x0) * inset)
        dy = int((y1 - y0) * inset)
        out.append(img.crop((x0 + dx, y0 + dy, x1 - dx, y1 - dy)))
    return out


def main():
    img = Image.open(SRC).convert("RGB")

    # Rebus row
    mid = img.crop((20, 175, 1005, 410))
    me = vedges(np.asarray(mid.convert("L")))
    print("mid edges", me)
    mid_cells = cells_from_edges(mid, me, inset=0.1)
    print("mid cells", len(mid_cells))
    names_mid = ["car", "tea", "gun", "cardigan"]
    for name, cell in zip(names_mid, mid_cells):
        # cardigan may have CAPTION text under it — trim
        save_icon(cell, name, trim_bottom=0.82 if name == "cardigan" else None)

    # Theme row
    bot = img.crop((20, 448, 1005, 665))
    be = vedges(np.asarray(bot.convert("L")))
    print("bot edges", be)
    bot_cells = cells_from_edges(bot, be, inset=0.1)
    print("bot cells", len(bot_cells))
    names_bot = ["grass", "moss", "vines", "green-plants"]
    for name, cell in zip(names_bot, bot_cells):
        # green plants has text label under art
        save_icon(cell, name, trim_bottom=0.72 if name == "green-plants" else None)

    print("done ->", OUT)


if __name__ == "__main__":
    main()
