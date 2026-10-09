import type { ReactNode } from 'react';
import { IconCheck, IconChevron, IconClock, IconHatch, IconWarn, IconX, IconDash } from './Icon';

export type StatusKind = 'pass' | 'warn' | 'fail' | 'info' | 'illus' | 'na';
const ICON: Record<StatusKind, (p: { className?: string }) => ReactNode> = {
  pass: (p) => <IconCheck {...p} />,
  warn: (p) => <IconWarn {...p} />,
  fail: (p) => <IconX {...p} />,
  info: (p) => <IconClock {...p} />,
  illus: (p) => <IconHatch {...p} />,
  na: (p) => <IconDash {...p} />,
};

/** Status = icon + word + colour (never colour alone, spec §6). */
export function Status({ kind, children, pill = false }: { kind: StatusKind; children: ReactNode; pill?: boolean }) {
  const cls = kind === 'na' ? 'st st--illus' : `st st--${kind}`;
  return <span className={pill ? `${cls} pill` : cls}>{ICON[kind]({})}{children}</span>;
}

export const RESULT_KIND: Record<string, StatusKind> = { PASSED: 'pass', INCOMPLETE: 'warn', FAILED: 'fail', RUNNING: 'info' };

export function Illustrative({ children = 'Illustrative model — not NVCRE output' }: { children?: ReactNode }) {
  return <span className="badge badge--illus"><IconHatch />{children}</span>;
}
export function RealRules({ children = 'Real rules · real data' }: { children?: ReactNode }) {
  return <span className="badge badge--real"><IconCheck />{children}</span>;
}

export function Drawer({ kicker = 'Go deeper', title, children, wide = false, id }: { kicker?: string; title: string; children: ReactNode; wide?: boolean; id?: string }) {
  return (
    <details className={wide ? 'drawer drawer--wide' : 'drawer'} id={id}>
      <summary>
        <IconChevron className="drawer__chev" />
        <span className="drawer__kicker">{kicker}</span>
        <span>{title}</span>
      </summary>
      <div className="drawer__body">{children}</div>
    </details>
  );
}

/** Wide tables scroll inside their own focusable region (page body never scrolls sideways). */
export function TableWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="table-wrap" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

export function Stage({ id, title, badge, children, labelledBy }: { id: string; title: string; badge?: ReactNode; children: ReactNode; labelledBy?: string }) {
  const hid = labelledBy ?? `${id.toLowerCase()}-title`;
  return (
    <figure className="stage" data-comp={id} aria-labelledby={hid}>
      <div className="stage__head">
        <span className="stage__id" aria-hidden>{id}</span>
        <h3 className="stage__title" id={hid}><span className="sr-only">{id}: </span>{title}</h3>
        {badge}
      </div>
      {children}
    </figure>
  );
}

export function SecHead({ id, label, title, lead }: { id: string; label: string; title: string; lead?: ReactNode }) {
  return (
    <header className="prose" style={{ gap: '0.75rem' }}>
      <p className="eyebrow"><span className="eyebrow__id">{id}</span><span>{label}</span></p>
      <h2 className="h2" id={`${id.toLowerCase()}-title`} tabIndex={-1}>{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </header>
  );
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a>;
}

/** A sourced number: renders inline, keeps provenance in data-src (spec §8). */
export function N({ src, children }: { src: string; children: ReactNode }) {
  return <span className="num" data-src={src}>{children}</span>;
}
