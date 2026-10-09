import { R } from '../lib/appx';
import { Drawer, SecHead, TableWrap, Ext } from '../components/ui';
import { IconX } from '../components/Icon';
import { DOCS } from '../data/main';

const USES = [
  { t: 'burnin', src: 'docs · high' },
  { t: 'handoff', src: 'README · high; Rafay walkthrough · medium' },
  { t: 'repair', src: 'docs · high; AICR #3090 · medium' },
  { t: 'recurring', src: 'FAQ · high' },
  { t: 'stragglers', src: 'docs · high' },
];

export function S6Fit() {
  return (
    <section id="s6" className="sec" aria-labelledby="s6-title" data-sec="S6">
      <SecHead id="S6" label="Where it fits" title="Where NVCRE Is the Critical Tool" lead="NVCRE is the active layer between configuration (AICR) and continuous health (NVSentinel)." />
      <div className="prose">
        <p>
          All three ship in NVIDIA <R a="anc-dsx">DSX OS</R>. AICR pins what the cluster should be. NVCRE proves what it does under load. NVSentinel watches it
          afterwards and quarantines nodes when something breaks.
        </p>
      </div>
      <div className="uses" role="list" aria-label="Use cases">
        {USES.map((u) => (
          <div className="use" role="listitem" key={u.t}>
            {u.t === 'burnin' ? <><span className="use__t">New-cluster bring-up and <R a="anc-burnin">burn-in</R></span><span className="small">Run the catalog before anyone schedules work.</span></> : null}
            {u.t === 'handoff' ? <><span className="use__t"><R a="anc-handoff">Provider → tenant handoff</R></span><span className="small">For teams that bring up, validate or resell clusters (README); Rafay calls it Certify → Hand Off.</span></> : null}
            {u.t === 'repair' ? <><span className="use__t">Post-repair and post-maintenance revalidation</span><span className="small">Uncordon and rerun. NVSentinel v1.26.0 adds an NVCRE provider for post-remediation validation.</span></> : null}
            {u.t === 'recurring' ? <><span className="use__t">Recurring burn-in every 3–4 weeks</span><span className="small">The FAQ suggests it to catch infant mortality and slow degradation.</span></> : null}
            {u.t === 'stragglers' ? <><span className="use__t">Isolating stragglers and degraded links</span><span className="small">Name the slow node before a large synchronous job pays for it.</span></> : null}
            <span className="use__src">{u.src}</span>
          </div>
        ))}
        <div className="use" role="listitem">
          <span className="use__t">Not NVCRE’s job</span>
          <ul className="out-list small">
            <li><IconX /><span>Continuous fleet health → NVSentinel</span></li>
            <li><IconX /><span>Per-job pre-flight gating → not a documented NVCRE feature (NVSentinel has a Preflight component; details unverified)</span></li>
            <li><IconX /><span>Firmware-matrix checks → AICR</span></li>
          </ul>
        </div>
      </div>

      <figure className="stage" aria-labelledby="s6-stack-title" style={{ maxWidth: '40rem' }}>
        <div className="stage__head"><h3 className="stage__title" id="s6-stack-title">The DSX OS readiness stack</h3></div>
        <StackDiagram />
      </figure>

      <div className="prose">
        <p>
          On <R a="anc-slurm">Slurm</R> a readiness test can be one <code>srun</code>; Kubernetes has no built-in equivalent (NVIDIA blog), which is the
          gap NVCRE fills. It is Kubernetes-only. A <R a="anc-gang">gang scheduler</R> (KAI, or Run:ai via <code>queueLabelKey</code>) is optional.
        </p>
      </div>
      <TableWrap label="DIY tools versus NVCRE">
        <table className="tbl tbl--wide" style={{ maxWidth: '60rem' }}>
          <thead><tr><th scope="col">Tool</th><th scope="col">Relationship to NVCRE</th></tr></thead>
          <tbody>
            <tr><th scope="row"><R a="anc-dcgm">DCGM diag levels 1–4</R></th><td>Single-node; level 1 takes seconds, level 3 about 15 minutes, level 4 adds memtest and pulse_test. NVCRE <b>wraps</b> level 4 as one category and adds multi-node burn-in.</td></tr>
            <tr><th scope="row"><R a="anc-nccl-tests">nccl-tests</R></th><td>NVCRE <b>orchestrates</b> them (MPI launcher via Kubeflow Trainer), parses the logs and applies thresholds.</td></tr>
            <tr><th scope="row"><R a="anc-operators">GPU Operator</R></th><td>Prerequisite (drivers, labels). NVCRE does not install or manage it.</td></tr>
            <tr><th scope="row">Kubeflow Trainer</th><td>The execution engine NVCRE drives.</td></tr>
            <tr><th scope="row">NVSentinel</th><td>Passive telemetry and quarantine; consumes NVCRE results.</td></tr>
            <tr><th scope="row">AICR</th><td>Configuration recipes and drift. NVCRE validates behaviour; AICR validates configuration.</td></tr>
            <tr><th scope="row">Node Problem Detector and other health agents</th><td>NVCRE’s CEL detector reads the conditions and taints such tools set [inferred].</td></tr>
            <tr><th scope="row">Other suites (<R a="anc-nhc">LBNL NHC</R>, SuperBench, cloud agents)</th><td>Other validation suites exist. Not compared here.</td></tr>
          </tbody>
        </table>
      </TableWrap>

      <div>
        <Drawer title="NVSentinel’s NVCRE Certification Monitor">
          <TableWrap label="NVSentinel certification monitor behaviour">
            <table className="tbl tbl--mid">
              <tbody>
                <tr><th scope="row">Sweep</th><td>Every 15 min; failed rows become health events</td></tr>
                <tr><th scope="row">Node condition</th><td><code>NVCRECertFailed</code></td></tr>
                <tr><th scope="row">Taint</th><td><code>nvsentinel.dgxc.nvidia.com/nvcre-cert-failed=true:NoSchedule</code></td></tr>
                <tr><th scope="row">Cordon</th><td>No, so reruns can still land on the node</td></tr>
                <tr><th scope="row">Clearing</th><td>A later passing run auto-clears the hold</td></tr>
                <tr><th scope="row">Default policy</th><td>Skips <code>HardwareFailureDetected</code>: the monitor that found the fault already quarantined the node</td></tr>
              </tbody>
            </table>
          </TableWrap>
          <p className="small">Source: <Ext href={DOCS.nvsentinel}>NVSentinel docs</Ext></p>
        </Drawer>
        <Drawer title="The MCP server">
          <p className="small">
            <code>nvcrectl mcp serve</code> exposes a read-only <R a="anc-mcp">MCP server</R> with four tools. A test pins that surface, so adding a fifth tool
            fails the build. This is the only “agentic” part of NVCRE; the verdict itself is deterministic rules. Tool names: see the{' '}
            <Ext href={DOCS.mcp}>CLI reference</Ext>.
          </p>
        </Drawer>
      </div>
    </section>
  );
}

