import type { AppendixData, Anchor, Card, Entry, Formula, ModuleId, ModuleMeta, Path, Resource, TargetKind } from './types';

// The appendix ships as inline JSON (§13): <script type="application/json" id="appendix-data">.
function load(): AppendixData | null {
  try {
    const el = document.getElementById('appendix-data');
    if (!el?.textContent) return null;
    return JSON.parse(el.textContent) as AppendixData;
  } catch {
    return null;
  }
}

const raw = load();
export const DATA_OK = raw !== null;
export const D: AppendixData = raw ?? {
  version: '—', modules: [], entries: [], resources: [], formulas: [], cards: [], paths: [], anchors: [], crosswalk: [],
  gapAudit: { added: [], addedNote: '', sitesMiss: [], sitesMissNote: '', outOfScope: [], credibility: [], siteRule: '' },
  researchLimits: [], openQuestions: [], additionalSources: [],
};

const idx = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x] as const));
export const entryById = idx<Entry>(D.entries);
export const cardById = idx<Card>(D.cards);
export const formulaById = idx<Formula>(D.formulas);
export const resById = idx<Resource>(D.resources);
export const anchorById = idx<Anchor>(D.anchors);
export const pathById = idx<Path>(D.paths);
export const moduleById = new Map<ModuleId, ModuleMeta>(D.modules.map((m) => [m.id, m]));
export const entriesByModule = (m: ModuleId) => D.entries.filter((e) => e.module === m);

export function kindOf(id: string): TargetKind | null {
  if (entryById.has(id)) return 'entry';
  if (cardById.has(id)) return 'card';
  if (formulaById.has(id)) return 'formula';
  return null;
}
export function moduleOf(id: string): ModuleId {
  const e = entryById.get(id);
  return e ? e.module : 'e';
}
export function titleOf(id: string): string {
  if (id === 'matrix') return 'Tradeoff matrix';
  const e = entryById.get(id);
  if (e) return e.title;
  const c = cardById.get(id);
  if (c) return `${c.id.toUpperCase()} · ${c.title}`;
  const f = formulaById.get(id);
  if (f) return `${f.id} · ${f.title}`;
  const p = pathById.get(id);
  if (p) return p.title;
  return id;
}
export function hrefOf(id: string): string {
  if (id === 'matrix') return '#appendix/e/matrix';
  if (pathById.has(id)) return `#appendix/paths/${id}`;
  const k = kindOf(id);
  if (k === 'entry') return `#appendix/${moduleOf(id)}/${id}`;
  if (k) return `#appendix/e/${id}`;
  return '#appendix';
}

export const words = (s: string) => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
export const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
export const isVerified = (r: Resource) => r.status === 'verified' || r.status === 'main-spec' || r.status === 'link-checked';
