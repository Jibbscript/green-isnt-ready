import { useEffect } from 'react';
import { D, cardById, entryById, formulaById, moduleById, resById, entriesByModule, hrefOf, titleOf } from '../lib/data';
import { useAppx } from '../lib/appx';
import { IconChevron, IconChevronL, ModuleIcon } from '../components/Icon';
import { ModChip, TierBadge, ResourceCard, CoverageChip } from './bits';
import { ItemChip, SeenIn } from './links';

function Pager({ prev, next }: { prev?: string; next?: string }) {
  return (
    <nav className="pager" aria-label="Previous and next">
      {prev ? <a className="btn" href={hrefOf(prev)}><IconChevronL /><span>{titleOf(prev)}</span></a> : <span />}
      {next ? <a className="btn" href={hrefOf(next)}><span>{titleOf(next)}</span><IconChevron /></a> : <span />}
    </nav>
  );
}

function ChipRow({ label, ids }: { label: string; ids: string[] }) {
  if (!ids.length) return null;
  return (
    <div style={{ display: 'grid', gap: '0.375rem' }}>
      <span className="chips__l">{label}</span>
      <div className="chips">{ids.map((id) => <ItemChip key={id} id={id} />)}</div>
    </div>
  );
}

export function EntryPage({ id }: { id: string }) {
  const { markVisited } = useAppx();
  const e = entryById.get(id)!;
  useEffect(() => { markVisited(id); }, [id, markVisited]);
  const mod = moduleById.get(e.module)!;
  const list = entriesByModule(e.module);
  const i = list.findIndex((x) => x.id === id);
  const res = e.resources.map((r) => resById.get(r)!).filter(Boolean);
  return (
    <article className="entry" data-mod={e.module}>
      <div className="crumbs"><a href="#appendix">Fundamentals</a><span aria-hidden>›</span><a href={`#appendix/${e.module}`}>{mod.title}</a></div>
      <div className="entry__meta"><ModChip m={e.module} /><TierBadge t={e.tier} /><span className="small muted mono">{e.id}</span></div>
      <h1 className="h2" id="appx-h1" tabIndex={-1}>{e.title}</h1>
      <p className="entry__refresher">{e.refresher}</p>
      <div className="sheet__why"><b>Why it matters here</b>{e.whyHere}</div>
      <SeenIn anchors={e.anchors} />
      <section aria-label="Resources" style={{ display: 'grid', gap: '0.625rem' }}>
        <h2 className="h4">Go further ({res.length} link{res.length === 1 ? '' : 's'})</h2>
        <div className="rlist">{res.map((r) => <ResourceCard key={r.id} r={r} start={r.id === e.startHere} />)}</div>
      </section>
      <ChipRow label="Before this" ids={e.prereqs} />
      <ChipRow label="Related" ids={e.related} />
      <ChipRow label="Tradeoff cards that use this" ids={e.cards} />
      <ChipRow label="Formulas" ids={e.formulas} />
      <ChipRow label="On these paths" ids={e.paths} />
      {e.flags.length ? <p className="small muted">Build note: {e.flags.join(' · ')}</p> : null}
      <Pager prev={list[i - 1]?.id} next={list[i + 1]?.id} />
      <p className="small"><a href={`#appendix/${e.module}`}><ModuleIcon name={mod.icon} style={{ width: '1em', height: '1em', display: 'inline', verticalAlign: '-0.1em' }} /> All {mod.label} entries</a></p>
    </article>
  );
}