function StackDiagram() {
  const box = (y: number, title: string, sub: string, line2: string, strong = false) => (
    <g>
      <rect x="12" y={y} width="336" height="74" rx="8" fill={strong ? 'var(--info-bg)' : 'var(--bg)'} stroke={strong ? 'var(--info)' : 'var(--border-strong)'} strokeWidth={strong ? 2 : 1.5} />
      <text x="28" y={y + 26} fontSize="15" fontWeight="700" style={{ fill: 'var(--fg)' }}>{title}</text>
      <text x="28" y={y + 46} fontSize="12" style={{ fill: 'var(--muted)' }}>{sub}</text>
      <text x="28" y={y + 63} fontSize="11.5" fontFamily="var(--font-mono)" style={{ fill: 'var(--muted)' }}>{line2}</text>
    </g>
  );
  return (
    <svg className="diagram" viewBox="0 0 360 330" role="img" aria-label="AICR configures the cluster, NVCRE certifies it under load and writes failed nodes, NVSentinel's Certification Monitor turns failures into a condition and NoSchedule taint">
      <defs><marker id="stk-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--border-strong)" /></marker></defs>
      {box(8, 'AICR', 'Configuration: what the cluster should be', 'version-locked recipes')}
      <path d="M180 82V122" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#stk-a)" />
      <text x="190" y="107" fontSize="11.5" style={{ fill: 'var(--muted)' }}>configured cluster</text>
      {box(126, 'NVCRE', 'Behaviour under load: active certification', 'Certification → failedNodesRef', true)}
      <path d="M180 200V240" stroke="var(--border-strong)" strokeWidth="1.5" markerEnd="url(#stk-a)" />
      <text x="190" y="218" fontSize="11.5" style={{ fill: 'var(--muted)' }}>failed-nodes.json.gz</text>
      <text x="190" y="233" fontSize="11.5" style={{ fill: 'var(--muted)' }}>Certification Monitor, 15 min</text>
      {box(244, 'NVSentinel', 'Continuous health and quarantine', 'NVCRECertFailed + NoSchedule')}
    </svg>
  );
}
