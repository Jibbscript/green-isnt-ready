import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { anchorById, cardById, entryById, formulaById, hrefOf, kindOf, moduleById, resById, titleOf, hostOf, isVerified } from './data';
import { go } from './router';
import { readJSON, writeLS } from './storage';
import { IconArrowUR, IconOpen, IconStar, IconX, ModuleIcon } from '../components/Icon';
import { CoverageChip } from '../appendix/bits';

interface Ctx {
  openAnchor: (anchorId: string, trigger: HTMLElement | null) => void;
  openTarget: (id: string, trigger: HTMLElement | null) => void;
  visited: Set<string>;
  markVisited: (id: string) => void;
  /** element (or anchor id) to return to when the reader comes back from the appendix */
  returnTo: React.MutableRefObject<{ el: HTMLElement | null; anchor: string | null; scrollY: number | null }>;
  jumpToAnchor: (anchorId: string) => void;
}
const AppxCtx = createContext<Ctx | null>(null);
export const useAppx = () => {
  const c = useContext(AppxCtx);
  if (!c) throw new Error('AppxProvider missing');
  return c;
};

const LS_VISITED = 'nvcre-appendix-visited';

export function AppxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; anchor: string | null; targets: string[]; active: string }>({ open: false, anchor: null, targets: [], active: '' });
  const [visited, setVisited] = useState<Set<string>>(() => new Set(readJSON<string[]>(LS_VISITED, [])));
  const trigger = useRef<HTMLElement | null>(null);
  const navigating = useRef(false);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const returnTo = useRef<{ el: HTMLElement | null; anchor: string | null; scrollY: number | null }>({ el: null, anchor: null, scrollY: null });

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      writeLS(LS_VISITED, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const openAnchor = useCallback((anchorId: string, el: HTMLElement | null) => {
    const a = anchorById.get(anchorId);
    if (!a) return;
    trigger.current = el;
    navigating.current = false;
    setState({ open: true, anchor: anchorId, targets: a.entries, active: a.entries[0] });
    markVisited(a.entries[0]);
  }, [markVisited]);

  const openTarget = useCallback((id: string, el: HTMLElement | null) => {
    if (!kindOf(id)) return;
    trigger.current = el;
    navigating.current = false;
    setState({ open: true, anchor: null, targets: [id], active: id });
    markVisited(id);
  }, [markVisited]);

  const close = () => setState((s) => ({ ...s, open: false }));

  const openInAppendix = (id: string) => {
    navigating.current = true;
    returnTo.current = { el: trigger.current, anchor: null, scrollY: window.scrollY };
    close();
    go(hrefOf(id));
  };

  const jumpToAnchor = useCallback((anchorId: string) => {
    returnTo.current = { el: null, anchor: anchorId, scrollY: null };
    const a = anchorById.get(anchorId);
    const sec = a ? ({ S1: 's1', S2: 's2', S3: 's3', S4: 's4', S5: 's5', S6: 's6', S7: 's7', C3: 's4', 'C4/§7': 's5' } as Record<string, string>)[a.loc] ?? 's1' : 's1';
    go(`#${sec}`);
  }, []);

  const value = useMemo(() => ({ openAnchor, openTarget, visited, markVisited, returnTo, jumpToAnchor }), [openAnchor, openTarget, visited, markVisited, jumpToAnchor]);
  const anchor = state.anchor ? anchorById.get(state.anchor) : null;

  return (
    <AppxCtx.Provider value={value}>
      {children}
      <Dialog.Root open={state.open} onOpenChange={(o) => { if (!o) close(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="sheet-overlay" />
          <Dialog.Content
            className="sheet"
            aria-modal="true"
            aria-describedby="sheet-refresher"
            onOpenAutoFocus={(e) => { e.preventDefault(); heading.current?.focus(); }}
            onCloseAutoFocus={(e) => { e.preventDefault(); if (!navigating.current) trigger.current?.focus({ preventScroll: true }); }}
          >
            <div className="sheet__grab" aria-hidden />
            {state.active ? (
              <SheetBody
                id={state.active}
                term={anchor?.term ?? null}
                alternates={state.targets}
                headingRef={heading}
                onPick={(id) => { setState((s) => ({ ...s, active: id })); markVisited(id); requestAnimationFrame(() => heading.current?.focus()); }}
                onOpen={openInAppendix}
              />
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AppxCtx.Provider>
  );
}

function SheetBody({ id, term, alternates, headingRef, onPick, onOpen }: {
  id: string; term: string | null; alternates: string[];
  headingRef: React.MutableRefObject<HTMLHeadingElement | null>;
  onPick: (id: string) => void; onOpen: (id: string) => void;
}) {
  const kind = kindOf(id);
  const e = entryById.get(id);
  const c = cardById.get(id);
  const f = formulaById.get(id);
  const mod = e ? moduleById.get(e.module) : moduleById.get('e');
  const start = e ? resById.get(e.startHere) : null;
  return (
    <>
      <div className="sheet__top">
        <div style={{ display: 'grid', gap: '0.375rem', minWidth: 0 }}>
          <p className="sheet__term">Refresh{term ? ` · ${term}` : ''}</p>
          <div className="entry__meta" data-mod={mod?.id}>
            {mod ? <span className="mod-chip"><ModuleIcon name={mod.icon} />{mod.label}</span> : null}
            {e ? <span className={e.tier === 'CORE' ? 'tier tier--core' : 'tier'}>{e.tier}</span> : null}
            {c ? <CoverageChip c={c.coverage} /> : null}
          </div>
          <Dialog.Title asChild>
            <h2 className="sheet__title" tabIndex={-1} ref={headingRef}>{titleOf(id)}</h2>
          </Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <button type="button" className="btn btn--quiet" aria-label="Close refresher"><IconX /></button>
        </Dialog.Close>
      </div>

      {kind === 'entry' && e ? (
        <>
          <p id="sheet-refresher">{e.refresher}</p>
          <div className="sheet__why"><b>Why it matters here</b>{e.whyHere}</div>
          {start ? (
            <p className="small">
              <span className="rcard__flag rcard__flag--start" style={{ marginRight: '0.5rem' }}><IconStar style={{ width: '0.9em', height: '0.9em', display: 'inline', verticalAlign: '-0.1em' }} /> Start here</span>
              <a href={start.url} target="_blank" rel="noopener noreferrer">{start.title}<span className="sr-only"> (opens in a new tab)</span></a>
              <span className="muted"> · {hostOf(start.url)}{isVerified(start) ? '' : ' · unverified link'}</span>
            </p>
          ) : null}
        </>
      ) : null}
      {kind === 'card' && c ? (
        <>
          <p id="sheet-refresher">{c.why}</p>
          <div className="sheet__why"><b>NVCRE mapping</b>{c.nvcre}</div>
        </>
      ) : null}
      {kind === 'formula' && f ? (
        <>
          <pre className="formula__x" id="sheet-refresher">{f.expr}</pre>
          <p className="small muted">{f.assumptions}</p>
        </>
      ) : null}

      {alternates.length > 1 ? (
        <div className="sheet__alt">
          <span className="sheet__alt-l">Also linked here:</span>
          {alternates.filter((x) => x !== id).map((x) => (
            <button key={x} type="button" className="chip chip--sm" onClick={() => onPick(x)} data-mod={kindOf(x) === 'entry' ? entryById.get(x)?.module : 'e'}>
              <IconArrowUR />{titleOf(x)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={() => onOpen(id)}><IconOpen />Open in appendix</button>
        <Dialog.Close asChild><button type="button" className="btn">Back to reading</button></Dialog.Close>
      </div>
    </>
  );
}

/** Inline refresh anchor (§19): dotted underline + ↗ glyph, opens the bottom sheet. */
export function R({ a, children }: { a: string; children: ReactNode }) {
  const { openAnchor } = useAppx();
  return (
    <button type="button" className="ref-anchor" aria-haspopup="dialog" data-anchor={a} onClick={(ev) => openAnchor(a, ev.currentTarget)}>
      {children}
      <IconArrowUR className="ref-anchor__glyph" />
      <span className="sr-only"> (open refresher)</span>
    </button>
  );
}

/** Direct link to one appendix entry/card/formula (used by C5 explanations). */
export function Fund({ id, children }: { id: string; children?: ReactNode }) {
  const { openTarget } = useAppx();
  return (
    <button type="button" className="ref-anchor" aria-haspopup="dialog" data-fund={id} onClick={(ev) => openTarget(id, ev.currentTarget)}>
      {children ?? titleOf(id)}
      <IconArrowUR className="ref-anchor__glyph" />
      <span className="sr-only"> (open refresher)</span>
    </button>
  );
}
