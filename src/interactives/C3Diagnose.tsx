import { useEffect, useId, useMemo, useState } from 'react';
import { Illustrative, Stage, Status, Drawer, TableWrap } from '../components/ui';
import { IconCheck, IconPause, IconPlay, IconReset, IconStep, IconWarn, IconX } from '../components/Icon';
import { R } from '../lib/appx';
import { simulate, fmtNodes, THRESHOLD, HEALTHY_BW, FAULT_BW, DOMAIN_A, DOMAIN_B, type FaultKind, type Probe } from '../lib/diagnose';
import { nodeName } from '../lib/c4';

type Fault = 'nvlink' | 'nic' | 'ecc' | 'hang' | 'cordoned' | 'thermal';
const FAULTS: Record<Fault, { label: string; node: number; kind?: FaultKind }> = {
  nvlink: { label: 'Degraded NVLink on one node', node: 7, kind: 'nvlink' },
  nic: { label: 'Scale-out NIC or link degraded on one node', node: 12, kind: 'nic' },
  ecc: { label: 'GPU ECC/XID errors flagged by your health stack', node: 12 },
  hang: { label: 'NCCL hang or crash', node: 5 },
  cordoned: { label: 'Node already cordoned', node: 3 },
  thermal: { label: 'Thermal throttling or wrong firmware', node: 14 },
};
const ORDER: Fault[] = ['nvlink', 'nic', 'ecc', 'hang', 'cordoned', 'thermal'];
const pad = (n: number) => String(n).padStart(2, '0');

