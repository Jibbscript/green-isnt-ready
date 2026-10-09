import { useState } from 'react';
import { R } from '../lib/appx';
import { IconArrowUR, IconBolt, IconCheck, IconReset, IconX } from '../components/Icon';
import { Status } from '../components/ui';

const NODES = Array.from({ length: 16 }, (_, i) => i);
const FAILING = 7;

export function S1Hero() {
  const [loaded, setLoaded] = useState(false);
  return (
    <section id="s1" className="sec hero" aria-labelledby="s1-title" data-sec="S1">
      <div className="prose" style={{ gap: '0.75rem' }}>
        <p className="eyebrow"><span className="eyebrow__id">S1</span><span>The 60-second skim</span></p>
        <h1 className="h1" id="s1-title" tabIndex={-1}>Green Isn’t Ready</h1>
        <p className="kicker">Inside NVCRE’s workload-driven certification</p>
        <p className="lead">
          NVIDIA Cluster Readiness Engine (NVCRE) is a Kubernetes controller that proves <R a="anc-readiness">GPU cluster readiness</R> by
          running real distributed workloads and naming every node that fails, with a machine-readable reason. It never
          cordons, taints or patches a node.
        </p>
      </div>

      <div className="hero__grid">
        <div className="cluster" aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="small muted mono">16 nodes · health checks green</span>
            <button type="button" className="btn" onClick={() => setLoaded((v) => !v)} aria-pressed={loaded}>
              {loaded ? <><IconReset />Reset</> : <><IconBolt />Apply load</>}
            </button>
          </div>
          <div className="cluster__grid" role="img" aria-label={loaded ? `16 nodes; gpu-node-0${FAILING} fails under load, the rest pass` : '16 nodes, all health checks passing'}>
            {NODES.map((n) => {
              const bad = loaded && n === FAILING;
              return (
                <span key={n} className={bad ? 'tile tile--fail' : 'tile tile--pass'} aria-hidden="true">
                  {bad ? <IconX /> : <IconCheck />}
                  {String(n).padStart(2, '0')}
                </span>
              );
            })}
          </div>
          <p className="small">
            {loaded
              ? <>gpu-node-07 misses its bandwidth bar under load. Its health checks are still green.</>
              : <>Every tile is healthy. One will fail under load.</>}
          </p>
        </div>

        <div className="verdict-card" aria-label="Example failed certification report">
          <div className="verdict-card__head">
            <span className="small mono muted">Certification result</span>
            <Status kind="fail" pill>FAILED</Status>
          </div>
          <div className="verdict-card__rows" role="table" aria-label="Failed nodes">
            <div className="verdict-card__row verdict-card__row--head" role="row"><span role="columnheader">Node</span><span role="columnheader">Reason</span></div>
            <div className="verdict-card__row" role="row"><span role="cell">gpu-node-07</span><span role="cell"><R a="anc-reasons">ThresholdViolation</R></span></div>
            <div className="verdict-card__row" role="row"><span role="cell">gpu-node-12</span><span role="cell">HardwareFailureDetected</span></div>
          </div>
          <p className="verdict-card__foot">As in NVIDIA’s launch post.</p>
        </div>
      </div>

      <div className="pillars" aria-label="Three ideas">
        <div className="pillar"><span className="pillar__k">Hidden faults</span><span className="pillar__v"><R a="anc-green-not-ready">Health checks pass, the workload fails</R></span></div>
        <div className="pillar"><span className="pillar__k">Scale-aware search</span><span className="pillar__v">Topology-aware groups and bisection name the node</span></div>
        <div className="pillar"><span className="pillar__k">Explicit verdict</span><span className="pillar__v">Machine-readable reasons; quarantine is another tool’s job</span></div>
      </div>

      <p className="facts" aria-label="Facts">
        <span>v0.6.0</span><span aria-hidden>·</span><span>Apache-2.0</span><span aria-hidden>·</span>
        <span><R a="anc-k8s-version">Kubernetes ≥1.29</R></span><span aria-hidden>·</span>
        <span><R a="anc-crd-version"><code>nvcre.nvidia.com/v1alpha1</code></R></span>
      </p>
    </section>
  );
}

export function ReadingGuide() {
  return (
    <aside className="legend-strip" aria-label="How to read this page">
      <strong>How to read:</strong> the hero is the 60-second skim; S2–S7 take about 10 minutes. <em>Go deeper</em> drawers hold the detail, and
      dotted terms <span className="ref-anchor" aria-hidden style={{ cursor: 'default' }}>like this<IconArrowUR className="ref-anchor__glyph" /></span> open a refresher.
    </aside>
  );
}
