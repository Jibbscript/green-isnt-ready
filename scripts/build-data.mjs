// Build-time lint + derivation for the Fundamentals Appendix (§13, §21).
// Usage: node scripts/build-data.mjs  → writes data/appendix.json, prints a QA report.
// Exits non-zero on any hard failure (QA hard fail per §11 tier rules / §21).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as src from '../data/appendix.src.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hard = [];
const warn = [];
const fail = (m) => hard.push(m);
const note = (m) => warn.push(m);

const words = (s) => (s || '').split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
const sentences = (s) => (s || '').split(/(?<=[.!?])\s+/).filter((t) => t.trim()).length;

const { modules, resources, entries, formulas, cards, paths, anchors, crosswalk } = src;

// ── id registry & conventions
const ids = new Map();
const reg = (kind, list, re) => {
  for (const x of list) {
    if (ids.has(x.id)) fail(`duplicate id ${x.id}`);
    ids.set(x.id, kind);
    if (!re.test(x.id)) fail(`${kind} id "${x.id}" breaks convention ${re}`);
  }
};
reg('entry', entries, /^[a-d]-[a-z0-9-]+$/);
reg('card', cards, /^e-\d{2}$/);
reg('formula', formulas, /^f-\d{2}$/);
reg('path', paths, /^p-\d$/);
reg('anchor', anchors, /^anc-[a-z0-9-]+$/);
reg('resource', resources, /^r-[a-z0-9-]+$/);
const isTarget = (id) => ['entry', 'card', 'formula'].includes(ids.get(id));
const res = Object.fromEntries(resources.map((r) => [r.id, r]));
const needRes = (rid, where) => { if (!res[rid]) fail(`${where}: unknown resource ${rid}`); };

// ── modules
for (const m of modules) {
  const n = sentences(m.intro);
  if (n < 3 || n > 5) fail(`module ${m.id} intro has ${n} sentences (budget 3–5)`);
  if (!m.selfCheck?.length || m.selfCheck.length > 3) fail(`module ${m.id} needs 1–3 self-check prompts`);
}

// ── resources: duplicate URLs, fields
const byUrl = new Map();
for (const r of resources) {
  const u = r.url.replace(/\/+$/, '').toLowerCase();
  if (byUrl.has(u)) fail(`duplicate URL ${r.url} (${byUrl.get(u)} & ${r.id})`);
  byUrl.set(u, r.id);
  if (!['free', 'registration', 'paywalled'].includes(r.access)) fail(`${r.id}: bad access ${r.access}`);
  if (!['paper', 'official-doc', 'spec', 'course', 'lecture', 'book', 'blog', 'repo', 'interactive-refresher'].includes(r.type)) fail(`${r.id}: bad type ${r.type}`);
  if (!['refresher', 'intermediate', 'deep'].includes(r.level)) fail(`${r.id}: bad level ${r.level}`);
  if (!['verified', 'main-spec', 'link-checked', 'listed', 'seed', 'derived', 'unverified'].includes(r.status)) fail(`${r.id}: bad status ${r.status}`);
  if (!r.verified) note(`${r.id} not verified (status: ${r.status}${r.check ? ': ' + r.check : ''})`);
  if (!/^https:\/\//.test(r.url)) fail(`${r.id}: URL must be https`);
}

// ── anchors
const tsxAnchors = new Map();
const tsxFund = new Map();
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
for (const f of walk(join(root, 'src')).filter((p) => /\.tsx?$/.test(p))) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(/<R\s+a="(anc-[^"]+)"/g)) tsxAnchors.set(m[1], (tsxAnchors.get(m[1]) || 0) + 1);
  for (const m of t.matchAll(/<Fund\s+id="([^"]+)"/g)) tsxFund.set(m[1], f);
}
for (const a of anchors) {
  if (!a.entries.length) fail(`${a.id} has no targets`);
  for (const t of a.entries) if (!isTarget(t)) fail(`${a.id} → unknown target ${t}`);
  if (!tsxAnchors.has(a.id)) fail(`${a.id} is never placed in the article (no <R a="${a.id}">)`);
}
for (const id of tsxAnchors.keys()) if (ids.get(id) !== 'anchor') fail(`article uses unknown anchor ${id}`);
for (const [id, f] of tsxFund) if (!isTarget(id)) fail(`<Fund id="${id}"> in ${f} → unknown target`);