function useReducedMotion() {
  const [rm, setRm] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setRm(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return rm;
}

type TileState = 'pass' | 'fail' | 'warn' | 'idle' | 'dim' | 'suspect';

export function C3Diagnose() {
  const uid = useId().replace(/:/g, '');
  const [fault, setFault] = useState<Fault>('nvlink');
  const [node, setNode] = useState(FAULTS.nvlink.node);
  const [m, setM] = useState(2);
  const [phase, setPhase] = useState<'idle' | 'full' | 'diag'>('idle');
  const [si, setSi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const kind = FAULTS[fault].kind;
  const sim = useMemo(() => (kind ? simulate(kind, node, m) : null), [kind, node, m]);
  const stages = sim?.stages ?? [];
  const stage = phase === 'diag' ? stages[si] : null;
  const done = phase === 'diag' && si === stages.length - 1;
  const runsSoFar = phase === 'diag' ? stages.slice(0, si + 1).reduce((n, s) => n + s.probes.filter((p) => !p.reused).length, 0) : 0;

  useEffect(() => {
    if (!playing || phase !== 'diag') return;
    if (si >= stages.length - 1) { setPlaying(false); return; }
    const t = window.setTimeout(() => setSi((x) => x + 1), 1200);
    return () => window.clearTimeout(t);
  }, [playing, phase, si, stages.length]);

  const reset = (f: Fault = fault, n = node) => { setFault(f); setNode(n); setPhase('idle'); setSi(0); setPlaying(false); };
  const startDiag = () => { setPhase('diag'); setSi(0); setPlaying(!reduced); };

  // tile states
  const tiles: TileState[] = Array.from({ length: 16 }, (_, i) => {
    if (fault === 'cordoned' && i === node) return 'warn';
    if (phase === 'idle') return 'pass';
    if (phase === 'full') {
      if (fault === 'nvlink' || fault === 'nic' || fault === 'hang') return 'fail';
      if (fault === 'ecc') return i === node ? 'fail' : 'pass';
      return 'pass';
    }
    if (!stage) return 'idle';
    if (stage.key === 'complete') return sim?.confirmed.includes(i) ? 'fail' : 'pass';
    if (stage.key === 'confirm') {
      const p = stage.probes.find((x) => x.nodes.includes(i) && sim?.suspects.includes(i));
      if (p) return p.result === 'fail' ? 'fail' : 'suspect';
      return stage.probes.some((x) => x.nodes.includes(i)) ? 'pass' : 'dim';
    }
    const p = stage.probes.find((x) => x.nodes.includes(i));
    if (!p) return 'dim';
    return p.result === 'fail' ? 'fail' : 'pass';
  });

  const outcome = (() => {
    if (phase === 'idle') return null;
    if (phase === 'diag') return done ? { result: 'FAILED', kind: 'fail' as const } : { result: 'RUNNING', kind: 'info' as const };
    switch (fault) {
      case 'nvlink': case 'nic': return { result: 'FAILED', kind: 'fail' as const };
      case 'ecc': return { result: 'FAILED', kind: 'fail' as const };
      case 'hang': return { result: 'FAILED', kind: 'fail' as const };
      case 'cordoned': return { result: 'INCOMPLETE', kind: 'warn' as const };
      default: return { result: 'PASSED', kind: 'pass' as const };
    }
  })();

  return (
    <Stage id="C3" title="Inject a fault, then let diagnose find it" badge={<Illustrative>Illustrative numbers · real stage names</Illustrative>}>
      <p className="small">Stage names are NVCRE’s; group sizes and bandwidth numbers are illustrative placeholders (healthy busBW = {HEALTHY_BW}, threshold <code>value &gt;= {THRESHOLD}</code>, relative units).</p>
      <div className="stage__grid stage__grid--2">
        <div className="panel">
          <fieldset>
            <legend className="field__label">Inject a fault</legend>
            <div style={{ display: 'grid', gap: '0.125rem', marginTop: '0.375rem' }}>
              {ORDER.map((f) => (
                <label key={f} className="check">
                  <input type="radio" name={`${uid}-fault`} value={f} checked={fault === f} onChange={() => reset(f, FAULTS[f].node)} />
                  <span>{FAULTS[f].label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field__row" style={{ flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: '1 1 8rem' }}>
              <label htmlFor={`${uid}-node`}>Faulty node</label>
              <select id={`${uid}-node`} className="select" value={node} onChange={(e) => reset(fault, +e.target.value)}>
                {Array.from({ length: 16 }, (_, i) => <option key={i} value={i}>{nodeName(i)} ({i < 8 ? 'clique-a' : 'clique-b'})</option>)}
              </select>
            </div>
            <div className="field">
              <span className="field__label" id={`${uid}-m`}><code>minGroupSize</code></span>
              <div className="seg" role="group" aria-labelledby={`${uid}-m`}>
                {[2, 4].map((v) => <button key={v} type="button" aria-pressed={m === v} onClick={() => { setM(v); if (phase === 'diag') { setSi(0); setPlaying(false); } }}>{v}</button>)}
              </div>
            </div>
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={() => { setPhase('full'); setPlaying(false); }}>Run full-scale</button>
            <button type="button" className="btn" onClick={startDiag} disabled={!kind} aria-describedby={!kind ? `${uid}-nodiag` : undefined}>Run <code>diagnose</code></button>
            {phase !== 'idle' ? <button type="button" className="btn btn--quiet" onClick={() => reset()}><IconReset />Reset</button> : null}
          </div>
          {!kind ? <p className="small muted" id={`${uid}-nodiag`}>Bisection hunts bandwidth faults. This fault is named (or skipped) without it.</p> : null}
        </div>

        <div className="panel">
          <div className="cliques" role="img" aria-label={`Cluster: ${tiles.map((t, i) => `${pad(i)} ${t}`).join(', ')}`}>
            {[{ name: 'clique-a', ids: DOMAIN_A }, { name: 'clique-b', ids: DOMAIN_B }].map((c) => (
              <div className="clique" key={c.name}>
                <span className="clique__name" aria-hidden="true">{c.name} · NVLink domain</span>
                <div className="clique__grid">
                  {c.ids.map((i) => {
                    const t = tiles[i];
                    const cls = t === 'pass' ? 'tile tile--probe-pass' : t === 'fail' ? 'tile tile--probe-fail' : t === 'warn' ? 'tile tile--warn' : t === 'suspect' ? 'tile tile--suspect' : t === 'dim' ? 'tile tile--idle tile--dim' : 'tile tile--idle';
                    return (
                      <span key={i} className={cls} aria-hidden="true" style={{ transitionDuration: reduced ? '0ms' : '400ms' }}>
                        {t === 'fail' ? <IconX /> : t === 'warn' || t === 'suspect' ? <IconWarn /> : t === 'pass' ? <IconCheck /> : null}
                        {pad(i)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div aria-live="polite" className="small" style={{ minHeight: '1.5em' }}>
            {phase === 'idle' ? 'Pick a fault and run. Every node starts green.' : null}
            {phase === 'full' && outcome ? <span>Full-scale result: <Status kind={outcome.kind}>{outcome.result}</Status></span> : null}
            {phase === 'diag' && stage ? <span>Stage {si + 1} of {stages.length} · <code>{stage.name}</code>{stage.round ? ` (round ${stage.round})` : ''} · runs so far: <b className="num">{runsSoFar}</b></span> : null}
          </div>
        </div>
      </div>

      {phase === 'diag' ? (
        <div className="panel">
          <ol className="stages" aria-label="Diagnose stages">
            {stages.map((s, i) => (
              <li key={s.key} aria-current={i === si ? 'step' : undefined} className={`${i < si ? 'is-done' : ''} ${s.skipped ? 'is-skipped' : ''}`}>
                {s.name}{s.round ? `#${s.round}` : ''}
              </li>
            ))}
          </ol>
          {stage ? <p className="small">{stage.note}</p> : null}
          {stage && stage.probes.length ? (
            <div className="probes">
              {stage.probes.map((p, i) => <ProbeRow key={i} p={p} />)}
            </div>
          ) : null}
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setSi((x) => Math.min(stages.length - 1, x + 1))} disabled={done}><IconStep />Next stage</button>
            {!reduced ? (
              <button type="button" className="btn" onClick={() => setPlaying((p) => !p)} disabled={done} aria-pressed={playing}>
                {playing ? <><IconPause />Pause</> : <><IconPlay />Auto-play</>}
              </button>
            ) : <span className="small muted">Reduced motion: step through manually.</span>}
          </div>
        </div>
      ) : null}

      {phase !== 'idle' && (phase === 'full' || done) ? <Report fault={fault} node={node} phase={phase} sim={sim} m={m} /> : null}

      <Drawer kicker="Fault map" title="What NVCRE sees for each fault" wide>
        <TableWrap label="Fault to outcome map">
          <table className="tbl tbl--wide">
            <thead><tr><th scope="col">Fault</th><th scope="col">What NVCRE sees</th><th scope="col">Reason / stage</th><th scope="col">Follow-up</th></tr></thead>
            <tbody>
              <tr><th scope="row"><R a="anc-f-nvlink">Degraded NVLink</R> on one node</th><td>Low busBW in its group (intra-rack or full-scale); the per-node loopback test isolates it</td><td><code>ThresholdViolation</code> (if a threshold is set) → diagnose finds the node</td><td>Platform cordons; repair; rerun</td></tr>
              <tr><th scope="row">NIC or link degraded across racks: an <R a="anc-f-ib">IB port down-trained or flapping</R>, or EFA silently falling back to TCP (cf. fix #434)</th><td>full-scale low; intra-rack fine</td><td><code>ThresholdViolation</code>; diagnose cross-boundary probe</td><td>Fix config or link. If every node fell back to TCP, every cross-domain probe fails: a config fault, not a node fault</td></tr>
              <tr><th scope="row">GPU <R a="anc-f-ecc">ECC or XID errors</R> surfaced as a node label or condition by your health stack</th><td>CEL detector fires mid-run</td><td><code>HardwareFailureDetected</code></td><td>NVSentinel’s default policy skips it (already quarantined)</td></tr>
              <tr><th scope="row">Hang or crash (e.g. an <R a="anc-f-hang">NCCL hang</R>)</th><td>Workload exits non-zero or stalls</td><td><code>WorkloadFailed</code></td><td>Inspect <code>failureLog.tail</code></td></tr>
              <tr><th scope="row">Node already cordoned</th><td>Excluded before the run</td><td>Result <code>INCOMPLETE</code></td><td>Uncordon after repair</td></tr>
              <tr><th scope="row"><R a="anc-f-throttle">Thermal or power throttling</R>, or <R a="anc-f-fw">wrong firmware</R></th><td>Not a dedicated check; may show as low performance if thresholds are set [inferred, low confidence]</td><td>Possibly <code>ThresholdViolation</code></td><td>NVCRE has no firmware or thermal check; see AICR / NVSentinel</td></tr>
            </tbody>
          </table>
        </TableWrap>
      </Drawer>
    </Stage>
  );
}

function ProbeRow({ p }: { p: Probe }) {
  return (
    <div className="probe">
      {p.result === 'fail' ? <Status kind="fail">fail</Status> : <Status kind="pass">pass</Status>}
      <span className="probe__nodes">{p.label ? `${p.label}: ` : ''}{fmtNodes(p.nodes)}{p.reused ? ' (reused)' : ''}</span>
      <span className="num">busBW {p.bw} {p.result === 'fail' ? '<' : '≥'} {THRESHOLD}</span>
    </div>
  );
}

function Report({ fault, node, phase, sim, m }: { fault: Fault; node: number; phase: 'full' | 'diag' | 'idle'; sim: ReturnType<typeof simulate> | null; m: number }) {
  const n = nodeName(node);
  if (phase === 'diag' && sim) {
    const conf = sim.stages.find((s) => s.key === 'confirm')?.probes.find((p) => p.result === 'fail');
    return (
      <div className="report" aria-label="Mock NVCRE report">
        <span><b>category</b> communication/nccl-all-reduce · <b>testScale</b> diagnose · <b>minGroupSize</b> {m}</span>
        <span><b>result</b> <Status kind="fail">FAILED</Status></span>
        {sim.confirmed.map((c) => <span key={c}><b>{nodeName(c)}</b>  ThresholdViolation  busBW {conf?.bw ?? FAULT_BW.nvlink} &lt; {THRESHOLD} in confirmation probe {'{'}{conf ? fmtNodes(conf.nodes) : ''}{'}'}</span>)}
        <span className="muted">runs: {sim.runs} · stages: {sim.stages.filter((s) => !s.skipped).map((s) => s.name).filter((v, i, a) => a.indexOf(v) === i).join(' → ')}</span>
      </div>
    );
  }
  const lines: Record<Fault, React.ReactNode> = {
    nvlink: <><span><b>group</b> all 16 nodes · busBW {FAULT_BW.nvlink} &lt; {THRESHOLD} → <code>ThresholdViolation</code></span><span className="muted">Which node? The group failed as a whole. Run diagnose.</span></>,
    nic: <><span><b>group</b> all 16 nodes · busBW {FAULT_BW.nic} &lt; {THRESHOLD} → <code>ThresholdViolation</code></span><span className="muted">intra-rack would pass here: the fault only shows across domains. Run diagnose.</span></>,
    ecc: <><span><b>{n}</b>  HardwareFailureDetected  CEL health expression matched mid-run</span><span className="muted">Named directly; no bisection needed.</span></>,
    hang: <><span><b>group</b> all 16 nodes → <code>WorkloadFailed</code> (stall)</span><span><b>failureLog</b> {'{'}podName: …-launcher, nodeName: {n}, exitCode: —, tail: last launcher log lines{'}'}</span></>,
    cordoned: <><span><b>excludedNodes</b> {n} · <b>exclusionReason</b> cordoned</span><span>15 nodes ran · busBW {HEALTHY_BW} ≥ {THRESHOLD}</span></>,
    thermal: <><span>busBW {HEALTHY_BW} ≥ {THRESHOLD} · all nodes pass</span><span className="muted">An all-reduce is bandwidth-bound, so a throttled or mis-flashed GPU can slip through. A training category with an <code>avgTFLOPsPerGPU</code> threshold might catch it [inferred, low confidence].</span></>,
  };
  const res = fault === 'cordoned' ? <Status kind="warn">INCOMPLETE</Status> : fault === 'thermal' ? <Status kind="pass">PASSED</Status> : <Status kind="fail">FAILED</Status>;
  return (
    <div className="report" aria-label="Mock NVCRE report">
      <span><b>category</b> communication/nccl-all-reduce · <b>testScale</b> full-scale</span>
      <span><b>result</b> {res}</span>
      {lines[fault]}
    </div>
  );
}
