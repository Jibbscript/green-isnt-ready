import { D, entriesByModule, moduleById, anchorById } from '../lib/data';
import type { ModuleId } from '../lib/types';
import { useAppx } from '../lib/appx';
import { IconCheck, ModuleIcon } from '../components/Icon';
import { TableWrap } from '../components/ui';
import { TierBadge, CoverageChip } from './bits';

function SelfCheck({ prompts }: { prompts: string[] }) {
  return (
    <section aria-label="Self-check" className="panel" style={{ maxWidth: '72ch' }}>
      <h2 className="h4">Self-check</h2>
      <ul className="small" style={{ display: 'grid', gap: '0.375rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
        {prompts.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <p className="small muted">No scoring. If an answer doesn’t come easily, open the matching entry.</p>
    </section>
  );
}

export function ModulePage({ module }: { module: ModuleId }) {
  const m = moduleById.get(module);
  if (!m) return null;
  return (
    <>
      <header className="entry" data-mod={m.id} style={{ maxWidth: '64rem' }}>
        <div className="crumbs"><a href="#appendix">Fundamentals</a><span aria-hidden>›</span><span>Module {m.id.toUpperCase()}</span></div>
        <span className="mod-chip" style={{ justifySelf: 'start' }}><ModuleIcon name={m.icon} />{m.id.toUpperCase()} · {m.label}</span>
        <h1 className="h1" id="appx-h1" tabIndex={-1}>{m.title}</h1>
        <p className="lead" style={{ maxWidth: '72ch' }}>{m.intro}</p>
      </header>
      {module === 'e' ? <EHub /> : <EntryList module={module} />}
      <SelfCheck prompts={m.selfCheck} />
    </>
  );
}

function EntryList({ module }: { module: ModuleId }) {
  const { visited } = useAppx();
  const list = entriesByModule(module);
  return (
    <section aria-label="Entries" className="elist">
      {list.map((e) => (
        <a key={e.id} className="eitem" href={`#appendix/${module}/${e.id}`} data-mod={module}>
          <span className="eitem__t">{e.title}</span>
          <span className="eitem__r">
            <TierBadge t={e.tier} />
            {e.seenIn.length ? <span className="small muted mono">{e.seenIn.join(' · ')}</span> : null}
            {visited.has(e.id) ? <span className="visited"><IconCheck />visited</span> : null}
          </span>
          <span className="eitem__s">{e.refresher}</span>
        </a>
      ))}
    </section>
  );
}

function EHub() {
  const { visited } = useAppx();
  return (
    <>
      <div className="btn-row">
        <a className="btn btn--primary" href="#appendix/e/explorer">Open the constraint explorer</a>
        <a className="btn" href="#e-formulas" onClick={(e) => { e.preventDefault(); document.getElementById('e-formulas')?.scrollIntoView({ block: 'start' }); }}>Jump to formula cards</a>
      </div>

      <section id="e-matrix" aria-labelledby="e-matrix-h" style={{ display: 'grid', gap: '0.75rem', scrollMarginTop: 'calc(var(--topbar-h) + 1rem)' }}>
        <h2 className="h3" id="e-matrix-h">Tradeoff matrix</h2>
        <TableWrap label="Tradeoff matrix table (scrolls sideways)">
          <table className="tbl tbl--wide">
            <thead><tr><th scope="col">Card</th><th scope="col">Main lever</th><th scope="col">Gain</th><th scope="col">Cost</th><th scope="col">NVCRE check</th></tr></thead>
            <tbody>{D.cards.map((c) => (
              <tr key={c.id}>
                <th scope="row"><a href={`#appendix/e/${c.id}`}>{c.id.toUpperCase()} {c.title}</a></th>
                <td>{c.matrix.lever}</td><td>{c.matrix.gain}</td><td>{c.matrix.cost}</td>
                <td><span style={{ display: 'grid', gap: '0.25rem', justifyItems: 'start' }}><CoverageChip c={c.coverage} /><span>{c.matrix.check}</span></span></td>
              </tr>
            ))}</tbody>
          </table>
        </TableWrap>
      </section>

      <section aria-labelledby="e-cards-h" style={{ display: 'grid', gap: '0.75rem' }}>
        <h2 className="h3" id="e-cards-h">Constraint cards</h2>
        <div className="grid-cards">
          {D.cards.map((c) => (
            <a key={c.id} className="tcard" href={`#appendix/e/${c.id}`}>
              <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="tcard__id">{c.id.toUpperCase()}</span>
                <CoverageChip c={c.coverage} />
                {visited.has(c.id) ? <span className="visited"><IconCheck />visited</span> : null}
              </span>
              <span className="tcard__t">{c.title}</span>
              <span className="tcard__w">{c.why}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="e-formulas" aria-labelledby="e-formulas-h" style={{ display: 'grid', gap: '0.75rem', scrollMarginTop: 'calc(var(--topbar-h) + 1rem)' }}>
        <h2 className="h3" id="e-formulas-h">Formula cards</h2>
        <p className="small muted">First-order relations, with the assumptions that break them. This is the cheat sheet.</p>
        <div className="grid-cards">
          {D.formulas.map((f) => (
            <a key={f.id} className="formula" href={`#appendix/e/${f.id}`}>
              <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span className="tcard__id">{f.id}</span><span className="tcard__t">{f.title}</span>
                {f.anchors.length ? <span className="small muted mono">{[...new Set(f.anchors.map((a) => anchorById.get(a)?.loc))].join(' · ')}</span> : null}
              </span>
              <span className="formula__x">{f.expr}</span>
              <span className="small muted">{f.assumptions}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
