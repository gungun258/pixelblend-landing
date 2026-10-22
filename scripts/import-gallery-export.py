#!/usr/bin/env python3
"""Import gallery-export.json into assets/gallery-seed + update js/pb-gallery.js seed list."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "gallery-export.json"
OUT_DIR = ROOT / "assets" / "gallery-seed"
GALLERY_JS = ROOT / "js" / "pb-gallery.js"


def data_url_to_bytes(url: str):
    if not url or not isinstance(url, str):
        return None, None
    if url.startswith("assets/") or url.startswith("/") or url.startswith("http"):
        return None, "path"
    if not url.startswith("data:"):
        return None, None
    try:
        header, b64 = url.split(",", 1)
    except ValueError:
        return None, None
    ext = "jpg"
    if "image/png" in header:
        ext = "png"
    elif "image/webp" in header:
        ext = "webp"
    elif "image/jpeg" in header or "image/jpg" in header:
        ext = "jpg"
    import base64
    return base64.b64decode(b64), ext


def save_image(data_url: str, stem: str):
    raw, kind = data_url_to_bytes(data_url)
    if kind == "path":
        # already a static path — keep as-is
        return data_url
    if not raw:
        return ""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{stem}.jpg"
    # always write jpg bytes if we decoded; for png keep ext
    if kind == "png":
        path = OUT_DIR / f"{stem}.png"
    elif kind == "webp":
        path = OUT_DIR / f"{stem}.webp"
    path.write_bytes(raw)
    return str(path.relative_to(ROOT)).replace("\\", "/")


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else EXPORT
    if not src.exists():
        # also check Downloads
        home = Path.home() / "Downloads" / "gallery-export.json"
        if home.exists():
            src = home
        else:
            print(f"ERROR: missing {EXPORT}")
            print("Open export-gallery.html in your generate browser, download JSON, put it in project root.")
            return 1

    data = json.loads(src.read_text())
    items = data.get("items") or []
    if not items:
        print("ERROR: no items in export")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seed = []
    for i, item in enumerate(items[:12]):
        n = i + 1
        source = save_image(item.get("source") or "", f"gen-{n}-source")
        background = save_image(item.get("background") or "", f"gen-{n}-bg")
        result = save_image(item.get("result") or item.get("background") or item.get("source") or "", f"gen-{n}-result")
        if not (result or source or background):
            continue
        seed.append({
            "id": f"user-gen-{n}",
            "source": source or background or result,
            "background": background or result or source,
            "result": result or background or source,
            "at": int(item.get("at") or 0) or (1700000000000 + n),
            "seen": True,
            "seeded": True,
        })

    if not seed:
        print("ERROR: could not decode any images (need data URLs from your browser export)")
        return 1

    # Build JS array literal
    lines = ["  var SEED_GENERATED = ["]
    for s in seed:
        lines.append("    {")
        lines.append(f"      id: {json.dumps(s['id'])},")
        lines.append(f"      source: {json.dumps(s['source'])},")
        lines.append(f"      background: {json.dumps(s['background'])},")
        lines.append(f"      result: {json.dumps(s['result'])},")
        lines.append(f"      at: {s['at']},")
        lines.append("      seen: true,")
        lines.append("      seeded: true")
        lines.append("    },")
    lines.append("  ];")
    new_block = "\n".join(lines)

    js = GALLERY_JS.read_text()
    pat = re.compile(r"  var SEED_GENERATED = \[.*?\n  \];", re.S)
    if not pat.search(js):
        print("ERROR: SEED_GENERATED block not found in pb-gallery.js")
        return 1
    GALLERY_JS.write_text(pat.sub(new_block, js))

    # copy export into project if from Downloads
    if src.resolve() != EXPORT.resolve():
        EXPORT.write_text(src.read_text())

    print(f"OK: imported {len(seed)} generation(s) → assets/gallery-seed/ + js/pb-gallery.js")
    for s in seed:
        print(" -", s["id"], s["result"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
