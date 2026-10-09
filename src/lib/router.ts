import { useEffect, useState } from 'react';
import type { ModuleId } from './types';

// Hash routes (§19): #appendix · #appendix/{module} · #appendix/{module}/{id} · #appendix/paths[/p-N]
// #appendix/registry · #appendix/crosswalk · #appendix/e/explorer · #appendix/e/matrix
// The artifact viewer only forwards plain hash tokens from outside links, so the same routes also
// accept dots (#appendix.b.b-kv-cache) and a bare id (#b-kv-cache).
export type AppxPage = 'home' | 'module' | 'item' | 'paths' | 'registry' | 'crosswalk' | 'explorer' | 'notfound';
export type Route =
  | { view: 'main'; target: string }
  | { view: 'appendix'; page: AppxPage; module?: ModuleId; id?: string; focus?: string };

const MODS = ['a', 'b', 'c', 'd', 'e'];
const ITEM_RE = /^([a-d]-[a-z0-9-]+|e-\d{2}|f-\d{2})$/;

export function parseHash(hash: string): Route {
  let s = hash.replace(/^#/, '');
  try { s = decodeURIComponent(s); } catch { /* keep raw */ }
  if (!s) return { view: 'main', target: '' };
  if (ITEM_RE.test(s)) return { view: 'appendix', page: 'item', module: (/^[a-d]-/.test(s) ? s[0] : 'e') as ModuleId, id: s };
  if (/^p-\d$/.test(s)) return { view: 'appendix', page: 'paths', id: s, focus: s };
  const parts = s.split(/[/.]/).filter(Boolean);
  if (parts[0] !== 'appendix') return { view: 'main', target: s };
  const [, a, b] = parts;
  if (!a) return { view: 'appendix', page: 'home' };
  if (a === 'paths') return { view: 'appendix', page: 'paths', id: b, focus: b };
  if (a === 'registry') return { view: 'appendix', page: 'registry' };
  if (a === 'crosswalk') return { view: 'appendix', page: 'crosswalk' };
  if (MODS.includes(a)) {
    const module = a as ModuleId;
    if (!b) return { view: 'appendix', page: 'module', module };
    if (module === 'e' && b === 'explorer') return { view: 'appendix', page: 'explorer', module };
    if (module === 'e' && b === 'matrix') return { view: 'appendix', page: 'module', module, focus: 'e-matrix' };
    if (ITEM_RE.test(b)) return { view: 'appendix', page: 'item', module, id: b };
  }
  return { view: 'appendix', page: 'notfound', id: s };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(hash: string) {
  const h = hash.startsWith('#') ? hash : `#${hash}`;
  if (window.location.hash === h) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = h;
}
