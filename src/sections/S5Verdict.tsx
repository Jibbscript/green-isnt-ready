import { R } from '../lib/appx';
import { Drawer, SecHead, TableWrap } from '../components/ui';
import { IconWarn } from '../components/Icon';
import { C4Verdict } from '../interactives/C4Verdict';
import { METRICS } from '../data/main';

export function S5Verdict() {
  return (
    <section id="s5" className="sec" aria-labelledby="s5-title" data-sec="S5">
      <SecHead id="S5" label="The verdict" title="What PASSED Actually Means"
        lead="PASSED means every category’s workload succeeded, every threshold you set held on final measurements, no health expression fired, and no targeted node was skipped." />
      <div className="callout callout--warn" style={{ maxWidth: '72ch' }} role="note">
        <IconWarn />
        <div>
          <p className="callout__title">No thresholds ship by default.</p>
          <p>Without <R a="anc-thresholds">a threshold</R>, PASSED means the run completed, not that it was fast enough. This follows the v0.6.0 code and the
            launch blog; some docs pages say catalog entries carry per-architecture thresholds (see S7).</p>
        </div>
      </div>
      <div className="prose">
        <ul>
          <li><R a="anc-val-vs-work">Validation is separate from workload success.</R> A run that finishes but misses its target sets <code>ValidationFailed</code>;
            if that is the only cause, the Workflow fails with reason <code>JobValidationFailed</code>.</li>
          <li>Each failed node carries one of three reasons: <code>ThresholdViolation</code>, <code>HardwareFailureDetected</code> (a CEL health expression
            fired mid-run) or <code>WorkloadFailed</code> (non-zero exit or stall).</li>
          <li>Cordoned nodes, and nodes with fewer allocatable GPUs than requested, are excluded before the run. The result is then{' '}
            <R a="anc-incomplete"><code>INCOMPLETE</code></R>, not <code>FAILED</code>.</li>
          <li>Measurements count only when final. <R a="anc-frozen">Goodput is parsed from pod logs and frozen</R> once the run completes; bandwidth is
            judged on the complete final launcher log. A measurement with no data never passes a threshold.</li>
          <li>Time spent <R a="anc-kueue">Kueue-suspended</R> counts toward neither the timeout nor stall detection, so a queued job is not a stalled one.</li>
          <li>Health expressions only read node state; your health stack sets what they match. None ship by default.</li>
        </ul>
        <p>Results land in Kubernetes status (failed nodes in ConfigMaps via <code>failedNodesRef</code>), in a <R a="anc-metrics">JSON results file and Prometheus metrics</R>.</p>
      </div>
      <C4Verdict />
      <div>
        <Drawer title="Results file and Prometheus metrics">
          <p className="small">Overall result: <code>PASSED | INCOMPLETE | FAILED | RUNNING</code>, written as JSON with <code>--results-file</code>.</p>
          <TableWrap label="Results JSON fields">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col">Field</th><th scope="col">Contents</th></tr></thead>
              <tbody>
                <tr><th scope="row"><code>nodeResults[]</code></th><td><code>name, group, rack, status</code></td></tr>
                <tr><th scope="row"><code>categories[]</code></th><td><code>status, failureReason, testScale, nodesPerJob, jobs, mnnvl</code></td></tr>
                <tr><th scope="row"><code>categories[].bandwidth[]</code></th><td><code>size, algBW, busBW, samples</code></td></tr>
                <tr><th scope="row"><code>categories[].domains[]</code></th><td><code>goodput, tflops, stepTime</code></td></tr>
                <tr><th scope="row"><code>categories[].failedGroups[]</code></th><td><code>failureLog {'{'}podName, nodeName, exitCode, tail{'}'}</code></td></tr>
                <tr><th scope="row"><code>categories[].iterations[]</code></th><td>Per-iteration results</td></tr>
              </tbody>
            </table>
          </TableWrap>
          <TableWrap label="Prometheus metrics">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col">Metric</th><th scope="col">Note</th></tr></thead>
              <tbody>{METRICS.map(([m, n]) => <tr key={m}><th scope="row"><code>{m}</code></th><td>{n || '—'}</td></tr>)}</tbody>
            </table>
          </TableWrap>
        </Drawer>
        <Drawer title="Standards NVCRE does not check">
          <ul className="small" style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li>Firmware and driver <R a="anc-matrix">version matrices</R> belong to NVIDIA AI Cluster Runtime (AICR), which captures validated driver,
              operator, kernel and system-setting combinations as version-locked recipes.</li>
            <li>Reference-architecture conformance: not in scope. There is no “certified hardware” programme behind the word certification; treat a PASS as
              local acceptance, not an NVIDIA seal.</li>
            <li>Storage, PCIe-specific and OS checks: not in the catalog. HPL/GEMM appear only indirectly, through DCGM and training TFLOPs.</li>
          </ul>
        </Drawer>
        <Drawer kicker="Secondary reading" title="How trustworthy is the engine itself?">
          <ul className="small" style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li>Validated on 5 platform/GPU combinations at 2–8 nodes, plus a 16-node README run. No published large-scale test; “1,000 nodes per
              replica” is an unbenchmarked docs claim.</li>
            <li>Releases are signed: <R a="anc-supply">cosign signatures, SLSA provenance v1 and CycloneDX SBOMs</R>. Verify by digest.</li>
            <li>v0.6.0 fixed cache-miss-as-deletion (#387/#370), partial-sweep bandwidth verdicts (#418) and the EFA stack silently falling back to TCP
              on AWS H100/GB200 (#434).</li>
            <li>Issue #405 shows why that last one matters. A real log has NCCL load its RDMA plugin and then run over sockets, and NVCRE recorded busBW of
              0.03 GB/s with nothing saying why; AICR’s proposed ADR-025 records ~3 GB/s over TCP where EFA was expected. That is a{' '}
              <R a="anc-tcp-fallback">net plugin falling back from RDMA to TCP</R>.</li>
            <li>End-to-end tests were added in #427; CI on real GPU hardware is unverified. Open bugs: #403 (training and loopback entries render no{' '}
              <code>timeoutPerJob</code>, fix status unverified) and #430 (Workflow name suffix can collide).</li>
          </ul>
        </Drawer>
      </div>
    </section>
  );
}
