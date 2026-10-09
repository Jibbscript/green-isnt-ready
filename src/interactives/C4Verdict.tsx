import { useId, useMemo, useState } from 'react';
import { RealRules, Stage, Status, RESULT_KIND, type StatusKind } from '../components/ui';
import { IconWarn } from '../components/Icon';
import { R } from '../lib/appx';
import { RUNS } from '../data/main';
import { verdict, fmt, METRIC_KEY, METRIC_CATEGORY, type Metric } from '../lib/c4';

const METRIC_LABEL: Record<Metric, string> = { busBW: 'busBW (all-reduce, GB/s)', goodput: 'goodputRatio (training)', tflops: 'avgTFLOPsPerGPU (training)' };
const RANGE: Record<Metric, { min: number; max: number; step: number; def: number }> = {
  busBW: { min: 0, max: 1000, step: 1, def: 900 },
  goodput: { min: 0, max: 1, step: 0.01, def: 0.9 },
  tflops: { min: 0, max: 1500, step: 10, def: 800 },
};
const COND_KIND: Record<string, StatusKind> = { ok: 'pass', fail: 'fail', warn: 'warn', na: 'na' };

export function C4Verdict() {
  const uid = useId().replace(/:/g, '');
  const [runId, setRunId] = useState('aws-gb200-on');
  const [metric, setMetric] = useState<Metric>('busBW');
  const [thresholdOn, setThresholdOn] = useState(false);
  const [threshold, setThreshold] = useState(900);
  const [exitedOk, setExitedOk] = useState(true);
  const [healthFired, setHealthFired] = useState(false);
  const [cordoned, setCordoned] = useState(false);
  const [logsUnavailable, setLogsUnavailable] = useState(false);
  const run = RUNS.find((r) => r.id === runId)!;
  const value = metric === 'busBW' ? run.allReduce : metric === 'goodput' ? run.goodput : run.tflops;
  const out = useMemo(() => verdict({ metric, value, thresholdOn, threshold, exitedOk, healthFired, cordoned, logsUnavailable, nodes: run.nodes }), [metric, value, thresholdOn, threshold, exitedOk, healthFired, cordoned, logsUnavailable, run.nodes]);
  const rng = RANGE[metric];

  const pickRun = (id: string) => {
    setRunId(id);
    const r = RUNS.find((x) => x.id === id)!;
    if (metric !== 'busBW' && (r.goodput === null || r.tflops === null)) { setMetric('busBW'); setThreshold(RANGE.busBW.def); }
  };
  const pickMetric = (mm: Metric) => { setMetric(mm); setThreshold(RANGE[mm].def); };
  const apply = (mm: Metric, v: number) => {
    if (mm !== 'busBW' && run.goodput === null) setRunId('aws-gb200-on');
    setMetric(mm); setThreshold(v); setThresholdOn(true);
  };
  const expr = `${METRIC_KEY[metric]}: "value >= ${threshold}"`;
  const teach = metric === 'goodput' && run.gpu === 'GB300';

  return (
    <Stage id="C4" title="Verdict explorer" badge={<RealRules>Real rules · published data</RealRules>}>
      <p className="small">
        Pick a published run (<R a="anc-fabrics">EFA, RoCE or TCPXO</R>; <R a="anc-mnnvl">MNNVL</R> on or off) and a metric: <R a="anc-busbw">busBW</R> from
        all-reduce, or goodput and TFLOPs/GPU from <R a="anc-megatron">NeMo/Megatron training</R>. Set the bar. NVCRE won’t set it for you.
      </p>
      <div className="stage__grid stage__grid--2">
        <div className="panel">
          <div className="field">
            <label htmlFor={`${uid}-run`}>Published run (16 GB, all PASSED with no thresholds)</label>
            <select id={`${uid}-run`} className="select" value={runId} onChange={(e) => pickRun(e.target.value)}>
              {RUNS.map((r) => <option key={r.id} value={r.id}>{r.label} · all-reduce {r.allReduce.toFixed(2)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-metric`}>Metric</label>
            <select id={`${uid}-metric`} className="select" value={metric} onChange={(e) => pickMetric(e.target.value as Metric)}>
              {(['busBW', 'goodput', 'tflops'] as Metric[]).map((mm) => (
                <option key={mm} value={mm} disabled={mm !== 'busBW' && run.goodput === null}>{METRIC_LABEL[mm]}</option>
              ))}
            </select>
            <span className="field__hint">Measured: <b className="num mono">{value === null ? '—' : fmt(metric, value)}</b></span>
          </div>
          <label className="check"><input type="checkbox" checked={thresholdOn} onChange={(e) => setThresholdOn(e.target.checked)} />Set a threshold</label>
          <div className="field">
            <label htmlFor={`${uid}-thr`}>Threshold <code>value &gt;=</code></label>
            <div className="field__row">
              <input id={`${uid}-thr-r`} type="range" min={rng.min} max={rng.max} step={rng.step} value={threshold} disabled={!thresholdOn} aria-label="Threshold slider" onChange={(e) => setThreshold(+e.target.value)} />
              <input id={`${uid}-thr`} className="input input--num" type="number" min={rng.min} max={rng.max} step={rng.step} value={threshold} disabled={!thresholdOn} onChange={(e) => setThreshold(+e.target.value)} />
            </div>
            <code className="small" style={{ background: 'none', padding: 0 }}>{thresholdOn ? expr : '# no threshold'}</code>
          </div>
          <fieldset>
            <legend className="field__label">What happened during the run</legend>
            <label className="check"><input type="checkbox" checked={exitedOk} onChange={(e) => setExitedOk(e.target.checked)} />Workload exited OK</label>
            <label className="check"><input type="checkbox" checked={healthFired} onChange={(e) => setHealthFired(e.target.checked)} />Health expression fired on gpu-node-12</label>
            <label className="check"><input type="checkbox" checked={cordoned} onChange={(e) => setCordoned(e.target.checked)} />gpu-node-03 was cordoned before the run</label>
            <label className="check"><input type="checkbox" checked={logsUnavailable} onChange={(e) => setLogsUnavailable(e.target.checked)} />Logs unavailable</label>
          </fieldset>
        </div>

        <div className="panel" aria-live="polite" aria-atomic="true">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="small mono muted">{METRIC_CATEGORY[metric]}</span>
            <Status kind={RESULT_KIND[out.result]} pill>{out.result}</Status>
          </div>
          {out.noThresholdWarning ? (
            <div className="callout callout--warn">
              <IconWarn />
              <div><p className="callout__title">No thresholds ship by default</p><p>None is set here, so PASSED means “ran to completion”, not “fast enough”.</p></div>
            </div>
          ) : null}
          <ul style={{ display: 'grid', gap: '0.375rem' }} aria-label="Conditions">
            {out.conds.map((c) => (
              <li key={c.id} className="small" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem', alignItems: 'start' }}>
                <Status kind={COND_KIND[c.state]}>{c.state === 'na' ? 'n/a' : c.state === 'ok' ? 'ok' : c.state === 'warn' ? 'note' : 'fail'}</Status>
                <span><b>{c.label}.</b> {c.detail}</span>
              </li>
            ))}
          </ul>
          {out.nodes.length || out.excluded.length ? (
            <div className="report">
              {out.excluded.map((x) => <span key={x}><b>excludedNodes</b> {x} · exclusionReason: cordoned</span>)}
              {out.nodes.map((n) => <span key={n.node + n.reason}><b>{n.node}</b>  {n.reason}  <span className="muted">{n.message}</span></span>)}
              {out.jobValidationFailed ? <span>Job condition <b>ValidationFailed</b>{out.workflowReason ? <> · Workflow Failed reason <b>{out.workflowReason}</b></> : null}</span> : null}
            </div>
          ) : null}
          {teach ? (
            <p className="small"><b>Calibrate to run length.</b> NVIDIA’s own GB300 runs logged goodput 0.57 and PASSED with no threshold. A{' '}
              <code>goodputRatio &gt;= 0.9</code> bar fails them; the docs treat goodput below ~0.95 as meaningful overhead, and 50-step runs are likely startup-dominated [inferred].</p>
          ) : null}
        </div>
      </div>
      <div className="chips">
        <span className="chips__l">Try NVIDIA’s illustrative GB200 NVL72-class bars (examples, not defaults):</span>
        <button type="button" className="chip" onClick={() => apply('busBW', 900)}>busBW ≥ 900</button>
        <button type="button" className="chip" onClick={() => apply('goodput', 0.9)}>goodputRatio ≥ 0.9</button>
        <button type="button" className="chip" onClick={() => apply('tflops', 800)}>avgTFLOPsPerGPU ≥ 800</button>
      </div>
    </Stage>
  );
}
