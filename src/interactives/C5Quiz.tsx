import { useId, useState } from 'react';
import { Stage, Status } from '../components/ui';
import { Fund } from '../lib/appx';
import { readLS, writeLS } from '../lib/storage';

const QS = [
  { q: 'All-reduce finished OK, but busBW was below your threshold. What is the result?', opts: ['PASSED: the workload succeeded', 'FAILED with ThresholdViolation (Job condition ValidationFailed)', 'INCOMPLETE'], a: 1,
    why: 'A threshold miss fails the run even when the workload exits cleanly. Validation is separate from workload success.', refs: ['a-nvcre-verdicts', 'a-readiness'] },
  { q: 'A node was cordoned before the run and everything else passes. What is the result?', opts: ['FAILED', 'INCOMPLETE', 'PASSED'], a: 1,
    why: 'Cordoned nodes are excluded before the run, and an otherwise passing result becomes INCOMPLETE, not FAILED.', refs: ['a-nvcre-verdicts', 'd-taints'] },
  { q: 'Which testScale measures the scale-out fabric rather than NVLink?', opts: ['intra-node', 'intra-rack', 'full-scale'], a: 2,
    why: 'full-scale crosses NVLink domains, so traffic has to use the scale-out fabric. intra-rack stays inside one gpu.clique.', refs: ['a-nvcre-testscale', 'a-nvlink-domain'] },
  { q: 'Who taints the failed node?', opts: ['NVCRE, when it writes the verdict', 'Your platform, or NVSentinel’s Certification Monitor', 'Kubeflow Trainer'], a: 1,
    why: 'NVCRE never cordons or taints. NVSentinel’s monitor applies a NoSchedule taint without cordoning, so reruns can still land.', refs: ['d-taints', 'a-nvidia-stack'] },
  { q: 'Your team wants firmware-version drift detection. Is that NVCRE?', opts: ['Yes, it is a catalog category', 'No, that is AICR', 'No, that is DCGM level 4'], a: 1,
    why: 'Version and configuration conformance live in AICR’s version-locked recipes. NVCRE checks behaviour under load.', refs: ['a-stack-compat'] },
];
const KEY = 'nvcre-quiz-done';

export function C5Quiz() {
  const uid = useId().replace(/:/g, '');
  const [ans, setAns] = useState<(number | null)[]>(() => QS.map(() => null));
  const [doneBefore] = useState(() => readLS(KEY) === '1');
  const answered = ans.filter((a) => a !== null).length;
  const correct = ans.filter((a, i) => a === QS[i].a).length;
  const pick = (qi: number, oi: number) => {
    setAns((prev) => {
      const next = prev.slice();
      next[qi] = oi;
      if (next.every((x) => x !== null)) writeLS(KEY, '1');
      return next;
    });
  };
  return (
    <Stage id="C5" title="Check yourself" badge={<span className="badge">5 questions · no score kept</span>}>
      {doneBefore ? <p className="small muted">You have finished this check before on this device.</p> : null}
      <div className="quiz">
        {QS.map((q, qi) => {
          const a = ans[qi];
          return (
            <fieldset className="q" key={qi}>
              <legend>{qi + 1}. {q.q}</legend>
              <div className="q__opts">
                {q.opts.map((o, oi) => (
                  <label className="q__opt" key={oi}>
                    <input type="radio" name={`${uid}-q${qi}`} checked={a === oi} onChange={() => pick(qi, oi)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="q__fb" aria-live="polite">
                {a !== null ? (
                  <>
                    {a === q.a ? <Status kind="pass">Correct</Status> : <Status kind="fail">Not quite. Answer: {q.opts[q.a]}</Status>}
                    <p>{q.why}</p>
                    <p className="muted">Refresh: {q.refs.map((r, i) => <span key={r}>{i ? ' · ' : ''}<Fund id={r} /></span>)}</p>
                  </>
                ) : null}
              </div>
            </fieldset>
          );
        })}
      </div>
      <div className="btn-row" aria-live="polite">
        <span className="small">{answered < QS.length ? `${answered} of ${QS.length} answered` : `Done: ${correct} of ${QS.length} correct.`}</span>
        {answered ? <button type="button" className="btn btn--quiet" onClick={() => setAns(QS.map(() => null))}>Start over</button> : null}
      </div>
    </Stage>
  );
}

export const QUIZ_REFS = QS.flatMap((q) => q.refs);