// ── entries
for (const e of entries) {
  if (e.module !== e.id[0]) fail(`${e.id}: module mismatch`);
  if (!['CORE', 'EXTENDED'].includes(e.tier)) fail(`${e.id}: bad tier`);
  const rw = words(e.refresher), ww = words(e.whyHere);
  if (rw > 50) fail(`${e.id}: refresher ${rw} words (budget ≤50)`);
  if (ww > 30) fail(`${e.id}: why-here ${ww} words (budget ≤30)`);
  if (!e.resources.length) fail(`${e.id}: no resources`);
  if (e.resources.length > 4) fail(`${e.id}: ${e.resources.length} links (budget ≤4)`);
  if (new Set(e.resources).size !== e.resources.length) fail(`${e.id}: duplicate resource`);
  e.resources.forEach((r) => needRes(r, e.id));
  if (!e.resources.includes(e.startHere)) fail(`${e.id}: start-here not among its resources`);
  if (res[e.startHere] && res[e.startHere].access !== 'free') fail(`${e.id}: start-here ${e.startHere} is not free`);
  if (res[e.startHere] && !['verified', 'main-spec', 'link-checked'].includes(res[e.startHere].status)) note(`${e.id}: start-here ${e.startHere} is ${res[e.startHere].status}`);
  for (const p of [...e.prereqs, ...e.related]) if (!isTarget(p)) fail(`${e.id}: prereq/related ${p} unknown`);
}

// ── formulas
for (const f of formulas) {
  if (!f.sources.length && !f.sourceNote) fail(`${f.id}: no source`);
  f.sources.forEach((r) => needRes(r, f.id));
  for (const e of f.entries) if (ids.get(e) !== 'entry') fail(`${f.id}: entry ${e} unknown`);
}

// ── cards
for (const c of cards) {
  const fields = { why: c.why, gains: c.gains, costs: c.costs, nvcre: c.nvcre };
  for (const [k, v] of Object.entries(fields)) {
    if (!v) fail(`${c.id}: missing ${k}`);
    if (words(v) > 40) fail(`${c.id}: ${k} ${words(v)} words (budget ≤40)`);
  }
  for (const x of [...c.levers, ...c.signatures, ...(c.extra || []).map((e) => e.text)]) if (words(x) > 40) fail(`${c.id}: field over 40 words`);
  for (const n of c.numbers) {
    if (!n.date) fail(`${c.id}: number without date: ${n.v}`);
    if (n.src) needRes(n.src, c.id); else if (!n.note) fail(`${c.id}: number without source or note: ${n.v}`);
  }
  if (!['yes', 'partial', 'proposed', 'no'].includes(c.coverage)) fail(`${c.id}: bad coverage`);
  for (const l of c.links) if (ids.get(l) !== 'entry') fail(`${c.id}: link ${l} unknown`);
  for (const f of c.formulas) if (ids.get(f) !== 'formula') fail(`${c.id}: formula ${f} unknown`);
  c.resources.forEach((r) => needRes(r, c.id));
  if (!c.matrix) fail(`${c.id}: no matrix row`);
}

// ── tier rules (§11): CORE needs an anchor; EXTENDED needs an inbound card/formula link
const anchorsFor = (id) => anchors.filter((a) => a.entries.includes(id));
const cardsFor = (id) => cards.filter((c) => c.links.includes(id));
const formulasFor = (id) => formulas.filter((f) => f.entries.includes(id));
for (const e of entries) {
  const a = anchorsFor(e.id), c = cardsFor(e.id), f = formulasFor(e.id);
  if (e.tier === 'CORE' && !a.length) fail(`${e.id}: CORE without an anchor (would be cut)`);
  if (e.tier === 'EXTENDED' && !c.length && !f.length) fail(`${e.id}: EXTENDED without an inbound card/formula link (would be cut)`);
  if (e.tier === 'EXTENDED' && a.length) note(`${e.id}: EXTENDED but anchored by ${a.map((x) => x.id).join(', ')} (consider CORE)`);
}

