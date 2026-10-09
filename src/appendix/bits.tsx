import type { Coverage, Resource } from '../lib/types';
import { IconCheck, IconClock, IconDash, IconLock, IconOpen, IconStar, IconWarn, ModuleIcon } from '../components/Icon';
import { moduleById, hostOf, isVerified } from '../lib/data';

const COV: Record<Coverage, { label: string; icon: React.ReactNode }> = {
  yes: { label: 'NVCRE: covered', icon: <IconCheck /> },
  partial: { label: 'NVCRE: partial', icon: <IconWarn /> },
  proposed: { label: 'NVCRE: proposed', icon: <IconClock /> },
  no: { label: 'NVCRE: not covered', icon: <IconDash /> },
};
export function CoverageChip({ c }: { c: Coverage }) {
  return <span className={`cov cov--${c}`}>{COV[c].icon}{COV[c].label}</span>;
}

export function ModChip({ m }: { m: string }) {
  const mod = moduleById.get(m as never);
  if (!mod) return null;
  return <span data-mod={mod.id} style={{ display: 'inline-flex' }}><span className="mod-chip"><ModuleIcon name={mod.icon} />{mod.label}</span></span>;
}

export function TierBadge({ t }: { t: string }) {
  return <span className={t === 'CORE' ? 'tier tier--core' : 'tier'} title={t === 'CORE' ? 'Anchored to a term in the article' : 'Needed for Module E reasoning'}>{t}</span>;
}

export function AccessBadge({ a }: { a: Resource['access'] }) {
  if (a === 'free') return <span><IconOpen />Free</span>;
  if (a === 'registration') return <span><IconLock />Registration</span>;
  return <span><IconLock />Paywalled</span>;
}

const STATUS_LABEL: Record<Resource['status'], string> = {
  verified: 'verified',
  'main-spec': 'verified (design outline §10)',
  'link-checked': 'link-checked',
  listed: 'listed, page not opened',
  seed: 'seed URL, verify before ship',
  derived: 'derived URL, verify before ship',
  unverified: 'link not verified',
};

export function ResourceCard({ r, start = false, showUse = false, useNode }: { r: Resource; start?: boolean; showUse?: boolean; useNode?: React.ReactNode }) {
  const ok = isVerified(r);
  return (
    <article className={start ? 'rcard rcard--start' : 'rcard'}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
        {start ? <span className="rcard__flag rcard__flag--start"><IconStar style={{ width: '0.85em', height: '0.85em', display: 'inline', verticalAlign: '-0.1em' }} /> Start here</span> : null}
        {r.site ? <span className="rcard__flag">{r.site === 'learn-inference' ? 'learn-inference.com' : 'inferenceengineering.tech'}</span> : null}
        {r.vendor ? <span className="rcard__flag">vendor</span> : null}
        {!ok ? <span className="rcard__flag rcard__flag--unv">{STATUS_LABEL[r.status]}</span> : null}
      </div>
      <p className="rcard__t"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}<span className="sr-only"> (opens in a new tab)</span></a></p>
      <div className="rcard__meta">
        <span className="mono">{hostOf(r.url)}</span>
        <span>{r.org}{r.year ? ` · ${r.year}` : ''}</span>
        <span>{r.type}</span>
        <span>{r.level}{r.minutes ? ` · ~${r.minutes} min` : ''}</span>
        <AccessBadge a={r.access} />
        <span>{ok ? `verified ${r.verified ?? '2026-10-08'}` : 'not verified'}</span>
      </div>
      <p className="rcard__why">{r.why}</p>
      {r.provenance ? <p className="small muted">{r.provenance}</p> : null}
      {r.check ? <p className="small muted">Build check: {r.check}</p> : null}
      {showUse && useNode ? <div className="chips">{useNode}</div> : null}
    </article>
  );
}

export function ModIcon({ m }: { m: string }) {
  const mod = moduleById.get(m as never);
  return mod ? <ModuleIcon name={mod.icon} /> : null;
}
