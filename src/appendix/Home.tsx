import { useId, useMemo, useState } from 'react';
import { D, anchorById, entriesByModule } from '../lib/data';
import type { ModuleId } from '../lib/types';
import { useAppx } from '../lib/appx';
import { Drawer } from '../components/ui';
import { IconCheck, IconSearch, ModuleIcon } from '../components/Icon';
import { TierBadge, ModChip, CoverageChip } from './bits';

interface Item { id: string; title: string; snippet: string; module: ModuleId; tier?: string; kind: 'entry' | 'card' | 'formula'; t: string; hay: string }
interface Hit extends Item { score: number }

function useIndex(): Item[] {
  return useMemo(() => {
    const items: Item[] = [];
    for (const e of D.entries) {
      const terms = e.anchors.map((a) => anchorById.get(a)?.term ?? '');
      items.push({ id: e.id, title: e.title, snippet: e.refresher, module: e.module, tier: e.tier, kind: 'entry', t: e.title.toLowerCase(), hay: [e.id, e.title, e.refresher, ...e.aliases, ...terms].join(' ').toLowerCase() });
    }
    for (const c of D.cards) items.push({ id: c.id, title: `${c.id.toUpperCase()} · ${c.title}`, snippet: c.why, module: 'e', kind: 'card', t: c.title.toLowerCase(), hay: [c.id, c.title, c.why, c.nvcre, ...c.levers].join(' ').toLowerCase() });
    for (const f of D.formulas) items.push({ id: f.id, title: `${f.id} · ${f.title}`, snippet: f.expr, module: 'e', kind: 'formula', t: f.title.toLowerCase(), hay: [f.id, f.title, f.expr, f.assumptions].join(' ').toLowerCase() });
    return items;
  }, []);
}

