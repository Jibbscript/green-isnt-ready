import { R } from '../lib/appx';
import { Drawer, N, SecHead, TableWrap } from '../components/ui';
import { C3Diagnose } from '../interactives/C3Diagnose';

export function S4Walkthrough() {
  return (
    <section id="s4" className="sec" aria-labelledby="s4-title" data-sec="S4">
      <SecHead id="S4" label="Worked example" title="Certify a 16-Node Cluster" lead="The same NCCL test means different things at different scales, and diagnose narrows a group failure to a suspect." />
      <div className="prose">
        <ol>
          <li><strong>Install.</strong> <code>nvcrectl setup init</code> installs Kubeflow Trainer, then the CRDs, controller, RBAC, ServiceMonitor and
            LogProfiles. <R a="anc-nvcrectl"><code>nvcrectl</code></R> also runs as <code>kubectl nvcre</code>.</li>
          <li><strong>Run.</strong> <code>nvcrectl certification run --category communication/nccl-all-reduce</code>. The default{' '}
            <code>testScale: full-scale</code> puts all 16 nodes in one group, and <R a="anc-busbw">NCCL all-reduce reports busBW</R> across a sweep up
            to 16 GB. On NVIDIA’s own 16-node GB300 run, busBW reached <N src="README / launch blog">932.09 GB/s</N> at 16 GB in{' '}
            <N src="README / launch blog">3m56s</N>, with <R a="anc-mnnvl">MNNVL</R> enabled.</li>
          <li><strong>Set a bar.</strong> Add a <R a="anc-cel">CEL</R> threshold such as <code>busBandwidthGBps: "value &gt;= 900"</code>. A group that finishes
            but misses it now fails with <code>ThresholdViolation</code>.</li>
          <li><strong>Narrow it.</strong> Rerun with <code>testScale: diagnose</code>. NVCRE screens each NVLink domain, then across domains,{' '}
            <R a="anc-bisection">bisects failing groups down to <code>minGroupSize</code></R>, and confirms each suspect against a known-healthy node.</li>
          <li><strong>Hand off.</strong> NVCRE reports and stops. Your platform or NVSentinel <R a="anc-cordon">cordons or taints</R> the node. After repair,
            uncordon and rerun; NVCRE skips cordoned nodes.</li>
        </ol>
        <p>
          <R a="anc-testscale"><code>testScale</code></R> decides which fabric you are measuring. <code>intra-node</code> tests each node alone.{' '}
          <code>intra-rack</code> groups nodes by <code>nvidia.com/gpu.clique</code>, one NVLink domain per group, so it measures NVLink.{' '}
          <code>full-scale</code> crosses domains and measures the scale-out fabric. <code>diagnose</code> runs adaptive fault isolation.
        </p>
      </div>
      <C3Diagnose />
      <div>
        <Drawer title="testScale, topology keys and diagnose internals">
          <TableWrap label="testScale levels">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col"><code>testScale</code></th><th scope="col">Groups</th><th scope="col">Measures</th></tr></thead>
              <tbody>
                <tr><th scope="row"><code>intra-node</code></th><td>Each node alone</td><td>NVLink/NVSwitch inside one node</td></tr>
                <tr><th scope="row"><code>intra-rack</code></th><td>One group per <code>nvidia.com/gpu.clique</code> value</td><td>The NVLink domain</td></tr>
                <tr><th scope="row"><code>full-scale</code> (default)</th><td>One group</td><td>The scale-out fabric across domains</td></tr>
                <tr><th scope="row"><code>diagnose</code></th><td>Adaptive</td><td>Screening → bisection → confirmation</td></tr>
              </tbody>
            </table>
          </TableWrap>
          <p className="small"><code>numNodes</code> / <code>nodesPerJob</code> are nodes <em>per group</em>: <code>numNodes: 4</code> on a 16-node cluster produces four 4-node jobs.
            <code> maxConcurrent</code> bounds groups running at once (default 0 = unlimited), partly so they do not saturate the fabric being measured.</p>
          <p className="small"><R a="anc-topo-labels">Cloud topology labels</R> NVCRE groups by:</p>
          <TableWrap label="Topology keys by platform">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col">Platform</th><th scope="col">Label</th></tr></thead>
              <tbody>
                <tr><td>AWS</td><td><code>topology.k8s.aws/network-node-layer-1</code></td></tr>
                <tr><td>GCP</td><td><code>cloud.google.com/gce-topology-block</code></td></tr>
                <tr><td>Azure</td><td><code>kubernetes.azure.com/ppg</code></td></tr>
                <tr><td>Nscale GB300</td><td><code>topology.nks.nscale.com/accelerator-domain</code></td></tr>
              </tbody>
            </table>
          </TableWrap>
          <ul className="small" style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li>Stages: <code>intra-screening</code>, <code>intra-screening-no-nvl</code>, <code>inter-screening</code>, <code>bisection</code>, <code>confirmation</code>, <code>cross-boundary</code>, <code>complete</code>. What each screening stage does individually is unverified.</li>
            <li>Screening groups are one per topology domain, or disjoint chunks of ⌈√N⌉ nodes when there is no topology key.</li>
            <li><code>Bisect</code> halves each failing group (splitting by domain when a key is set) and stops at <code>minGroupSize</code> (default 2).</li>
            <li>If both halves of a failing parent pass, <code>DetectBothHalvesPass</code> points to a boundary fault such as a spine link, and <code>BuildCrossBoundaryGroups</code> builds mixed probes.</li>
            <li><code>BuildConfirmationGroups</code> pairs each suspect with a known-healthy node.</li>
            <li>diagnose defaults: NCCL <code>-n 5 -N 1</code> (vs 100/10 normally) and <code>timeoutPerJob</code> 15m.</li>
            <li>The docs claim at most log₂(N) additional runs instead of N−1. That holds for a single faulty node; multiple faults cost more [inferred].</li>
          </ul>
        </Drawer>
      </div>
    </section>
  );
}
