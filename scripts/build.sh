#!/usr/bin/env bash
# Builds out/green-isnt-ready.html (artifact body) and out/index.html (standalone page).
# data lint + derive → typecheck → Parcel bundle → inline assets → post-process
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .qa

echo "1/5 data lint (data/appendix.src.mjs → data/appendix.json)"
node scripts/build-data.mjs > .qa/lint.txt 2>&1 || { cat .qa/lint.txt; exit 1; }
tail -1 .qa/lint.txt

echo "2/5 typecheck"
pnpm exec tsc -p tsconfig.app.json --noEmit

echo "3/5 bundle (Parcel)"
rm -rf dist bundle.html
pnpm exec parcel build index.html --dist-dir dist --no-source-maps > .qa/bundle.txt 2>&1 || { tail -30 .qa/bundle.txt; exit 1; }

echo "4/5 inline assets"
pnpm exec html-inline dist/index.html > bundle.html

echo "5/5 post-process"
node scripts/postbundle.mjs