// ── paths
for (const p of paths) {
  for (const s of p.steps) if (s !== 'matrix' && !isTarget(s)) fail(`${p.id}: step ${s} unknown`);
  if (p.external) needRes(p.external, p.id);
}

// ── crosswalk coverage
const expectBook = ['0.1–0.2', '0.3', '0.4', '0.5', '1.1–1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '2.5', '3.1–3.3', '3.4–3.5', '4.1', '4.2', '4.3–4.4', '4.5', '5.1–5.5', '6.x', '7.1', '7.2', '7.3', '7.4', '7.5', 'App. A', 'App. B'];
const have = new Set(crosswalk.map((x) => x.book));
for (const b of expectBook) if (!have.has(b)) fail(`crosswalk misses book section ${b}`);
for (const x of crosswalk) {
  for (const e of x.entries) if (!isTarget(e)) fail(`crosswalk ${x.book}: ${e} unknown`);
  for (const l of [...x.li, ...x.ie]) if (l.rid) needRes(l.rid, `crosswalk ${x.book}`);
  if (!x.entries.length && !x.out && !x.note) fail(`crosswalk ${x.book}: no entries and no OUT reason`);
  if (x.note && /title not captured/.test(x.topic)) note(`crosswalk ${x.book}: unmapped (title unknown)`);
}

// ── orphans: every entry reachable from an anchor or from Module E (card/formula)
for (const e of entries) {
  if (!anchorsFor(e.id).length && !cardsFor(e.id).length && !formulasFor(e.id).length) fail(`${e.id}: orphan`);
}

// ── derive
const modOf = (id) => (ids.get(id) === 'entry' ? id[0] : 'e');
const usedBy = {};
const use = (rid, by) => { (usedBy[rid] ||= new Set()).add(by); };
entries.forEach((e) => e.resources.forEach((r) => use(r, e.id)));
cards.forEach((c) => { c.numbers.forEach((n) => n.src && use(n.src, c.id)); c.resources.forEach((r) => use(r, c.id)); });
formulas.forEach((f) => f.sources.forEach((r) => use(r, f.id)));
paths.forEach((p) => p.external && use(p.external, p.id));
const out = {
  version: src.VERSION,
  modules,
  entries: entries.map((e) => ({
    ...e,
    anchors: anchorsFor(e.id).map((a) => a.id),
    seenIn: [...new Set(anchorsFor(e.id).map((a) => a.loc))],
    cards: cardsFor(e.id).map((c) => c.id),
    formulas: formulasFor(e.id).map((f) => f.id),
    paths: paths.filter((p) => p.steps.includes(e.id)).map((p) => p.id),
  })),
  resources: resources.map((r) => ({
    ...r,
    usedBy: [...(usedBy[r.id] || [])],
    modules: [...new Set([...(usedBy[r.id] || [])].filter((x) => !/^p-/.test(x)).map(modOf))].sort(),
  })),
  formulas: formulas.map((f) => ({ ...f, anchors: anchorsFor(f.id).map((a) => a.id), cards: cards.filter((c) => c.formulas.includes(f.id)).map((c) => c.id) })),
  cards: cards.map((c) => ({ ...c, anchors: anchorsFor(c.id).map((a) => a.id) })),
  paths, anchors, crosswalk,
  gapAudit: src.gapAudit, researchLimits: src.researchLimits, openQuestions: src.openQuestions, additionalSources: src.additionalSources,
};
writeFileSync(join(root, 'data/appendix.json'), JSON.stringify(out));

// ── report
const core = entries.filter((e) => e.tier === 'CORE').length;
console.log(`entries ${entries.length} (CORE ${core}, EXTENDED ${entries.length - core}) · cards ${cards.length} · formulas ${formulas.length} · paths ${paths.length} · anchors ${anchors.length} (placed ${tsxAnchors.size}) · resources ${resources.length} · crosswalk ${crosswalk.length}`);
console.log(`JSON ${(JSON.stringify(out).length / 1024).toFixed(1)} KB`);
if (warn.length) { console.log(`\nWARN (${warn.length}):`); warn.forEach((w) => console.log('  · ' + w)); }
if (hard.length) { console.log(`\nHARD FAIL (${hard.length}):`); hard.forEach((h) => console.log('  ✕ ' + h)); process.exit(1); }
console.log('\nlint: OK');
