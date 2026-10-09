import { R } from '../lib/appx';
import { Drawer, SecHead, TableWrap, Illustrative } from '../components/ui';
import { C1Hierarchy } from '../interactives/C1Hierarchy';
import { CRDS } from '../data/main';

export function S3Model() {
  return (
    <section id="s3" className="sec" aria-labelledby="s3-title" data-sec="S3">
      <SecHead id="S3" label="Mental model" title="One Tree, Three Tiers" lead="NVCRE’s API composes the way Kubernetes does, and results flow back up the same tree." />
      <div className="prose">
        <p>
          You create one object and <R a="anc-reconcile">reconcilers</R> create the rest, the way a{' '}
          <R a="anc-ownership">Deployment owns ReplicaSets that own Pods</R>. Three tiers do the work:
        </p>
        <ul>
          <li><code>Certification</code>: what you create. Target nodes plus the categories to run.</li>
          <li><code>Workflow</code>: one per category. It resolves the catalog entry, applies platform and GPU overrides as a{' '}
            <R a="anc-patch">strategic-merge or RFC 6902 patch</R>, runs iterations and groups the nodes.</li>
          <li><code>Job</code>: one per node group. It launches the workload through an adapter (today a Kubeflow Trainer{' '}
            <R a="anc-trainjob">TrainJob</R>), evaluates CEL health expressions while it runs, owns the measurements and restarts from checkpoint.</li>
        </ul>
        <p>
          <code>WorkloadRun</code> is the side door: one ad hoc run that skips the catalog. Platform and GPU are detected automatically from{' '}
          <R a="anc-node-labels"><code>spec.providerID</code> and <code>nvidia.com/gpu.product</code></R> (or DRA ResourceSlices since v0.6.0).
          Workflows run one after another; groups inside a Workflow can run in parallel.
        </p>
        <p>
          Every tier reports through <R a="anc-crd">CRD status conditions</R> (InProgress, Succeeded and Failed are mutually exclusive), so a failed node
          can be traced from Job to Certification.
        </p>
      </div>
      <C1Hierarchy />
      <div>
        <Drawer title="The seven CRDs">
          <TableWrap label="NVCRE custom resources">
            <table className="tbl tbl--mid">
              <thead><tr><th scope="col">CRD</th><th scope="col">Cardinality</th><th scope="col">Role</th></tr></thead>
              <tbody>{CRDS.map(([n, c, r]) => <tr key={n}><th scope="row"><code>{n}</code></th><td>{c}</td><td>{r}</td></tr>)}</tbody>
            </table>
          </TableWrap>
          <p className="small muted">API group <code>nvcre.nvidia.com/v1alpha1</code>. One docs RBAC table still shows <code>cre.nvidia.com/*</code>, likely a stale rename.</p>
        </Drawer>
        <Drawer title="Reconciler patterns and a minimal Certification">
          <ul className="small" style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
            <li>One binary, six reconcilers, built with <R a="anc-kubebuilder">Kubebuilder</R>; modelled on Deployment → ReplicaSet → Pod.</li>
            <li><code>setExclusiveCondition()</code> keeps InProgress, Succeeded and Failed mutually exclusive at every tier.</li>
            <li><code>Owns()</code> <R a="anc-requeue">watches give event-driven reconciles, with a 15-second polling safety net</R>.</li>
            <li>Default concurrency: 10 reconciles per main controller and 5 per measurement controller
              (<code>manager.maxConcurrentReconciles</code>, <code>manager.measurementMaxConcurrentReconciles</code>).</li>
          </ul>
          <div className="btn-row"><Illustrative>Shape, not schema</Illustrative><span className="small muted">Check field names against the Certification API reference.</span></div>
          <pre className="code" tabIndex={0} aria-label="Example Certification manifest">{`apiVersion: nvcre.nvidia.com/v1alpha1
kind: Certification
metadata:
  name: gb200-acceptance
spec:
  # target nodes: selector (see API reference)
  categories:
    - name: communication/nccl-all-reduce
      options:
        testScale: intra-rack
        thresholds:
          busBandwidthGBps: "value >= 900"
    - name: diagnostics/dcgm-level4`}</pre>
        </Drawer>
      </div>
    </section>
  );
}
