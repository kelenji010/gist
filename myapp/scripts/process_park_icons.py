"""Process park puzzle icon assets — strip white backgrounds."""
from pathlib import Path
from PIL import Image
import numpy as np
from collections import deque

ASSETS = Path(
    r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets"
)
OUT = Path(r"C:\Users\kelen\OneDrive\Desktop\Gist\myapp\static\icons")

FILES = {
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-0f9bd064-70a6-47a4-ad9b-cd6bd30d7034.png": "park.png",
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-e06125f4-2684-490f-b1c2-d77b4da0254d.png": "bench.png",
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-50cf2255-ed84-4c09-9bdd-0a8ab9de0355.png": "kaiser-roll.png",
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-c80683cc-3736-4b1a-8ac3-e35d81e0e0ff.png": "rolls-royce.png",
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-342568d8-e7ec-4e59-b424-23e01f4acb2f.png": "maserati.png",
    "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-7f8e8075-8574-4e87-b32e-afd9f98c10d2.png": "lamborghini.png",
}


def flood_clear_white(img, thr=242):
    rgba = img.convert("RGBA")
    arr = np.asarray(rgba).copy()
    H, W = arr.shape[:2]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    is_bg = (r > thr) & (g > thr) & (b > thr)
    visited = np.zeros((H, W), dtype=bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        arr[y, x, 3] = 0
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    return Image.fromarray(arr, "RGBA")


def trim_square(img, pad=10):
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(img.width, x1 + pad), min(img.height, y1 + pad)
    cropped = img.crop((x0, y0, x1, y1))
    side = max(cropped.width, cropped.height, 64)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(cropped, ((side - cropped.width) // 2, (side - cropped.height) // 2), cropped)
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for src_name, out_name in FILES.items():
        src = ASSETS / src_name
        if not src.exists():
            print("MISSING", src_name)
            continue
        out = trim_square(flood_clear_white(Image.open(src)))
        out.thumbnail((256, 256), Image.Resampling.LANCZOS)
        out.save(OUT / out_name)
        print("saved", out_name, out.size)
    print("done")


if __name__ == "__main__":
    main()
