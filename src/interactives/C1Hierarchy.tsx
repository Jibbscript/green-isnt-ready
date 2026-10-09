import { useId, useState, type KeyboardEvent } from 'react';
import { RealRules, Stage, Ext } from '../components/ui';
import { DOCS } from '../data/main';

type NodeId = 'cert' | 'workflow' | 'job' | 'trainjob' | 'gm' | 'bm' | 'logprofile' | 'configmap';
interface NodeInfo { title: string; sub: string; role: string; fields: string[]; src: string; x: number; y: number; w: number }

const L = 12, LW = 160, RX = 190, RW = 158, NH = 56;
const NODES: Record<NodeId, NodeInfo> = {
  cert: { title: 'Certification', sub: 'what you create', x: L, y: 12, w: LW, src: DOCS.certification,
    role: 'Top-level and namespaced. Lists target nodes and categories. Its spec is immutable after creation.',
    fields: ['status.categoryStatuses[].failedNodesRef', 'status.categoryStatuses[].succeededNodesRef', 'result: PASSED · INCOMPLETE · FAILED · RUNNING'] },
  workflow: { title: 'Workflow', sub: 'one per category', x: L, y: 112, w: LW, src: DOCS.workflow,
    role: 'Resolves the catalog entry plus platform/GPU overrides, runs iterations and splits the target nodes into groups by testScale. Workflows run one after another.',
    fields: ['status.failedNodesRef (ConfigMap, union of its Jobs)', 'Failed reason JobValidationFailed when a threshold miss is the only cause', 'maxConcurrent: groups at once (0 = unlimited)'] },
  job: { title: 'Job', sub: 'runs it, watches node health', x: L, y: 212, w: LW, src: DOCS.job,
    role: 'Creates the workload through an adapter (today only trainJob), evaluates CEL health expressions during the run, owns the measurements and restarts from checkpoint.',
    fields: ['status.failedNodes[] {name, reason, message}', 'ValidationFailed condition on a threshold miss', 'reasons: ThresholdViolation · HardwareFailureDetected · WorkloadFailed'] },
  trainjob: { title: 'TrainJob', sub: 'Kubeflow Trainer launches', x: L, y: 312, w: LW, src: DOCS.workloadTypes,
    role: 'Kubeflow Trainer 2.2.1 (installed by nvcrectl setup init) launches the distributed pods; nccl-tests run through its MPI launcher.',
    fields: ['Kueue-suspended time counts against neither timeoutPerJob nor stall detection'] },
  gm: { title: 'GoodputMeasurement', sub: 'logs → goodput', x: RX, y: 212, w: RW, src: DOCS.measurement,
    role: 'Parses pod logs with LogProfile regexes. Provisional while running, frozen once Complete=True (ADR-072). Goodput thresholds read only frozen values.',
    fields: ['sampleInterval: 60s default (120s suggested for large clusters)'] },
  bm: { title: 'BandwidthMeasurement', sub: 'logs → algBW / busBW', x: RX, y: 312, w: RW, src: DOCS.measurement,
    role: 'Judged only on the complete final launcher log (fix #418, v0.6.0). A measurement that ends NoDataCollected or LogsUnavailable never passes a threshold.',
    fields: ['bandwidth[] {size, algBW, busBW, samples}'] },
  logprofile: { title: 'LogProfile', sub: 'cluster-scoped regexes', x: RX, y: 412, w: RW, src: DOCS.measurement,
    role: 'Regex profiles the measurement controllers apply to pod logs. Built-ins include megatron-training, megatron-bridge, nccl-bandwidth and nccl-loopback (one docs page says five).',
    fields: ['scope: cluster'] },
  configmap: { title: 'failedNodesRef', sub: 'ConfigMap', x: RX, y: 112, w: RW, src: DOCS.health,
    role: 'Each Workflow writes the union of its Jobs’ failed nodes into a ConfigMap, and the Certification references it per category. NVSentinel reads a failed-nodes.json.gz payload.',
    fields: ['Job.status.failedNodes[] → Workflow.status.failedNodesRef → Certification.status.categoryStatuses[].failedNodesRef'] },
};
const ORDER: NodeId[] = ['cert', 'workflow', 'job', 'trainjob', 'configmap', 'gm', 'bm', 'logprofile'];

