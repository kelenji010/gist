from PIL import Image
from pathlib import Path

assets = Path(r"C:\Users\kelen\.cursor\projects\c-Users-kelen-OneDrive-Desktop-Gist\assets")
board = Image.open(assets / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboard001-32fd3424-71d2-42ba-8272-1e9dfa903a29.png")
fill = Image.open(assets / "c__Users_kelen_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_puzzleboardfillin-7bafd063-fc0d-4633-a81b-65670c498e3f.png")
print("board", board.size, board.mode)
print("fill", fill.size, fill.mode)
