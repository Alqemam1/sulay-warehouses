"""Cache busting: stamp ?v=<content hash> on the CSS/JS links in index.html.

Run from the repo root after editing css/style.css, js/main.js or config.js:
    python3 scripts/stamp_versions.py
The hash only changes when a file's content changes, so browsers re-download
exactly the files that changed and keep the rest cached.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
ASSETS = ["css/style.css", "js/main.js", "config.js"]

html = INDEX.read_text(encoding="utf-8")
for asset in ASSETS:
    digest = hashlib.sha256((ROOT / asset).read_bytes()).hexdigest()[:10]
    # matches href="css/style.css" or src="config.js", with or without an old ?v=...
    pattern = re.compile(r'((?:href|src)=")' + re.escape(asset) + r'(?:\?v=[^"]*)?(")')
    html, n = pattern.subn(r"\g<1>" + asset + "?v=" + digest + r"\g<2>", html)
    if n == 0:
        raise SystemExit(f"لم يُعثر على رابط {asset} في index.html")
    print(f"{asset:16s} v={digest}  ({n} link)")
INDEX.write_text(html, encoding="utf-8")
