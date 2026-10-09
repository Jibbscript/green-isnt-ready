import { anchorById, hrefOf, kindOf, moduleOf, titleOf } from '../lib/data';
import { useAppx } from '../lib/appx';
import { IconArrowUR, IconCheck } from '../components/Icon';
import { ModIcon } from './bits';

/** Chip link to an entry, card, formula, path or the matrix. */
export function ItemChip({ id, short = false }: { id: string; short?: boolean }) {
  const { visited } = useAppx();
  const m = id === 'matrix' || /^p-/.test(id) ? 'e' : kindOf(id) ? moduleOf(id) : 'e';
  return (
    <a className="chip chip--link chip--sm" href={hrefOf(id)} data-mod={m}>
      <ModIcon m={m} />
      <span>{short ? id : titleOf(id)}</span>
      {visited.has(id) ? <span className="visited"><IconCheck /><span className="sr-only">visited</span></span> : null}
    </a>
  );
}

/** "Seen in S4 · C3": one chip per article location; jumps back to the anchor in the article. */
export function SeenIn({ anchors }: { anchors: string[] }) {
  const { jumpToAnchor } = useAppx();
  const byLoc = new Map<string, string>();
  for (const a of anchors) {
    const an = anchorById.get(a);
    if (an && !byLoc.has(an.loc)) byLoc.set(an.loc, a);
  }
  if (!byLoc.size) return null;
  return (
    <div className="seen">
      <span>Seen in</span>
      {[...byLoc.entries()].map(([loc, a]) => (
        <button key={loc} type="button" className="chip" onClick={() => jumpToAnchor(a)} aria-label={`Seen in ${loc}: jump to “${anchorById.get(a)?.term}” in the article`}>
          {loc}<IconArrowUR />
        </button>
      ))}
    </div>
  );
}
