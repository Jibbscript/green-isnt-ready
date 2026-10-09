// C4 verdict rules — a direct transcription of design outline §1.7 (no invented behaviour).
export type Metric = 'busBW' | 'goodput' | 'tflops';
export const METRIC_KEY: Record<Metric, string> = {
  busBW: 'busBandwidthGBps',
  goodput: 'goodputRatio',
  tflops: 'avgTFLOPsPerGPU',
};
export const METRIC_CATEGORY: Record<Metric, string> = {
  busBW: 'communication/nccl-all-reduce',
  goodput: 'training/nemotron4-15b',
  tflops: 'training/nemotron4-15b',
};

export interface VerdictIn {
  metric: Metric;
  value: number | null;
  thresholdOn: boolean;
  threshold: number;
  exitedOk: boolean;
  healthFired: boolean;
  cordoned: boolean;
  logsUnavailable: boolean;
  nodes: number;
}
export type CondState = 'ok' | 'fail' | 'warn' | 'na';
export interface Cond { id: string; label: string; state: CondState; detail: string }
export interface NodeRow { node: string; reason: 'ThresholdViolation' | 'HardwareFailureDetected' | 'WorkloadFailed'; message: string }
export interface VerdictOut {
  result: 'PASSED' | 'INCOMPLETE' | 'FAILED';
  nodes: NodeRow[];
  excluded: string[];
  conds: Cond[];
  jobValidationFailed: boolean;
  workflowReason: string | null;
  noThresholdWarning: boolean;
  measurement: 'Complete' | 'LogsUnavailable';
}

export const nodeName = (i: number) => `gpu-node-${String(i).padStart(2, '0')}`;
export const fmt = (m: Metric, v: number) => (m === 'goodput' ? v.toFixed(2) : m === 'tflops' ? v.toFixed(1) : v.toFixed(2));

export function verdict(i: VerdictIn): VerdictOut {
  const conds: Cond[] = [];
  const rows: NodeRow[] = [];
  const excluded = i.cordoned ? [nodeName(3)] : [];
  const fails = { workload: false, health: false, threshold: false };

  conds.push(i.cordoned
    ? { id: 'excl', label: 'All targeted nodes eligible', state: 'warn', detail: `${nodeName(3)} excluded before the run (exclusionReason: cordoned)` }
    : { id: 'excl', label: 'All targeted nodes eligible', state: 'ok', detail: 'No node excluded' });

  if (!i.exitedOk) {
    fails.workload = true;
    rows.push({ node: nodeName(5), reason: 'WorkloadFailed', message: 'non-zero exit or stall; read failedGroups[].failureLog.tail' });
  }
  conds.push({ id: 'exit', label: 'Workload exited OK', state: i.exitedOk ? 'ok' : 'fail', detail: i.exitedOk ? 'Exit code 0' : 'Non-zero exit or stall → WorkloadFailed' });

  if (i.healthFired) {
    fails.health = true;
    rows.push({ node: nodeName(12), reason: 'HardwareFailureDetected', message: 'a CEL health expression matched during the run' });
  }
  conds.push({ id: 'health', label: 'No health expression fired', state: i.healthFired ? 'fail' : 'ok', detail: i.healthFired ? `Fired on ${nodeName(12)} → HardwareFailureDetected` : 'Nothing matched' });

  const measurement = i.logsUnavailable ? 'LogsUnavailable' : 'Complete';
  conds.push({ id: 'meas', label: 'Measurement final', state: i.logsUnavailable ? 'warn' : 'ok', detail: i.logsUnavailable ? 'Ended LogsUnavailable: it can never pass a threshold' : 'Judged on the complete final log' });

  const key = METRIC_KEY[i.metric];
  if (!i.thresholdOn) {
    conds.push({ id: 'thr', label: 'Threshold held', state: 'na', detail: 'No threshold set, so nothing was judged' });
  } else if (i.logsUnavailable || i.value === null) {
    fails.threshold = true;
    conds.push({ id: 'thr', label: 'Threshold held', state: 'fail', detail: `${key}: "value >= ${i.threshold}" has no data to pass → ValidationFailed` });
  } else if (i.value >= i.threshold) {
    conds.push({ id: 'thr', label: 'Threshold held', state: 'ok', detail: `${fmt(i.metric, i.value)} ≥ ${i.threshold}` });
  } else {
    fails.threshold = true;
    conds.push({ id: 'thr', label: 'Threshold held', state: 'fail', detail: `${fmt(i.metric, i.value)} < ${i.threshold} → ValidationFailed` });
  }
  if (fails.threshold) {
    const last = Math.max(0, i.nodes - 1);
    rows.push({ node: `${nodeName(0)}…${nodeName(last)}`, reason: 'ThresholdViolation', message: `every node in the group that missed ${key}` });
  }

  const anyFail = fails.workload || fails.health || fails.threshold;
  const result: VerdictOut['result'] = anyFail ? 'FAILED' : i.cordoned ? 'INCOMPLETE' : 'PASSED';
  const onlyThreshold = fails.threshold && !fails.workload && !fails.health;
  return {
    result,
    nodes: rows,
    excluded,
    conds,
    jobValidationFailed: fails.threshold,
    workflowReason: onlyThreshold ? 'JobValidationFailed' : null,
    noThresholdWarning: !i.thresholdOn && !anyFail,
    measurement,
  };
}