export function Home() {
  const uid = useId();
  const { visited } = useAppx();
  const index = useIndex();
  const [q, setQ] = useState('');
  const [mods, setMods] = useState<Set<ModuleId>>(new Set());
  const [tiers, setTiers] = useState<Set<string>>(new Set());
  const active = q.trim() || mods.size || tiers.size;
  const toggle = <T,>(set: Set<T>, v: T, fn: (s: Set<T>) => void) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); fn(n); };

  const hits: Hit[] = useMemo(() => {
    if (!active) return [];
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    return index
      .filter((x) => (!mods.size || mods.has(x.module)) && (!tiers.size || (x.tier && tiers.has(x.tier))))
      .map((x) => ({ ...x, score: toks.length ? (toks.every((t) => x.hay.includes(t)) ? (toks.some((t) => x.t.includes(t)) ? 2 : 1) : 0) : 1 }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [active, q, mods, tiers, index]);

  return (
    <>
      <header className="entry" style={{ maxWidth: '64rem' }}>
        <p className="eyebrow"><span className="eyebrow__id">Refresh</span><span>Fundamentals Appendix · data {D.version}</span></p>
        <h1 className="h1" id="appx-h1" tabIndex={-1}>Fundamentals Appendix</h1>
        <p className="lead" style={{ maxWidth: '72ch' }}>Refresh any fundamental the article leans on, without losing your place. Every dotted term in the article opens one of these
          entries; Module E ties the fundamentals back to what an NVCRE check can and cannot see.</p>
        <p className="small muted">{D.entries.length} entries · {D.cards.length} tradeoff cards · {D.formulas.length} formula cards · {D.paths.length} paths ·
          visited {[...visited].filter((v) => D.entries.some((e) => e.id === v)).length} of {D.entries.length} on this device</p>
      </header>

      <section aria-labelledby={`${uid}-s`} style={{ display: 'grid', gap: '0.75rem' }}>
        <h2 className="h4" id={`${uid}-s`}>Search and filter</h2>
        <div className="search">
          <label htmlFor={`${uid}-q`} className="sr-only">Search the appendix</label>
          <IconSearch style={{ width: '1.1rem', height: '1.1rem', flex: 'none', color: 'var(--muted)' }} />
          <input id={`${uid}-q`} className="input" type="search" placeholder="busBW, KV cache, cordon, MFU…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips" role="group" aria-label="Filter by domain">
          <span className="chips__l">Domain</span>
          {D.modules.map((m) => (
            <button key={m.id} type="button" className="chip" data-mod={m.id} aria-pressed={mods.has(m.id)} onClick={() => toggle(mods, m.id, setMods)}>
              <ModuleIcon name={m.icon} />{m.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Filter by tier">
          <span className="chips__l">Tier</span>
          {['CORE', 'EXTENDED'].map((t) => <button key={t} type="button" className="chip" aria-pressed={tiers.has(t)} onClick={() => toggle(tiers, t, setTiers)}>{t}</button>)}
          <span className="small muted">CORE = anchored in the article · EXTENDED = needed for Module E</span>
        </div>
        <p className="small" aria-live="polite">{active ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : ''}</p>
        {active ? (
          <div className="elist">
            {hits.slice(0, 80).map((h) => (
              <a key={h.id} className="eitem" href={h.kind === 'entry' ? `#appendix/${h.module}/${h.id}` : `#appendix/e/${h.id}`} data-mod={h.module}>
                <span className="eitem__t">{h.title}</span>
                <span className="eitem__r">
                  <ModChip m={h.module} />
                  {h.tier ? <TierBadge t={h.tier} /> : null}
                  {h.kind === 'card' ? <CoverageChip c={D.cards.find((c) => c.id === h.id)!.coverage} /> : null}
                  {visited.has(h.id) ? <span className="visited"><IconCheck />visited</span> : null}
                </span>
                <span className="eitem__s mono" style={{ fontFamily: h.kind === 'formula' ? undefined : 'var(--font-ui)' }}>{h.snippet}</span>
              </a>
            ))}
            {!hits.length ? <p className="small" style={{ padding: '0.75rem 0' }}>Nothing matches. Try a shorter term, or clear the filters.</p> : null}
          </div>
        ) : null}
      </section>

      {!active ? (
        <section aria-labelledby={`${uid}-m`} style={{ display: 'grid', gap: '0.75rem' }}>
          <h2 className="h4" id={`${uid}-m`}>Modules</h2>
          <div className="mods">
            {D.modules.map((m) => {
              const n = m.id === 'e' ? D.cards.length : entriesByModule(m.id).length;
              return (
                <a key={m.id} className="mod-card" href={`#appendix/${m.id}`} data-mod={m.id}>
                  <span className="mod-chip"><ModuleIcon name={m.icon} />{m.id.toUpperCase()} · {m.label}</span>
                  <span className="mod-card__t">{m.title}</span>
                  <span className="mod-card__m">{m.intro.split(/(?<=\.)\s/)[0]}</span>
                  <span className="small muted">{m.id === 'e' ? `${n} cards · ${D.formulas.length} formulas · matrix · explorer` : `${n} entries`}</span>
                </a>
              );
            })}
            <a className="mod-card" href="#appendix/paths">
              <span className="mod-chip" style={{ color: 'var(--muted)' }}>Paths</span>
              <span className="mod-card__t">Refresh paths</span>
              <span className="mod-card__m">Six short, ordered routes: collectives, serving, kernels, reliability, architecture, design review.</span>
            </a>
          </div>
          <div className="btn-row">
            <a className="btn" href="#appendix/e/explorer">Constraint explorer</a>
            <a className="btn" href="#appendix/e/matrix">Tradeoff matrix</a>
            <a className="btn" href="#appendix/registry">Resource registry</a>
            <a className="btn" href="#appendix/crosswalk">Book & site crosswalk</a>
          </div>
        </section>
      ) : null}

      <div>
        <Drawer kicker="How it works" title="Depth model, tiers and budgets">
          <ol className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'decimal' }}>
            <li><b>60-second skim:</b> the hero.</li>
            <li><b>~10-minute path:</b> S2–S7 and the core interactives.</li>
            <li><b>Opt-in deep dives:</b> the <em>Go deeper</em> drawers.</li>
            <li><b>Refresh:</b> dotted term → bottom sheet → appendix entry → external links.</li>
          </ol>
          <ul className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li>CORE entries are anchored to a term in the article. EXTENDED entries are not named in the article but are linked from a Module E card or formula. An entry that is neither would be cut at build time.</li>
            <li>Budgets: refresher ≤50 words, “why it matters here” ≤30, module intros 3–5 sentences, card fields ≤40 words, ≤4 links per entry with exactly one free “start here”.</li>
            <li>The two inference sites are linked as interactive refreshers, not rebuilt. learn-inference.com is preferred for concepts and inferenceengineering.tech for calculators; both are secondary, vendor-adjacent sources.</li>
          </ul>
          <pre className="ia" tabIndex={0} aria-label="Appendix structure">{`#appendix
├── a/  AI Infra & HPC        (a-*)
├── b/  Inference Engineering (b-*)
├── c/  GPU Kernel Eng.       (c-*)
├── d/  Distributed Systems   (d-*)
├── e/  Constraints & Tradeoffs  ← hub
│     ├── cards e-01..e-15
│     ├── matrix
│     ├── formulas f-01..f-15
│     └── explorer
├── paths/     (p-1..p-6)
├── registry/  (all resources)
└── crosswalk/ (book/site ↔ entries)`}</pre>
        </Drawer>
        <Drawer kicker="Research limits" title="What the source research could not verify">
          <ul className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            {D.researchLimits.map((r) => <li key={r}>{r}</li>)}
          </ul>
          <h3 className="h4">Open questions and gaps</h3>
          <ul className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            {D.openQuestions.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </Drawer>
      </div>
    </>
  );
}
