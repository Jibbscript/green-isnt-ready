import { useMemo, useState } from 'react';
import { D, isVerified } from '../lib/data';
import { ModuleIcon } from '../components/Icon';
import { ResourceCard } from './bits';
import { ItemChip } from './links';

const TYPES = ['paper', 'official-doc', 'spec', 'course', 'book', 'blog', 'repo', 'interactive-refresher'];
const LEVELS = ['refresher', 'intermediate', 'deep'];
const ACCESS = ['free', 'registration', 'paywalled'];

export function RegistryPage() {
  const [mods, setMods] = useState<Set<string>>(new Set());
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [levels, setLevels] = useState<Set<string>>(new Set());
  const [access, setAccess] = useState<Set<string>>(new Set());
  const [unverified, setUnverified] = useState(false);
  const tog = (s: Set<string>, v: string, f: (x: Set<string>) => void) => { const n = new Set(s); if (n.has(v)) n.delete(v); else n.add(v); f(n); };
  const list = useMemo(() => D.resources.filter((r) =>
    (!mods.size || r.modules.some((m) => mods.has(m))) && (!types.size || types.has(r.type)) && (!levels.size || levels.has(r.level))
    && (!access.size || access.has(r.access)) && (!unverified || !isVerified(r))), [mods, types, levels, access, unverified]);
  const nUnv = D.resources.filter((r) => !isVerified(r)).length;
  const presentTypes = TYPES.filter((t) => D.resources.some((r) => r.type === t));
  return (
    <>
      <header className="entry">
        <div className="crumbs"><a href="#appendix">Fundamentals</a></div>
        <h1 className="h1" id="appx-h1" tabIndex={-1}>Resource registry</h1>
        <p className="lead">Every external link in the appendix, with what it is, how deep it goes and whether its URL was verified.</p>
        <p className="small muted">{D.resources.length} resources · {nUnv} not yet verified (marked; see open questions). {D.gapAudit.siteRule}</p>
      </header>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div className="chips" role="group" aria-label="Filter by domain">
          <span className="chips__l">Domain</span>
          {D.modules.map((m) => <button key={m.id} type="button" className="chip" data-mod={m.id} aria-pressed={mods.has(m.id)} onClick={() => tog(mods, m.id, setMods)}><ModuleIcon name={m.icon} />{m.label}</button>)}
        </div>
        <div className="chips" role="group" aria-label="Filter by type">
          <span className="chips__l">Type</span>
          {presentTypes.map((t) => <button key={t} type="button" className="chip" aria-pressed={types.has(t)} onClick={() => tog(types, t, setTypes)}>{t}</button>)}
        </div>
        <div className="chips" role="group" aria-label="Filter by level">
          <span className="chips__l">Level</span>
          {LEVELS.map((t) => <button key={t} type="button" className="chip" aria-pressed={levels.has(t)} onClick={() => tog(levels, t, setLevels)}>{t}</button>)}
        </div>
        <div className="chips" role="group" aria-label="Filter by access">
          <span className="chips__l">Access</span>
          {ACCESS.map((t) => <button key={t} type="button" className="chip" aria-pressed={access.has(t)} onClick={() => tog(access, t, setAccess)}>{t}</button>)}
          <button type="button" className="chip" aria-pressed={unverified} onClick={() => setUnverified((v) => !v)}>Only unverified</button>
        </div>
        <p className="small" aria-live="polite">{list.length} shown</p>
      </div>
      <div className="grid-cards">
        {list.map((r) => (
          <ResourceCard key={r.id} r={r} showUse useNode={r.usedBy.slice(0, 6).map((u) => <ItemChip key={u} id={u} short />)} />
        ))}
      </div>
      <section className="panel" aria-labelledby="addl-h" style={{ maxWidth: '72ch' }}>
        <h2 className="h4" id="addl-h">Additional sources (no direct links)</h2>
        <ul className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
          {D.additionalSources.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>
    </>
  );
}
