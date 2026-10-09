# Green Isn't Ready

An interactive explainer of **NVIDIA Cluster Readiness Engine (NVCRE)**: how it certifies GPU clusters by running real distributed workloads and naming every node that fails. It comes with a **Fundamentals Appendix** that covers the infrastructure, inference, kernel and distributed-systems concepts the article assumes.

The whole thing is one self-contained HTML page (React + TypeScript, bundled and inlined). It works offline; only the web fonts need a network connection.

> Independent explainer. Not affiliated with or endorsed by NVIDIA. Content reflects the NVCRE **v0.6.0** docs and repo as researched on **2026-10-08**. NVCRE is pre-1.0 and its API (`nvcre.nvidia.com/v1alpha1`) can change.

## What's in the page

- **Article, S1–S7:**
  - the 60-second skim
  - why faults hide until there's load
  - the Certification → Workflow → Job model
  - certifying a 16-node cluster
  - what `PASSED` actually means
  - where NVCRE fits next to AICR and NVSentinel
  - limits
- **Interactives, C1–C5:**
  - CRD hierarchy
  - straggler model
  - diagnose/bisection simulator
  - verdict explorer
  - quiz

  Anything marked *Illustrative* is a model, not measured data.
- **Fundamentals Appendix** (hash-routed from `#appendix`):
  - 77 entries across five modules (Infra, Inference, Kernels, Distributed, Tradeoffs)
  - 15 decision cards and a tradeoff matrix
  - 15 formulas and a constraint explorer
  - 6 reading paths
  - an 85-resource registry with a verification status for each link
  - a crosswalk to Baseten's *Inference Engineering* book and its two companion sites
- **Refresher terms:** 66 dotted terms in the article open a refresher sheet that links into the appendix and back.

## Outputs

| File | Use |
|---|---|
| `out/index.html` | Standalone page. Open it in a browser or serve it from any static host. |
| `out/green-isnt-ready.html` | The same page without the `<html>`/`<head>`/`<body>` skeleton, for publishing as a Claude artifact (the host adds the skeleton). |

Both are committed, so you can view the page without building.

## Build

Needs Node ≥ 22.6 and pnpm 10 (`corepack enable` picks up the pinned version).

```sh
pnpm install
pnpm build          # scripts/build.sh
```

`scripts/build.sh` runs five steps:

1. **Data lint and derive.** `scripts/build-data.mjs` checks `data/appendix.src.mjs` and writes `data/appendix.json`. Any hard error fails the build.
2. **Typecheck** with `tsc`.
3. **Bundle** with Parcel.
4. **Inline** everything into one file with `html-inline`.
5. **Post-process** with `scripts/postbundle.mjs`, which:
   - strips the skeleton
   - puts `<title>` first (the artifact host only scans the first 8 KB)
   - injects the appendix JSON as `<script type="application/json" id="appendix-data">`
   - writes both outputs

> Don't add an `engines` field to `package.json`. Parcel reads `engines.node` as a Node target and leaves React unbundled.

## QA

```sh
pnpm test           # logic tests: diagnose simulator, verdict rules, explorer math
pip install playwright && python3 -m playwright install chromium
pnpm qa             # logic tests + Playwright/axe-core checks on out/index.html
```

`scripts/verify.py` checks:

- every refresher anchor opens the right sheet, traps focus and returns focus on close
- article ↔ appendix round trips restore scroll position
- every appendix route renders and every item is reachable
- search and filters
- explorer numbers
- wiring of C1, C3, C4 and C5
- reduced motion
- blocked storage
- light and dark themes
- no horizontal overflow at 380 px and 1280 px
- tap-target sizes
- axe-core violations
- word budgets and content rules

Last run: 407/407 logic assertions and 98/98 browser checks pass.

## Appendix data rules

`data/appendix.src.mjs` is the source of truth; `scripts/build-data.mjs` enforces these rules:

- **Ids:**
  - ids follow per-module conventions
  - every anchor id appears exactly once in the TSX as `<R a="…">`, and every `<R>` has an anchor
- **Tiers:**
  - CORE entries need an inline anchor in the article
  - EXTENDED entries need an inbound card or formula link
- **Budgets:**
  - refresher ≤ 50 words
  - why-here ≤ 30 words
  - module intro 3–5 sentences
  - card fields ≤ 40 words
- **Links:**
  - ≤ 4 links per entry
  - exactly one free start-here resource
  - no duplicate URLs
  - every resource carries a verification status
- **Coverage:**
  - formulas cite sources
  - path steps resolve
  - every book section in the crosswalk is mapped or marked out of scope

Warnings, such as start-here links that aren't verified, print without failing the build.

## Updating when NVCRE changes

| What changed | Edit | Then run |
|---|---|---|
| Article facts | `src/sections/S*.tsx` and `src/data/main.ts` (runs, catalog, defaults, metrics, CRDs, sources) | `pnpm build` |
| Verdict rules or diagnose behaviour | `src/lib/c4.ts` and `src/lib/diagnose.ts` | `pnpm test` |
| Appendix | `data/appendix.src.mjs` | `pnpm build` (the lint catches broken links between entries, anchors, cards and paths) |

Also update the "Based on NVCRE v… researched …" footer in `src/App.tsx`, then rerun `pnpm qa`.

## Known gaps

- **Unverified resources.** 7 resources couldn't be fetched from the build environment and are flagged in the page:
  - *The Tail at Scale*
  - *Cores That Don't Count*
  - *Borg, Omega, and Kubernetes*
  - Kubernetes API Conventions
  - Patarasuk & Yuan
  - Young
  - Daly
- **`intra-screening-no-nvl`.** What this diagnose stage does is undocumented, so the C3 simulator skips it.
- **Thresholds.** NVCRE ships no default thresholds. Numeric bars in the page are examples.
- **Companion sites.** The reading lists and glossaries of the two companion sites weren't mined.
- **Secondary sources.** Rubin naming and timing come from secondary sources.
- **ADR-082.** It's still *Proposed*.

## Layout

```
src/
  sections/       S1–S7 article sections
  interactives/   C1–C5
  appendix/       appendix views: home, module pages, items, explorer, paths, registry, crosswalk
  lib/            data loading, hash router, storage, verdict rules, diagnose model, explorer math, refresher sheet
  data/main.ts    article tables and sources
data/appendix.src.mjs   appendix source of truth
scripts/          build, data lint, post-process, logic tests, browser QA
out/              built pages
```
