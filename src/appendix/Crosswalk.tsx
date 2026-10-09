import { D, resById, isVerified } from '../lib/data';
import type { XLink } from '../lib/types';
import { TableWrap } from '../components/ui';
import { ItemChip } from './links';

const LI_BASE = 'https://learn-inference.com/chapters';

function Links({ xs, site }: { xs: XLink[]; site: 'li' | 'ie' }) {
  if (!xs.length) return <span className="muted">—</span>;
  return (
    <span style={{ display: 'grid', gap: '0.25rem' }}>
      {xs.map((x, i) => {
        if (x.rid) {
          const r = resById.get(x.rid);
          if (!r) return null;
          return <span key={i}><a href={r.url} target="_blank" rel="noopener noreferrer">{x.text ?? r.url.replace(/^https:\/\/(www\.)?[^/]+/, '')}</a>{isVerified(r) ? '' : <span className="muted"> (listed)</span>}</span>;
        }
        if (x.path && site === 'li') return x.ok
          ? <span key={i}><a className="mono" href={`${LI_BASE}${x.path}`} target="_blank" rel="noopener noreferrer">{x.path}</a></span>
          : <span key={i} className="mono">{x.path} <span className="muted">(not opened)</span></span>;
        return <span key={i} className="muted">{x.text ?? x.path}</span>;
      })}
    </span>
  );
}

export function CrosswalkPage() {
  const g = D.gapAudit;
  return (
    <>
      <header className="entry">
        <div className="crumbs"><a href="#appendix">Fundamentals</a></div>
        <h1 className="h1" id="appx-h1" tabIndex={-1}>Book & site crosswalk</h1>
        <p className="lead">How each section of Baseten’s <em>Inference Engineering</em> book maps to the two companion sites and to appendix entries, and which sections are out of scope.</p>
      </header>
      <TableWrap label="Crosswalk">
        <table className="tbl tbl--wide" style={{ minWidth: '56rem' }}>
          <thead><tr><th scope="col">Book §</th><th scope="col">learn-inference.com</th><th scope="col">inferenceengineering.tech</th><th scope="col">Entries</th><th scope="col">Module · tier</th></tr></thead>
          <tbody>{D.crosswalk.map((x) => (
            <tr key={x.book}>
              <th scope="row"><span className="mono">{x.book}</span><br /><span className="muted" style={{ fontWeight: 400 }}>{x.topic}</span></th>
              <td><Links xs={x.li} site="li" /></td>
              <td><Links xs={x.ie} site="ie" /></td>
              <td>{x.entries.length ? <span className="chips">{x.entries.map((e) => <ItemChip key={e} id={e} short />)}</span> : null}
                {x.out ? <span><b>OUT:</b> {x.out}</span> : null}{x.note ? <span className="muted"> {x.note}</span> : null}</td>
              <td className="mono">{x.module} · {x.tier}</td>
            </tr>
          ))}</tbody>
        </table>
      </TableWrap>
      <div className="grid-cards">
        <section className="panel"><h2 className="h4">Gaps found and filled</h2>
          <div className="chips">{g.added.map((e) => <ItemChip key={e} id={e} />)}</div><p className="small">{g.addedNote}</p></section>
        <section className="panel"><h2 className="h4">What the sites don’t cover</h2>
          <ul className="small" style={{ display: 'grid', gap: '0.25rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>{g.sitesMiss.map((s) => <li key={s}>{s}</li>)}</ul>
          <p className="small">{g.sitesMissNote}</p></section>
        <section className="panel"><h2 className="h4">Out of scope</h2>
          <ul className="small" style={{ display: 'grid', gap: '0.25rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>{g.outOfScope.map((s) => <li key={s}>{s}</li>)}</ul></section>
        <section className="panel"><h2 className="h4">Credibility notes</h2>
          <ul className="small" style={{ display: 'grid', gap: '0.25rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>{g.credibility.map((s) => <li key={s}>{s}</li>)}</ul></section>
      </div>
    </>
  );
}