export function C1Hierarchy() {
  const [phase, setPhase] = useState<'down' | 'up'>('down');
  const [sel, setSel] = useState<NodeId>('cert');
  const [focus, setFocus] = useState<NodeId | null>(null);
  const uid = useId().replace(/:/g, '');
  const info = NODES[sel];
  const onKey = (e: KeyboardEvent, id: NodeId) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(id); }
  };
  const report = phase === 'up';

  return (
    <Stage id="C1" title="The certification tree" badge={<RealRules>Real behaviour</RealRules>}>
      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
        <div className="seg" role="group" aria-label="Direction">
          <button type="button" aria-pressed={!report} onClick={() => setPhase('down')}>Create (top-down)</button>
          <button type="button" aria-pressed={report} onClick={() => { setPhase('up'); setSel('configmap'); }}>Report (bottom-up)</button>
        </div>
        <span className="small muted">Tap a box for its fields.</span>
      </div>
      <div className="stage__grid stage__grid--2">
        <svg className="diagram" viewBox="0 0 360 480" role="group" aria-label="NVCRE resource tree">
          <defs>
            <marker id={`${uid}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--border-strong)" /></marker>
            <marker id={`${uid}-r`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--fail)" /></marker>
          </defs>
          {/* create edges */}
          <g opacity={report ? 0.35 : 1}>
            <path className="dedge" d="M92 68V110" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M92 168V210" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M92 268V310" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M172 240H188" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M150 268V290H269V310" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M269 412V370" markerEnd={`url(#${uid}-a)`} />
            <path className="dedge" d="M348 440H356V240H350" markerEnd={`url(#${uid}-a)`} />
          </g>
          {/* report edges */}
          {report ? (
            <g>
              <path className="dedge dedge--report" d="M36 212V170" markerEnd={`url(#${uid}-r)`} />
              <path className="dedge dedge--report" d="M172 140H188" markerEnd={`url(#${uid}-r)`} />
              <path className="dedge dedge--report" d="M269 112V40H174" markerEnd={`url(#${uid}-r)`} />
              <text className="dlabel t-mono" x="42" y="196" fill="var(--fail)" style={{ fill: 'var(--fail)' }}>failedNodes[]</text>
              <text className="dlabel t-mono" x="180" y="32" style={{ fill: 'var(--fail)' }}>categoryStatuses[]</text>
            </g>
          ) : null}
          {ORDER.map((id) => {
            const n = NODES[id];
            const faint = (id === 'configmap' && !report) || (report && ['trainjob', 'gm', 'bm', 'logprofile'].includes(id));
            return (
              <g key={id} className={`dnode${sel === id ? ' is-selected' : ''}${faint ? ' is-faint' : ''}`}
                role="button" tabIndex={0} aria-pressed={sel === id} aria-label={`${n.title}: ${n.sub}`}
                onClick={() => setSel(id)} onKeyDown={(e) => onKey(e, id)} onFocus={() => setFocus(id)} onBlur={() => setFocus(null)}>
                <rect x={n.x} y={n.y} width={n.w} height={NH} rx="8" />
                {focus === id ? <rect className="focus-ring" x={n.x - 4} y={n.y - 4} width={n.w + 8} height={NH + 8} rx="11" /> : null}
                <text x={n.x + 12} y={n.y + 24} fontSize={n.title.length > 16 ? 12.5 : 14} fontWeight={600}>{n.title}</text>
                <text x={n.x + 12} y={n.y + 42} fontSize="11.5" className="t-muted" style={{ fill: 'var(--muted)' }}>{n.sub}</text>
              </g>
            );
          })}
        </svg>
        <div className="panel" aria-live="polite">
          <p className="panel__title"><span className="mono">{info.title}</span> <span className="muted">· {info.sub}</span></p>
          <p className="small">{info.role}</p>
          <ul className="small mono" style={{ display: 'grid', gap: '0.375rem' }}>
            {info.fields.map((f) => <li key={f} style={{ overflowWrap: 'anywhere' }}>{f}</li>)}
          </ul>
          <p className="small">Source: <Ext href={info.src}>NVCRE docs</Ext></p>
        </div>
      </div>
      {report ? <p className="stage__note">Report mode: failed nodes travel Job → Workflow ConfigMap → Certification.</p> : <p className="stage__note">Create mode: you write the Certification; reconcilers create everything below it.</p>}
    </Stage>
  );
}
