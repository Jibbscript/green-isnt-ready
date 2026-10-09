import { D, resById, titleOf, hrefOf, kindOf, moduleOf } from '../lib/data';
import { useAppx } from '../lib/appx';
import { IconCheck } from '../components/Icon';
import { ModIcon } from './bits';

export function PathsPage({ focus }: { focus?: string }) {
  const { visited } = useAppx();
  return (
    <>
      <header className="entry">
        <div className="crumbs"><a href="#appendix">Fundamentals</a></div>
        <h1 className="h1" id="appx-h1" tabIndex={-1}>Refresh paths</h1>
        <p className="lead">Short, ordered routes through the appendix. The numbers are the order to read in.</p>
      </header>
      <div className="grid-cards">
        {D.paths.map((p) => {
          const ext = p.external ? resById.get(p.external) : null;
          const done = p.steps.filter((s) => visited.has(s)).length;
          return (
            <section key={p.id} id={p.id} className="panel" aria-labelledby={`${p.id}-h`} style={focus === p.id ? { borderColor: 'var(--fg)', borderWidth: 2 } : undefined}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span className="tcard__id">{p.id}</span>
                <h2 className="h4" id={`${p.id}-h`} style={{ marginRight: 'auto' }}>{p.title}</h2>
                <span className="small muted">~{p.minutes} min · {done}/{p.steps.length} visited</span>
              </div>
              <ol className="steps">
                {p.steps.map((s) => {
                  const m = s === 'matrix' ? 'e' : kindOf(s) ? moduleOf(s) : 'e';
                  return (
                    <li key={s}>
                      <a href={hrefOf(s)} data-mod={m}>
                        <ModIcon m={m} /><span>{titleOf(s)}</span>
                        {visited.has(s) ? <span className="visited"><IconCheck /><span className="sr-only">visited</span></span> : null}
                      </a>
                    </li>
                  );
                })}
              </ol>
              <p className="small">{p.relation}{ext ? <> <a href={ext.url} target="_blank" rel="noopener noreferrer">{ext.title}</a></> : null}</p>
            </section>
          );
        })}
      </div>
    </>
  );
}
