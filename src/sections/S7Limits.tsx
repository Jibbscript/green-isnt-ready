import { R } from '../lib/appx';
import { Drawer, Ext, SecHead, TableWrap, Illustrative } from '../components/ui';
import { C5Quiz } from '../interactives/C5Quiz';
import { CATALOG, CATALOG_OPTIONS, DEFAULTS, RUNS, SOURCES, SUPPORT, VALIDATION_RESULTS_URL } from '../data/main';
import { D } from '../lib/data';

export function S7Limits() {
  return (
    <section id="s7" className="sec" aria-labelledby="s7-title" data-sec="S7">
      <SecHead id="S7" label="Limits" title="Limits, Then Check Yourself" lead="Powerful but young. Know the edges." />
      <div className="prose">
        <ul>
          <li>The API is <code>v1alpha1</code> (<R a="anc-api-maturity">API maturity</R>), and NVIDIA’s published validation covers 5 platform/GPU combinations at
            2–8 nodes, plus one 16-node README run.</li>
          <li>Kubernetes-only and NVIDIA-only, with one <R a="anc-homog">GPU product per run</R>. Certify a mixed fleet one product at a time.</li>
          <li><R a="anc-val-cost">It consumes the GPUs it tests.</R> Whole nodes stay busy for the run, and DCGM level 4 alone takes about 90 minutes on healthy hardware.</li>
          <li>No default thresholds or health expressions, and baselines must be <R a="anc-run-length">calibrated to your run length</R>. NVIDIA’s own 50-step GB300
            runs logged goodput 0.57.</li>
          <li>Catalog entries are embedded in the binary, so a new category needs a <R a="anc-catalog">rebuild</R> (or a <code>WorkloadRun</code>).</li>
          <li><code>Certification.spec</code> is <R a="anc-immutable">immutable</R>. To change anything, create a new object.</li>
          <li>Open bugs: #403 (training and loopback entries render no <code>timeoutPerJob</code>) and #430 (Workflow names can collide). Docs contradict each other in places (first drawer below).</li>
          <li>Roadmap, not present: <R a="anc-adr082">inference certification</R> (ADR-082, Proposed), new architectures and automated lifecycle validation.</li>
        </ul>
      </div>
      <C5Quiz />
      <div>
        <Drawer kicker="Open questions" title="Contradictions and version-sensitive details">
          <ul className="small" style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li><b>Thresholds.</b> The Concepts, Interpret and NCCL pages say catalog entries define per-architecture thresholds. The blog, “Your first
              certification” and the <code>pkg/catalog</code> types say none ship. This page sides with “none by default” (newer, code-backed); not every entry YAML was checked.</li>
            <li><b>API group.</b> One RBAC table shows <code>cre.nvidia.com/*</code>; the CRDs are <code>nvcre.nvidia.com/v1alpha1</code>.</li>
            <li><b>LogProfiles.</b> One page says five; four built-ins are named.</li>
            <li><b>GPU lists</b> differ across README versions; the v0.6.0 list is used.</li>
            <li><b>diagnose screening stages:</b> the semantics of each are unverified.</li>
            <li><b>#403</b> fix status in v0.6.0 is unknown; <b>PR #451</b> (DCGM levels 1–3) merge status is unknown.</li>
            <li><b>Scale:</b> “1,000 nodes per replica” is unbenchmarked; published runs are ≤16 nodes. CI on real GPUs is not verified.</li>
            <li><b>Fast-moving:</b> metric renames (<code>_gbps</code> → <code>_gbs</code>), catalog renames (nemotron4-15b → nemotron5-*), the ServiceMonitor <code>honorLabels</code> default flip. The docs version banner also varies by page.</li>
            {D.openQuestions.map((q) => <li key={q}><b>Appendix:</b> {q}</li>)}
          </ul>
        </Drawer>
        <Drawer kicker="§7 data" title="Data appendix" wide>
          <h4 className="h4">Catalog (8 categories in v0.6.0)</h4>
          <TableWrap label="Catalog">
            <table className="tbl tbl--wide">
              <thead><tr><th scope="col">Category</th><th scope="col">Layer exercised</th><th scope="col">Scale behaviour</th><th scope="col">Duration</th><th scope="col">Destructive?</th></tr></thead>
              <tbody>{CATALOG.map((c) => (
                <tr key={c.cat}>
                  <th scope="row"><code>{c.cat}</code></th>
                  <td>{c.cat === 'communication/nccl-loopback-nvswitch' ? <R a="anc-nvswitch">NVSwitch fabric</R> : c.layer}</td>
                  <td>{c.scale}</td><td>{c.duration}</td><td>{c.notes}</td>
                </tr>
              ))}</tbody>
            </table>
          </TableWrap>
          <p className="small">Not in the catalog: storage, PCIe-specific, firmware/driver version or OS checks. <R a="anc-hpl">HPL/GEMM</R> appear only indirectly,
            via DCGM and training TFLOPs. Options worth knowing: {CATALOG_OPTIONS.map((o, i) => <span key={o}>{i ? ', ' : ''}<code>{o}</code></span>)}.</p>

          <h4 className="h4">Published validation results (16 GB message size, busBW in GB/s)</h4>
          <TableWrap label="Published validation results">
            <table className="tbl tbl--wide">
              <thead><tr>
                <th scope="col">Platform / GPU (nodes, fabric)</th><th scope="col">MNNVL</th><th scope="col" className="num">all-reduce</th>
                <th scope="col" className="num">all-gather</th><th scope="col" className="num"><R a="anc-a2a">alltoall</R></th><th scope="col" className="num">goodput / TFLOPs per GPU</th>
              </tr></thead>
              <tbody>{RUNS.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.label}</th><td>{r.mnnvl}</td><td className="num" data-src={r.src}>{r.allReduce.toFixed(2)}</td>
                  <td className="num">{r.allGather?.toFixed(2) ?? '—'}</td><td className="num">{r.alltoall?.toFixed(2) ?? '—'}</td>
                  <td className="num">{r.goodput !== null ? `${r.goodput.toFixed(2)} / ${r.tflops?.toFixed(1)}` : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </TableWrap>
          <p className="small">All PASSED with no thresholds set (<Ext href={VALIDATION_RESULTS_URL}>Validation Results</Ext>; training columns from the superseded <code>nemotron4-15b</code>).
            MNNVL on vs off on AWS GB200 is 882.51 vs 191.40 GB/s. GCP GB200 ×2 shows effectively no MNNVL difference; the cause is unverified.
            This proves the plumbing works on 5 combinations at ≤8 nodes. It is not a scale proof and not a threshold baseline.</p>

          <h4 className="h4">Thresholds and baselines</h4>
          <TableWrap label="Thresholds">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col">Key</th><th scope="col">Form</th><th scope="col">Shipped default?</th></tr></thead>
              <tbody>
                <tr><td><code>busBandwidthGBps</code>, <code>algBandwidthGBps</code></td><td>CEL string, <code>value &gt;= N</code></td><td>None (contested, see above)</td></tr>
                <tr><td><code>goodputRatio</code>, <code>avgTFLOPsPerGPU</code>, <code>avgStepTimeSec</code></td><td>CEL</td><td>None</td></tr>
                <tr><td>Blog examples (GB200 NVL72-class)</td><td>busBW ≥ 900; goodput ≥ 0.9; TFLOPs ≥ 800</td><td>Illustrative only</td></tr>
                <tr><td>Docs heuristic</td><td>goodput below ~0.95 = meaningful overhead</td><td>Heuristic</td></tr>
              </tbody>
            </table>
          </TableWrap>

          <h4 className="h4">Code defaults (pkg/catalog v0.6.0)</h4>
          <TableWrap label="Code defaults">
            <table className="tbl tbl--mid"><tbody>{DEFAULTS.map(([k, v]) => <tr key={k}><th scope="row"><code>{k}</code></th><td className="mono">{v}</td></tr>)}</tbody></table>
          </TableWrap>

          <h4 className="h4">Support matrix</h4>
          <TableWrap label="Support matrix">
            <table className="tbl tbl--mid">
              <tbody>
                {SUPPORT.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{k === 'Hard prerequisites'
                  ? <>NVIDIA GPU Operator (not installed by NVCRE); Kubeflow Trainer 2.2.1 (installed by setup init); Prometheus Operator CRDs or ServiceMonitor off; a <R a="anc-imex">DRA driver for the GB200/GB300 ComputeDomain</R>; standalone DCGM (<code>spec.dcgm.enabled=true</code>) for dcgm-level4</>
                  : v}</td></tr>)}
                <tr><th scope="row">GPU architectures</th><td><R a="anc-gpus">GB200, GB300, H100, H200, B200, A100, L40S, L40, RTX PRO 6000 Blackwell</R> (GCP overlays, v0.6.0)</td></tr>
                <tr><th scope="row">Interconnects in the docs</th><td>AWS EFA (H100 <code>vpc.amazonaws.com/efa: 32</code>; GB200 <code>efa: 4</code> + <code>hugepages-2Mi</code>), RoCE (AWS GB300, GCP GB200), GCP TCPXO (H100), InfiniBand (Nscale NKS via DRA, PR #380), MNNVL on GB200/GB300 (default on)</td></tr>
              </tbody>
            </table>
          </TableWrap>
          <p className="small muted">Metrics are listed under S5 › Results file and Prometheus metrics.</p>
        </Drawer>
        <Drawer kicker="Sources" title="Where every number comes from">
          <p className="small">Design-outline sources (§10). Fundamentals sources live in the <a href="#appendix/registry">appendix registry</a>.</p>
          <ol className="small" style={{ display: 'grid', gap: '0.25rem', paddingLeft: '1.5rem', listStyle: 'decimal', overflowWrap: 'anywhere' }}>
            {SOURCES.map((s) => <li key={s}><Ext href={s}>{s.replace(/^https:\/\//, '')}</Ext></li>)}
          </ol>
          <p className="small muted">The blockchain.news item is cited only for the v0.3.0 date and is a low-quality source.</p>
        </Drawer>
        <Drawer kicker="Supply chain" title="Verify the release before you install">
          <div className="btn-row"><Illustrative>Template</Illustrative><span className="small muted">Take the certificate identity and issuer from the v0.6.0 release notes.</span></div>
          <pre className="code" tabIndex={0} aria-label="cosign verification template">{`# pin by digest, then verify the signature
cosign verify \\
  <image>@sha256:<digest> \\
  --certificate-identity-regexp '<from release notes>' \\
  --certificate-oidc-issuer '<from release notes>'`}</pre>
        </Drawer>
      </div>
    </section>
  );
}
