import type { Route } from '../lib/router';
import { D, kindOf } from '../lib/data';
import { ModuleIcon } from '../components/Icon';
import { Home } from './Home';
import { ModulePage } from './ModulePage';
import { EntryPage, CardPage, FormulaPage } from './ItemPages';
import { ExplorerPage } from './Explorer';
import { PathsPage } from './Paths';
import { RegistryPage } from './Registry';
import { CrosswalkPage } from './Crosswalk';

type R = Extract<Route, { view: 'appendix' }>;

export function AppendixView({ route }: { route: R }) {
  const cur = route.page === 'home' ? 'home'
    : route.page === 'paths' ? 'paths'
      : route.page === 'registry' ? 'registry'
        : route.page === 'crosswalk' ? 'crosswalk'
          : route.module ?? 'home';
  return (
    <main id="appendix-main" className="appx" aria-label="Fundamentals Appendix">
      <nav className="tabs" aria-label="Appendix sections">
        <a className="tab" href="#appendix" aria-current={cur === 'home' ? 'page' : undefined}>Overview</a>
        {D.modules.map((m) => (
          <a key={m.id} className="tab" href={`#appendix/${m.id}`} data-mod={m.id} aria-current={cur === m.id ? 'page' : undefined}>
            <ModuleIcon name={m.icon} />{m.id.toUpperCase()} · {m.label}
          </a>
        ))}
        <a className="tab" href="#appendix/paths" aria-current={cur === 'paths' ? 'page' : undefined}>Paths</a>
        <a className="tab" href="#appendix/registry" aria-current={cur === 'registry' ? 'page' : undefined}>Registry</a>
        <a className="tab" href="#appendix/crosswalk" aria-current={cur === 'crosswalk' ? 'page' : undefined}>Crosswalk</a>
      </nav>
      <Page route={route} />
    </main>
  );
}

function Page({ route }: { route: R }) {
  switch (route.page) {
    case 'home': return <Home />;
    case 'module': return <ModulePage module={route.module!} />;
    case 'explorer': return <ExplorerPage />;
    case 'paths': return <PathsPage focus={route.id} />;
    case 'registry': return <RegistryPage />;
    case 'crosswalk': return <CrosswalkPage />;
    case 'item': {
      const k = route.id ? kindOf(route.id) : null;
      if (k === 'entry') return <EntryPage id={route.id!} />;
      if (k === 'card') return <CardPage id={route.id!} />;
      if (k === 'formula') return <FormulaPage id={route.id!} />;
      return <NotFound raw={route.id ?? ''} />;
    }
    default: return <NotFound raw={route.id ?? ''} />;
  }
}

function NotFound({ raw }: { raw: string }) {
  return (
    <section className="entry">
      <h1 className="h2" id="appx-h1" tabIndex={-1}>No entry called “{raw}”</h1>
      <p>That link doesn’t match an appendix entry. Start from the <a href="#appendix">overview</a> or search there.</p>
    </section>
  );
}
