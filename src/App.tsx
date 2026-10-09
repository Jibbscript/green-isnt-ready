import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRoute, go, type Route } from './lib/router';
import { AppxProvider, useAppx } from './lib/appx';
import { DATA_OK, D } from './lib/data';
import { readLS, writeLS } from './lib/storage';
import { IconBack, IconBook, IconMark, IconMenu, IconMoon, IconSun, IconSystem } from './components/Icon';
import { S1Hero, ReadingGuide } from './sections/S1Hero';
import { S2Why } from './sections/S2Why';
import { S3Model } from './sections/S3Model';
import { S4Walkthrough } from './sections/S4Walkthrough';
import { S5Verdict } from './sections/S5Verdict';
import { S6Fit } from './sections/S6Fit';
import { S7Limits } from './sections/S7Limits';
import { AppendixView } from './appendix/AppendixView';

export const SECTIONS = [
  { id: 's1', label: 'S1', title: 'Green Isn’t Ready' },
  { id: 's2', label: 'S2', title: 'Faults Hide Until There’s Load' },
  { id: 's3', label: 'S3', title: 'One Tree, Three Tiers' },
  { id: 's4', label: 'S4', title: 'Certify a 16-Node Cluster' },
  { id: 's5', label: 'S5', title: 'What PASSED Actually Means' },
  { id: 's6', label: 'S6', title: 'Where NVCRE Is the Critical Tool' },
  { id: 's7', label: 'S7', title: 'Limits, Then Check Yourself' },
];

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'nvcre-theme';

export function revealAnchor(anchorId: string) {
  const el = document.querySelector<HTMLElement>(`[data-anchor="${anchorId}"]`);
  if (!el) return;
  let d = el.closest('details');
  while (d) { d.open = true; d = d.parentElement?.closest('details') ?? null; }
  el.scrollIntoView({ block: 'center' });
  el.focus({ preventScroll: true });
  el.classList.add('is-flash');
  window.setTimeout(() => el.classList.remove('is-flash'), 1700);
}

export default function App() {
  return (
    <AppxProvider>
      <Shell />
    </AppxProvider>
  );
}

function Shell() {
  const route = useRoute();
  const { returnTo } = useAppx();
  const [theme, setTheme] = useState<Theme>(() => {
    const t = readLS(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  });
  const lastMainHash = useRef<string>(window.location.hash.startsWith('#appendix') ? '' : window.location.hash);
  const prev = useRef<Route | null>(null);

  useEffect(() => {
    try { window.history.scrollRestoration = 'manual'; } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const r = document.documentElement;
    if (theme === 'system') r.removeAttribute('data-theme');
    else r.setAttribute('data-theme', theme);
    writeLS(THEME_KEY, theme === 'system' ? null : theme);
  }, [theme]);

  useLayoutEffect(() => {
    const p = prev.current;
    prev.current = route;
    if (route.view === 'appendix') {
      if (!p || p.view === 'main') {
        if (returnTo.current.scrollY === null) returnTo.current.scrollY = window.scrollY;
        if (!returnTo.current.el && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) returnTo.current.el = document.activeElement;
      }
      requestAnimationFrame(() => {
        const focusEl = route.focus ? document.getElementById(route.focus) : null;
        if (focusEl) focusEl.scrollIntoView({ block: 'start' });
        else window.scrollTo(0, 0);
        document.getElementById('appx-h1')?.focus({ preventScroll: true });
      });
      return;
    }
    lastMainHash.current = window.location.hash;
    const fromAppendix = p?.view === 'appendix';
    const rt = returnTo.current;
    requestAnimationFrame(() => {
      if (fromAppendix && rt.anchor) {
        revealAnchor(rt.anchor);
      } else if (fromAppendix && (rt.el || rt.scrollY !== null)) {
        if (rt.scrollY !== null) window.scrollTo(0, rt.scrollY);
        rt.el?.focus({ preventScroll: true });
      } else if (route.target) {
        document.getElementById(route.target)?.scrollIntoView({ block: 'start' });
      }
      if (fromAppendix) returnTo.current = { el: null, anchor: null, scrollY: null };
    });
  }, [route, returnTo]);

  const inAppx = route.view === 'appendix';
  const cycleTheme = () => setTheme((t) => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'));
  const themeLabel = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark';

  return (
    <div className="page">
      <a href={inAppx ? '#appendix-main' : '#main'} className="skip" onClick={(e) => { e.preventDefault(); document.getElementById(inAppx ? 'appx-h1' : 's1-title')?.focus(); }}>Skip to content</a>
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="#s1" onClick={(e) => { if (inAppx) { e.preventDefault(); go(lastMainHash.current || '#s1'); } }}>
            <IconMark className="brand__mark" width={22} height={22} />
            <span className="brand__name">NVCRE</span>
            <span className="brand__title">Green Isn’t Ready</span>
          </a>
          {!inAppx ? <SectionsMenu /> : null}
          {inAppx ? (
            <button type="button" className="btn" onClick={() => go(lastMainHash.current || '#')}><IconBack />Article</button>
          ) : (
            <a className="btn" href="#appendix"><IconBook />Fundamentals</a>
          )}
          <button type="button" className="btn btn--quiet" onClick={cycleTheme} aria-label={`Theme: ${themeLabel}. Switch theme`} title={`Theme: ${themeLabel}`}>
            {theme === 'system' ? <IconSystem /> : theme === 'light' ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </header>

      {!DATA_OK ? <p className="callout callout--warn" role="alert" style={{ marginTop: '1rem' }}>Appendix data failed to load; refresh anchors are disabled.</p> : null}

      <div className="shell" hidden={inAppx}>
        <Rail />
        <main id="main" className="article">
          <S1Hero />
          <ReadingGuide />
          <S2Why />
          <S3Model />
          <S4Walkthrough />
          <S5Verdict />
          <S6Fit />
          <S7Limits />
          <footer className="foot">
            <p>Based on NVCRE v0.6.0 docs/repo, researched 2026-10-08. Fundamentals Appendix data version {D.version}.</p>
            <p>Independent study guide. Not affiliated with or endorsed by NVIDIA. Numbers carry their source; anything marked “Illustrative” is a model, not NVCRE output.</p>
          </footer>
        </main>
      </div>
      {inAppx ? <AppendixView route={route} /> : null}
    </div>
  );
}

function useScrollSpy(ids: string[]) {
  const [current, setCurrent] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!('IntersectionObserver' in window) || !els.length) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setCurrent(vis[0].target.id);
    }, { rootMargin: '-20% 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return current;
}

const SECTION_IDS = SECTIONS.map((s) => s.id);
function Rail() {
  const current = useScrollSpy(SECTION_IDS);
  return (
    <nav className="rail" aria-label="Sections">
      <ol>
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={current === s.id ? 'true' : undefined}>
              <span className="rail__id">{s.label}</span><span>{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="rail__foot">
        <a className="btn" href="#appendix"><IconBook />Fundamentals</a>
        <p className="small muted">Dotted terms open a refresher.</p>
      </div>
    </nav>
  );
}

function SectionsMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details className="menu" ref={ref} style={{ position: 'relative' }}>
      <summary className="btn" style={{ listStyle: 'none' }} aria-label="Sections">
        <IconMenu /><span className="menu__label">Sections</span>
      </summary>
      <nav aria-label="Sections" className="menu__panel">
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => { if (ref.current) ref.current.open = false; }}>
                <span className="rail__id">{s.label}</span><span>{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