export function CardPage({ id }: { id: string }) {
  const { markVisited } = useAppx();
  const c = cardById.get(id)!;
  useEffect(() => { markVisited(id); }, [id, markVisited]);
  const i = D.cards.findIndex((x) => x.id === id);
  return (
    <article className="entry" data-mod="e">
      <div className="crumbs"><a href="#appendix">Fundamentals</a><span aria-hidden>›</span><a href="#appendix/e">Constraints & Tradeoffs</a></div>
      <div className="entry__meta"><ModChip m="e" /><span className="tcard__id">{c.id.toUpperCase()}</span><CoverageChip c={c.coverage} /></div>
      <h1 className="h2" id="appx-h1" tabIndex={-1}>{c.title}</h1>
      <p className="entry__refresher">{c.why}</p>
      <dl className="field-list">
        {c.numbers.length ? (
          <div><dt>Dated numbers</dt><dd><ul style={{ display: 'grid', gap: '0.5rem' }}>
            {c.numbers.map((n) => {
              const r = n.src ? resById.get(n.src) : null;
              return (
                <li key={n.v} className="small">
                  <span className="mono num">{n.v}</span>{' '}
                  <span className="muted">· {n.date}{r ? <> · <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a></> : null}{n.note ? ` · ${n.note}` : ''}</span>
                </li>
              );
            })}
          </ul></dd></div>
        ) : null}
        <div><dt>Levers</dt><dd className="taglist">{c.levers.map((l) => <span key={l} className="tag">{l}</span>)}</dd></div>
        <div><dt>You gain</dt><dd>{c.gains}</dd></div>
        <div><dt>You pay</dt><dd>{c.costs}</dd></div>
        {c.signatures.length ? <div><dt>Failure signatures</dt><dd className="taglist">{c.signatures.map((s) => <span key={s} className="tag">{s}</span>)}</dd></div> : null}
        {(c.extra ?? []).map((x) => <div key={x.label}><dt>{x.label}</dt><dd>{x.text}</dd></div>)}
        <div><dt>NVCRE mapping</dt><dd><div className="sheet__why" style={{ marginTop: '0.25rem' }}>{c.nvcre}</div></dd></div>
      </dl>
      <SeenIn anchors={c.anchors} />
      <ChipRow label="Entries behind this card" ids={c.links} />
      <ChipRow label="Formulas" ids={c.formulas} />
      {c.resources.length ? <div className="rlist">{c.resources.map((r) => <ResourceCard key={r} r={resById.get(r)!} />)}</div> : null}
      <Pager prev={D.cards[i - 1]?.id} next={D.cards[i + 1]?.id} />
      <p className="small"><a href="#appendix/e/matrix">Back to the tradeoff matrix</a></p>
    </article>
  );
}

export function FormulaPage({ id }: { id: string }) {
  const { markVisited } = useAppx();
  const f = formulaById.get(id)!;
  useEffect(() => { markVisited(id); }, [id, markVisited]);
  const i = D.formulas.findIndex((x) => x.id === id);
  const vars = Object.entries(f.vars);
  return (
    <article className="entry" data-mod="e">
      <div className="crumbs"><a href="#appendix">Fundamentals</a><span aria-hidden>›</span><a href="#appendix/e">Constraints & Tradeoffs</a><span aria-hidden>›</span><span>Formulas</span></div>
      <div className="entry__meta"><ModChip m="e" /><span className="tcard__id">{f.id}</span></div>
      <h1 className="h2" id="appx-h1" tabIndex={-1}>{f.title}</h1>
      <pre className="formula__x formula__x--lg">{f.expr}</pre>
      {vars.length ? (
        <dl className="kv">{vars.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}</dl>
      ) : null}
      <dl className="field-list">
        <div><dt>Assumptions and caveats</dt><dd>{f.assumptions}</dd></div>
        <div><dt>Source</dt><dd>{f.sources.length
          ? <div className="rlist" style={{ marginTop: '0.25rem' }}>{f.sources.map((r) => <ResourceCard key={r} r={resById.get(r)!} />)}</div>
          : <span>{f.sourceNote}</span>}</dd></div>
      </dl>
      <SeenIn anchors={f.anchors} />
      <ChipRow label="Entries" ids={f.entries} />
      <ChipRow label="Used in cards" ids={f.cards} />
      <ChipRow label="Paths" ids={D.paths.filter((p) => p.steps.includes(f.id)).map((p) => p.id)} />
      <Pager prev={D.formulas[i - 1]?.id} next={D.formulas[i + 1]?.id} />
      <p className="small"><a href="#appendix/e/explorer">Try f-02, f-09, f-13 and f-15 in the constraint explorer</a></p>
    </article>
  );
}

