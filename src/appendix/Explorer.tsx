import { useId, useMemo, useState } from 'react';
import { RUNS } from '../data/main';
import { Illustrative } from '../components/ui';
import { algBWFromBus, ringTimeSec, stragglerThroughput, clusterMTBF, LLAMA3_COMPONENT_MTBF_H } from '../lib/explorer';

const GPUS = ['H100', 'H200', 'B200', 'GB200', 'GB300'] as const;
type Gpu = typeof GPUS[number];
const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
const fmtT = (s: number) => (!Number.isFinite(s) ? '—' : s < 1 ? `${fmt(s * 1000, 1)} ms` : `${fmt(s, 2)} s`);
const fmtH = (h: number) => (!Number.isFinite(h) ? '—' : h >= 48 ? `${fmt(h, 0)} h (≈ ${fmt(h / 24, 1)} days)` : `${fmt(h, 2)} h`);

export function ExplorerPage() {
  const uid = useId().replace(/:/g, '');
  const [gpu, setGpu] = useState<Gpu>('GB200');
  const refs = RUNS.filter((r) => r.gpu === gpu);
  const [refId, setRefId] = useState<string>('aws-gb200-on');
  const ref = refs.find((r) => r.id === refId) ?? refs[0] ?? null;
  const [n, setN] = useState(16);
  const [size, setSize] = useState(16);
  const [bus, setBus] = useState<number | ''>(882.51);
  const [slow, setSlow] = useState(8);
  const [mtbf, setMtbf] = useState(Math.round(LLAMA3_COMPONENT_MTBF_H));

  const pickGpu = (g: Gpu) => {
    setGpu(g);
    const first = RUNS.find((r) => r.gpu === g);
    setRefId(first?.id ?? '');
    setBus(first ? first.allReduce : '');
  };
  const pickRef = (id: string) => {
    setRefId(id);
    const r = RUNS.find((x) => x.id === id);
    if (r) setBus(r.allReduce);
  };

  const out = useMemo(() => {
    const b = typeof bus === 'number' ? bus : NaN;
    const alg = algBWFromBus(b, n);
    const t = ringTimeSec(size, b, n);
    const vsRef = ref ? (b / ref.allReduce) * 100 : NaN;
    const thr = stragglerThroughput(slow);
    const cm = clusterMTBF(mtbf, n);
    return { b, alg, t, vsRef, thr, cm };
  }, [bus, n, size, ref, slow, mtbf]);

  return (
    <article className="entry" style={{ maxWidth: '60rem' }} data-mod="e">
      <div className="crumbs"><a href="#appendix">Fundamentals</a><span aria-hidden>›</span><a href="#appendix/e">Constraints & Tradeoffs</a></div>
      <div className="entry__meta"><Illustrative>First-order, illustrative</Illustrative></div>
      <h1 className="h2" id="appx-h1" tabIndex={-1}>Readiness constraint explorer</h1>
      <p className="entry__refresher">Start from busBW that NVCRE reported, then read what it implies for a collective, a straggler and the failure rate at your scale.
        The calculators on the inference sites stop at memory and latency; this one stays with the numbers a readiness run produces.</p>

      <div className="stage" style={{ maxWidth: '60rem' }}>
        <div className="stage__grid stage__grid--2">
          <div className="panel">
            <div className="field">
              <label htmlFor={`${uid}-g`}>GPU</label>
              <select id={`${uid}-g`} className="select" value={gpu} onChange={(e) => pickGpu(e.target.value as Gpu)}>
                {GPUS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${uid}-ref`}>Published reference run (§7, all-reduce at 16 GB)</label>
              <select id={`${uid}-ref`} className="select" value={ref?.id ?? ''} onChange={(e) => pickRef(e.target.value)} disabled={!refs.length}>
                {refs.length ? refs.map((r) => <option key={r.id} value={r.id}>{r.label} · {r.allReduce.toFixed(2)} GB/s</option>) : <option value="">No published NVCRE run for {gpu}</option>}
              </select>
              {!refs.length ? <span className="field__hint">Enter your own measured busBW below.</span> : null}
            </div>
            <div className="field__row" style={{ flexWrap: 'wrap', alignItems: 'end' }}>
              <div className="field" style={{ flex: '1 1 7rem' }}>
                <label htmlFor={`${uid}-bus`}>Observed busBW (GB/s)</label>
                <input id={`${uid}-bus`} className="input input--num" type="number" min={0} step={0.01} value={bus} onChange={(e) => setBus(e.target.value === '' ? '' : +e.target.value)} />
              </div>
              <div className="field" style={{ flex: '1 1 6rem' }}>
                <label htmlFor={`${uid}-n`}>Ranks n (GPUs)</label>
                <input id={`${uid}-n`} className="input input--num" type="number" min={2} max={200000} step={1} value={n} onChange={(e) => setN(Math.max(2, Math.round(+e.target.value || 2)))} />
              </div>
              <div className="field" style={{ flex: '1 1 6rem' }}>
                <label htmlFor={`${uid}-s`}>Message size S (GB)</label>
                <input id={`${uid}-s`} className="input input--num" type="number" min={0.001} step={1} value={size} onChange={(e) => setSize(Math.max(0, +e.target.value))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor={`${uid}-slow`}>One rank slower by <span className="mono num">{slow}%</span></label>
              <input id={`${uid}-slow`} type="range" min={0} max={30} step={1} value={slow} onChange={(e) => setSlow(+e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-m`}>Component (per-GPU) MTBF, hours</label>
              <input id={`${uid}-m`} className="input input--num" type="number" min={1} step={100} value={mtbf} onChange={(e) => setMtbf(Math.max(1, +e.target.value))} />
              <span className="field__hint">Default {Math.round(LLAMA3_COMPONENT_MTBF_H).toLocaleString('en-US')} h is implied by Llama 3 (419 unexpected interruptions in 54 days on 16,384 GPUs), charging every interruption to a GPU.</span>
            </div>
          </div>

          <div className="explorer-out" aria-live="polite">
            <div className="xout"><span className="xout__k">Algorithm bandwidth (f-02)</span><span className="xout__v">{fmt(out.alg)} GB/s</span><span className="xout__f">algBW = busBW · n / 2(n−1)</span></div>
            <div className="xout"><span className="xout__k">Ring all-reduce time for S (f-09)</span><span className="xout__v">{fmtT(out.t)}</span><span className="xout__f">t ≈ 2(n−1)/n · S/busBW, latency terms ignored</span></div>
            <div className="xout"><span className="xout__k">Observed vs published reference</span><span className="xout__v">{ref ? `${fmt(out.vsRef, 1)}%` : '—'}</span><span className="xout__f">{ref ? `${ref.label}. Context only: no thresholds ship by default.` : 'No published run to compare.'}</span></div>
            <div className="xout"><span className="xout__k">Straggler tax (f-13)</span><span className="xout__v">{fmt(out.thr * 100, 1)}% delivered</span><span className="xout__f">one rank {slow}% slow stretches every synchronous step to {fmt(1 + slow / 100, 2)}×</span></div>
            <div className="xout" style={{ gridColumn: '1 / -1' }}><span className="xout__k">Cluster MTBF at n GPUs (f-15)</span><span className="xout__v">{fmtH(out.cm)}</span><span className="xout__f">component MTBF / n; assumes independent, exponential failures. At 16,384 GPUs the default gives ≈ 3.1 h, the Llama 3 rate (by construction).</span></div>
          </div>
        </div>
      </div>
      <p className="small muted">Units: GB = 10⁹ bytes. Formulas: <a href="#appendix/e/f-02">f-02</a> · <a href="#appendix/e/f-09">f-09</a> · <a href="#appendix/e/f-13">f-13</a> · <a href="#appendix/e/f-15">f-15</a>. Defaults come from §7 published runs; n defaults to 16 for illustration.</p>
    </article>
  );
}
