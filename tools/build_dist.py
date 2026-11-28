# -*- coding: utf-8 -*-
"""
把源码（index.html + styles.css + js/*.js）打包成 dist/知课AI-单文件版.html，
并将幻灯片原图以 base64 内联（window.__SD_INLINE），保证单文件可离线独立打开。
用法：python tools/build_dist.py
"""
import re
import json
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
DST = ROOT / "dist" / "知课AI-单文件版.html"

JS_FILES = [
    "js/data-math.js",
    "js/data-physics.js",
    "js/data.js",
    "js/store.js",
    "js/slide-decks.js",
    "js/actions.js",
    "js/views-common.js",
    "js/views-teacher.js",
    "js/views-student.js",
    "js/app.js",
]

# 需要内联的幻灯片图集目录（与 js/slide-decks.js 中 deck.dir 保持一致）
DECK_DIRS = ["slides/gaoshu-map", "slides/jingdianchang"]


def build_inline_images():
    inline = {}
    for deck_dir in DECK_DIRS:
        imgs = []
        d = ROOT / deck_dir
        i = 1
        while True:
            p = d / f"slide_{i:02d}.png"
            if not p.exists():
                break
            b64 = base64.b64encode(p.read_bytes()).decode("ascii")
            imgs.append("data:image/png;base64," + b64)
            i += 1
        inline[deck_dir] = imgs
        print(f"  inlined {deck_dir}: {len(imgs)} slides")
    return inline


def main():
    html = SRC.read_text(encoding="utf-8-sig")

    # 1. 内联 CSS
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    html = re.sub(
        r'<link rel="stylesheet" href="styles\.css\?v=\d+">',
        "<style>\n" + css + "\n</style>",
        html,
        count=1,
    )

    # 2. 内联各 JS 文件（按顺序）
    def repl(m):
        src = m.group(1).split("?")[0]
        if src in JS_FILES:
            content = (ROOT / src).read_text(encoding="utf-8")
            return f"<script>\n/* ===== {src} ===== */\n{content}\n</script>"
        return m.group(0)

    html = re.sub(r'<script src="([^"]+)"></script>', repl, html)

    # 3. 注入内联幻灯片图片（供 slideImgSrc 优先使用）
    inline = build_inline_images()
    js_inline = "window.__SD_INLINE = " + json.dumps(inline, ensure_ascii=False) + ";"
    html = html.replace(
        "</body>",
        "<script>\n/* inlined slide images */\n" + js_inline + "\n</script>\n</body>",
        1,
    )

    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(html, encoding="utf-8")
    size_mb = DST.stat().st_size / 1024 / 1024
    print(f"built {DST}  ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
