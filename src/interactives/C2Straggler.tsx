import { useEffect, useId, useRef, useState } from 'react';
import { Illustrative, Stage } from '../components/ui';

/** C2 — synchronous step explainer. ILLUSTRATIVE: step_time = max(rank_times), healthy rank = 1.0. */
export function C2Straggler() {
  const [ranks, setRanks] = useState(16);
  const [pct, setPct] = useState(8);
  const [nSlow, setNSlow] = useState(1);
  const uid = useId();
  const slowSet = new Set(Array.from({ length: Math.min(nSlow, ranks) }, (_, i) => (3 + i * Math.floor(ranks / 4)) % ranks));
  const times = Array.from({ length: ranks }, (_, i) => (slowSet.has(i) ? 1 + pct / 100 : 1));
  const step = Math.max(...times);
  const thr = 1 / step;
  const idle = (step - 1) / step;

  const wrap = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(360);
  useEffect(() => {
    const el = wrap.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(([e]) => setCw(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = Math.max(260, Math.min(cw, 960)), H = 112, top = 22, gap = ranks > 40 ? 1 : 2;
  const bw = W / ranks - gap;
  const pid = `${uid}-hatch`.replace(/:/g, '');

  return (
    <Stage id="C2" title="Everyone waits for the slowest rank" badge={<Illustrative />}>
      <p className="small">In a synchronous step, everyone waits for the slowest rank.</p>
      <div className="stage__grid stage__grid--2">
        <div className="panel">
          <div className="field">
            <label htmlFor={`${uid}-r`}>Ranks: <span className="num mono">{ranks}</span></label>
            <input id={`${uid}-r`} type="range" min={8} max={64} step={8} value={ranks} onChange={(e) => setRanks(+e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-p`}>Slow rank is <span className="num mono">{pct}%</span> slower</label>
            <input id={`${uid}-p`} type="range" min={0} max={30} step={1} value={pct} onChange={(e) => setPct(+e.target.value)} aria-valuetext={`${pct} percent slower`} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-n`}>Slow ranks: <span className="num mono">{nSlow}</span></label>
            <input id={`${uid}-n`} type="range" min={0} max={4} step={1} value={nSlow} onChange={(e) => setNSlow(+e.target.value)} />
          </div>
        </div>
        <div className="panel" aria-live="polite">
          <div className="bigstat">
            <span className="bigstat__v">{(thr * 100).toFixed(1)}%</span>
            <span className="bigstat__k">of healthy throughput delivered</span>
          </div>
          <p className="small">
            Step time is <span className="num mono">{step.toFixed(2)}×</span> healthy. Healthy ranks sit idle for{' '}
            <span className="num mono">{(idle * 100).toFixed(1)}%</span> of every step.
            {nSlow >= 2 && pct > 0 ? ' Extra slow ranks cost nothing more: the step already waits for one maximum.' : ''}
            {nSlow === 0 || pct === 0 ? ' With no straggler, nobody waits.' : ''}
          </p>
        </div>
      </div>
      <div ref={wrap} style={{ minWidth: 0 }}>
      <svg className="bars" width={W} height={H + top + 22} viewBox={`0 0 ${W} ${H + top + 22}`} role="img" aria-label={`${ranks} ranks, ${nSlow} slow by ${pct}%: the cluster delivers ${(thr * 100).toFixed(1)}% of healthy throughput`}>
        <defs>
          <pattern id={pid} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="var(--warn-bg)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--warn)" strokeWidth="2" />
          </pattern>
        </defs>
        <text x="0" y="12" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">step time = max(rank times)</text>
        {times.map((t, i) => {
          const x = i * (bw + gap) + gap / 2;
          const hTotal = H;
          const hWork = (t / step) * hTotal;
          const slow = t > 1;
          return (
            <g key={i}>
              <rect x={x} y={top} width={bw} height={hTotal - hWork} fill={`url(#${pid})`} />
              <rect x={x} y={top + hTotal - hWork} width={bw} height={hWork} fill={slow ? 'var(--fail)' : 'var(--border-strong)'} />
            </g>
          );
        })}
        <line x1="0" x2={W} y1={top} y2={top} stroke="var(--fg)" strokeDasharray="4 3" strokeWidth="1" />
        <text x="0" y={top + H + 16} fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">rank 0</text>
        <text x={W} y={top + H + 16} fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)" textAnchor="end">rank {ranks - 1}</text>
      </svg>
      </div>
      <div className="chips" aria-hidden>
        <span className="small"><svg width="12" height="12" style={{ display: 'inline', verticalAlign: '-1px' }}><rect width="12" height="12" fill="var(--border-strong)" /></svg> working</span>
        <span className="small"><svg width="12" height="12" style={{ display: 'inline', verticalAlign: '-1px' }}><rect width="12" height="12" fill="var(--fail)" /></svg> slow rank</span>
        <span className="small"><svg width="12" height="12" style={{ display: 'inline', verticalAlign: '-1px' }}><rect width="12" height="12" fill="var(--warn-bg)" stroke="var(--warn)" /></svg> waiting</span>
      </div>
      <p className="stage__note">Default: one rank 8% slow, the shape the NVIDIA blog’s figure describes. A model, not measured data.</p>
    </Stage>
  );
}
