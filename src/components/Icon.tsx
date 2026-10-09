import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false, ...p });

export const IconCheck = (p: P) => <svg {...base(p)}><path d="M3.2 8.4l3 3 6.6-7" /></svg>;
export const IconX = (p: P) => <svg {...base(p)}><path d="M4 4l8 8M12 4l-8 8" /></svg>;
export const IconWarn = (p: P) => <svg {...base(p)}><path d="M8 2.2l6.3 11.3H1.7z" /><path d="M8 6.5v3.3M8 11.8v.1" /></svg>;
export const IconClock = (p: P) => <svg {...base(p)}><circle cx="8" cy="8" r="6" /><path d="M8 4.6V8l2.4 1.6" /></svg>;
export const IconDash = (p: P) => <svg {...base(p)}><path d="M4 8h8" /></svg>;
export const IconHatch = (p: P) => <svg {...base(p)}><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M2.5 9.5l7-7M6.5 13.5l7-7M2.5 13.5l11-11" strokeWidth={1.1} /></svg>;
export const IconArrowUR = (p: P) => <svg {...base(p)} strokeWidth={2}><path d="M5 11l6-6M6 5h5v5" /></svg>;
export const IconChevron = (p: P) => <svg {...base(p)}><path d="M6 3.5L10.5 8 6 12.5" /></svg>;
export const IconChevronL = (p: P) => <svg {...base(p)}><path d="M10 3.5L5.5 8l4.5 4.5" /></svg>;
export const IconStar = (p: P) => <svg {...base(p)}><path d="M8 1.9l1.8 3.8 4.1.5-3 2.9.8 4.1L8 11.2l-3.7 2 .8-4.1-3-2.9 4.1-.5z" /></svg>;
export const IconLock = (p: P) => <svg {...base(p)}><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 015 0v2" /></svg>;
export const IconOpen = (p: P) => <svg {...base(p)}><path d="M9 2.5h4.5V7M13.5 2.5L7.5 8.5" /><path d="M12 9.5v3a1 1 0 01-1 1H3.5a1 1 0 01-1-1V5a1 1 0 011-1h3" /></svg>;
export const IconSun = (p: P) => <svg {...base(p)}><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></svg>;
export const IconMoon = (p: P) => <svg {...base(p)}><path d="M13.2 9.6A5.6 5.6 0 016.4 2.8a5.6 5.6 0 106.8 6.8z" /></svg>;
export const IconSystem = (p: P) => <svg {...base(p)}><rect x="1.8" y="2.8" width="12.4" height="8.4" rx="1.4" /><path d="M5.5 14h5M8 11.2V14" /></svg>;
export const IconSearch = (p: P) => <svg {...base(p)}><circle cx="7" cy="7" r="4.4" /><path d="M10.3 10.3l3.4 3.4" /></svg>;
export const IconBack = (p: P) => <svg {...base(p)}><path d="M7 3.5L2.5 8 7 12.5M2.8 8h10.7" /></svg>;
export const IconBook = (p: P) => <svg {...base(p)}><path d="M2.5 3.2h4a1.6 1.6 0 011.5 1.5v8.6a1.3 1.3 0 00-1.3-1.2H2.5zM13.5 3.2h-4A1.6 1.6 0 008 4.7v8.6a1.3 1.3 0 011.3-1.2h4.2z" /></svg>;
export const IconPlay = (p: P) => <svg {...base(p)}><path d="M4.5 3.2v9.6L12.5 8z" /></svg>;
export const IconPause = (p: P) => <svg {...base(p)}><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>;
export const IconStep = (p: P) => <svg {...base(p)}><path d="M3.5 3.5v9l6-4.5zM12 3.5v9" /></svg>;
export const IconReset = (p: P) => <svg {...base(p)}><path d="M2.8 7.5A5.2 5.2 0 1 1 4.4 12" /><path d="M2.5 3.5v4h4" /></svg>;
export const IconBolt = (p: P) => <svg {...base(p)}><path d="M9 1.8L3.5 9h4L7 14.2 12.5 7h-4z" /></svg>;
export const IconMenu = (p: P) => <svg {...base(p)}><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" /></svg>;
export const IconRack = (p: P) => <svg {...base(p)}><rect x="3" y="1.8" width="10" height="12.4" rx="1.2" /><path d="M5 5h6M5 8h6M5 11h6" /></svg>;
export const IconStream = (p: P) => <svg {...base(p)}><path d="M2 4.5h7.5M2 8h10M2 11.5h6" /><path d="M11.5 3l2 1.5-2 1.5M12.5 9.9l1.5 1.6-1.5 1.5" /></svg>;
export const IconChip = (p: P) => <svg {...base(p)}><rect x="4" y="4" width="8" height="8" rx="1" /><path d="M6 1.8V4M10 1.8V4M6 12v2.2M10 12v2.2M1.8 6H4M1.8 10H4M12 6h2.2M12 10h2.2" /></svg>;
export const IconNodes = (p: P) => <svg {...base(p)}><circle cx="4" cy="4" r="1.8" /><circle cx="12" cy="4" r="1.8" /><circle cx="8" cy="12" r="1.8" /><path d="M5.7 4.2h4.6M4.9 5.5l2.2 4.9M11.1 5.5l-2.2 4.9" /></svg>;
export const IconScale = (p: P) => <svg {...base(p)}><path d="M8 2v11.5M4.5 13.5h7M3 4.5h10M8 3.2v1.3" /><path d="M3 4.5L1.2 9a2 2 0 003.6 0zM13 4.5L11.2 9a2 2 0 003.6 0z" /></svg>;
export const IconMark = (p: P) => (
  <svg viewBox="0 0 20 20" aria-hidden focusable={false} {...p}>
    {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => (
      <rect key={`${r}${c}`} x={1 + c * 4.6} y={1 + r * 4.6} width="3.6" height="3.6" rx="0.8"
        fill={r === 1 && c === 3 ? 'var(--fail)' : 'var(--accent)'} opacity={r === 1 && c === 3 ? 1 : 0.85} />
    )))}
  </svg>
);

export const ModuleIcon = ({ name, ...p }: { name: string } & P) => {
  switch (name) {
    case 'rack': return <IconRack {...p} />;
    case 'stream': return <IconStream {...p} />;
    case 'chip': return <IconChip {...p} />;
    case 'nodes': return <IconNodes {...p} />;
    default: return <IconScale {...p} />;
  }
};
