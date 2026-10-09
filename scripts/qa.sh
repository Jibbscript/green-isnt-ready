#!/usr/bin/env bash
# Logic tests, then Playwright + axe-core checks against out/index.html. Run scripts/build.sh first.
# Needs Python 3 with Playwright: pip install playwright && python3 -m playwright install chromium
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -f out/index.html && -f data/appendix.json ]] || { echo "Run scripts/build.sh first." >&2; exit 1; }

node --experimental-strip-types --no-warnings scripts/test-logic.ts
python3 scripts/verify.py out/index.html node_modules/axe-core/axe.min.js data/appendix.json
