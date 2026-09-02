#!/usr/bin/env python3
"""Extract bundled index.html into clean static structure (Option A)."""
import base64
import gzip
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUNDLED = ROOT / "index.html"
BACKUP = ROOT / "index.bundled.html"

MIME_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "font/woff2": ".woff2",
    "text/javascript": ".js",
}

JS_NAMES = {
    "43faa1ea-fe87-4006-9f43-fef330a896a4": "dc-runtime.js",
    "b79bae74-2fdf-4849-8210-1cdb58b96fe2": "dc-components.js",
}


def decode_entry(entry: dict) -> bytes:
    raw = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        raw = gzip.decompress(raw)
    return raw


def main():
    text = BUNDLED.read_text(encoding="utf-8")
    manifest = json.loads(
        re.search(r"<script type=\"__bundler/manifest\">([\s\S]*?)</script>", text).group(1)
    )
    ext_resources = json.loads(
        re.search(r"<script type=\"__bundler/ext_resources\">([\s\S]*?)</script>", text).group(1)
    )
    template = json.loads(
        re.search(r"<script type=\"__bundler/template\">([\s\S]*?)</script>", text).group(1)
    )

    # Backup
    if not BACKUP.exists():
        shutil.copy2(BUNDLED, BACKUP)
        print("Backed up to index.bundled.html")

    assets_img = ROOT / "assets" / "images"
    assets_fonts = ROOT / "assets" / "fonts"
    assets_js = ROOT / "assets" / "js"
    css_dir = ROOT / "css"
    js_dir = ROOT / "js"
    for d in (assets_img, assets_fonts, assets_js, css_dir, js_dir):
        d.mkdir(parents=True, exist_ok=True)

    path_map: dict[str, str] = {}

    for uuid, entry in manifest.items():
        mime = entry["mime"]
        ext = MIME_EXT.get(mime, ".bin")
        data = decode_entry(entry)

        if mime == "text/javascript":
            name = JS_NAMES.get(uuid, f"{uuid}.js")
            rel = f"assets/js/{name}"
            (assets_js / name).write_bytes(data)
        elif mime.startswith("image/"):
            rel = f"assets/images/{uuid}{ext}"
            (assets_img / f"{uuid}{ext}").write_bytes(data)
        elif mime.startswith("font/"):
            rel = f"assets/fonts/{uuid}{ext}"
            (assets_fonts / f"{uuid}{ext}").write_bytes(data)
        else:
            rel = f"assets/{uuid}{ext}"
            (ROOT / "assets" / f"{uuid}{ext}").write_bytes(data)

        path_map[uuid] = rel
        print(f"  {rel} ({len(data)} bytes)")

    # Move root art files into assets/images if present
    for art in ("option1-art.png", "option2-art.png", "option2-lineart.png"):
        src = ROOT / art
        if src.exists():
            dst = assets_img / art
            if not dst.exists():
                shutil.copy2(src, dst)
            path_map_art = f"assets/images/{art}"
            template = template.replace(f"src=\"{art}\"", f"src=\"{path_map_art}\"")
            template = template.replace(f"'{art}'", f"'{path_map_art}'")

    # Replace UUID refs in template (longest first to avoid partial matches)
    for uuid in sorted(path_map.keys(), key=len, reverse=True):
        template = template.replace(uuid, path_map[uuid])

    # Build __resources map (id -> asset path)
    resource_map = {}
    for entry in ext_resources:
        uid = entry["uuid"]
        if uid in path_map:
            resource_map[entry["id"]] = path_map[uid]

    resource_script = (
        "<script>window.__resources = "
        + json.dumps(resource_map, separators=(",", ":"))
        + ";</script>"
    )

    # Strip SRI / crossorigin (only needed for blob URLs)
    template = re.sub(r"\s+integrity=\"[^\"]*\"", "", template, flags=re.I)
    template = re.sub(r"\s+crossorigin=\"[^\"]*\"", "", template, flags=re.I)

    # Framework script path
    fw = path_map["43faa1ea-fe87-4006-9f43-fef330a896a4"]
    template = re.sub(
        r'<script\s+src="' + re.escape(fw) + r'"\s*></script>\s*</script>',
        f'<script src="{fw}"></script>',
        template,
        count=1,
    )
    template = re.sub(
        r'<script\s+src="' + re.escape(fw) + r'"\s*>',
        f'<script src="{fw}"></script>',
        template,
        count=1,
    )

    boot_css = (
        "<style id=\"pb-boot-css\">"
        "html.pb-booting,html.pb-booting body{background:#FAF4FB!important;overflow:hidden!important}"
        "html.pb-booting body{visibility:hidden!important}"
        "html.pb-booting #pb-boot-cover{visibility:visible!important}"
        "</style>"
    )
    boot_cover = (
        '<div id="pb-boot-cover" aria-hidden="true" '
        'style="position:fixed;inset:0;z-index:2147483647;background:#FAF4FB;'
        'display:flex;align-items:center;justify-content:center;">'
        '<div style="width:72px;height:72px;border-radius:22px;'
        'background:linear-gradient(113.667deg,#A855F7,#EC4899,#F43F5E);"></div></div>'
    )
    styles_link = (
        '<link id="pb-responsive-fixes" rel="stylesheet" href="css/styles.css">'
    )
    site_script = '<script src="js/site.js" defer></script>'

    # Inject into <head>
    head_open = re.search(r"<head[^>]*>", template, re.I)
    if head_open:
        i = head_open.end()
        template = template[:i] + resource_script + boot_css + styles_link + template[i:]

    # Add pb-booting to <html>
    template = re.sub(
        r"<html([^>]*)>",
        lambda m: f"<html{m.group(1)} class=\"pb-booting\">",
        template,
        count=1,
        flags=re.I,
    )

    # Boot cover after <body>
    body_open = re.search(r"<body[^>]*>", template, re.I)
    if body_open:
        i = body_open.end()
        template = template[:i] + boot_cover + template[i:]

    # site.js before </body>
    template = re.sub(r"</body>", site_script + "</body>", template, count=1, flags=re.I)

    # Write page HTML as index.html
    out = ROOT / "index.html"
    out.write_text(template, encoding="utf-8")
    print(f"Wrote {out} ({len(template)} chars)")

    # Move styles.css to css/
    styles_src = ROOT / "styles.css"
    styles_dst = css_dir / "styles.css"
    if styles_src.exists():
        shutil.copy2(styles_src, styles_dst)
        print(f"Copied styles.css -> css/styles.css")

    # Write resource map for debugging
    (ROOT / "assets" / "resource-map.json").write_text(
        json.dumps({"paths": path_map, "resources": resource_map}, indent=2),
        encoding="utf-8",
    )
    print("Done.")


if __name__ == "__main__":
    main()
