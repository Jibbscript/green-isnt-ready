// Logic tests for C3 (diagnose), C4 (verdict rules) and the constraint explorer.
// Run: node --experimental-strip-types scripts/test-logic.ts
import { simulate, failsProbe, fmtNodes } from '../src/lib/diagnose.ts';
import { verdict } from '../src/lib/c4.ts';
import { algBWFromBus, ringTimeSec, stragglerThroughput, clusterMTBF, LLAMA3_COMPONENT_MTBF_H, LLAMA3_HOURS_PER_INTERRUPTION } from '../src/lib/explorer.ts';

let pass = 0, fail = 0;
const ok = (c: boolean, m: string) => { if (c) pass++; else { fail++; console.log('  ✕ ' + m); } };
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

// C3 — every fault position, both kinds, both minGroupSize values must confirm exactly the faulty node
for (const kind of ['nvlink', 'nic'] as const) for (const m of [2, 4]) for (let f = 0; f < 16; f++) {
  const r = simulate(kind, f, m);
  ok(r.confirmed.length === 1 && r.confirmed[0] === f, `${kind} m=${m} f=${f}: confirmed ${r.confirmed}`);
  ok(r.suspects.length <= m, `${kind} m=${m} f=${f}: ${r.suspects.length} suspects > m`);
  ok(r.suspects.includes(f), `${kind} m=${m} f=${f}: faulty not among suspects`);
  ok(r.boundary === (kind === 'nic'), `${kind} m=${m} f=${f}: boundary flag ${r.boundary}`);
  const names = r.stages.map((s) => s.name);
  ok(names[0] === 'intra-screening' && names.at(-1) === 'complete', `${kind}: stage order ${names}`);
  if (kind === 'nic') ok(names.includes('cross-boundary'), 'nic must reach cross-boundary');
  if (kind === 'nvlink') ok(!names.includes('cross-boundary'), 'nvlink must not reach cross-boundary');
}
const ex = simulate('nvlink', 7, 2);
console.log(`  nvlink@07 m=2: runs ${ex.runs}, stages ${ex.stages.map((s) => s.name + (s.round ? '#' + s.round : '')).join(' → ')}`);
const ex2 = simulate('nic', 12, 2);
console.log(`  nic@12   m=2: runs ${ex2.runs}, stages ${ex2.stages.map((s) => s.name + (s.round ? '#' + s.round : '')).join(' → ')}`);
ok(failsProbe('nic', 12, [8, 9, 12]) === false, 'nic fault invisible inside one domain');
ok(failsProbe('nic', 12, [0, 12]) === true, 'nic fault visible across domains');
ok(fmtNodes([0, 1, 2, 3, 8, 9, 10, 11]) === '00–03, 08–11', 'fmtNodes ranges');
ok(fmtNodes([4, 12]) === '04, 12', 'fmtNodes pair');

// C4 — rules from design outline §1.7
const base = { metric: 'busBW' as const, value: 882.51, thresholdOn: true, threshold: 900, exitedOk: true, healthFired: false, cordoned: false, logsUnavailable: false, nodes: 4 };
let v = verdict(base);
ok(v.result === 'FAILED' && v.jobValidationFailed && v.workflowReason === 'JobValidationFailed' && v.nodes.every((n) => n.reason === 'ThresholdViolation'), 'finished but missed → FAILED/ThresholdViolation, JobValidationFailed');
v = verdict({ ...base, threshold: 800 });
ok(v.result === 'PASSED' && !v.noThresholdWarning, 'met threshold → PASSED');
v = verdict({ ...base, thresholdOn: false });
ok(v.result === 'PASSED' && v.noThresholdWarning, 'no threshold → PASSED + warning');
v = verdict({ ...base, threshold: 800, cordoned: true });
ok(v.result === 'INCOMPLETE' && v.excluded.length === 1, 'excluded node + otherwise passing → INCOMPLETE');
v = verdict({ ...base, threshold: 900, cordoned: true });
ok(v.result === 'FAILED', 'excluded node + threshold miss → FAILED');
v = verdict({ ...base, threshold: 800, healthFired: true });
ok(v.result === 'FAILED' && v.nodes.some((n) => n.reason === 'HardwareFailureDetected') && v.workflowReason === null, 'health fired → FAILED/HardwareFailureDetected');
v = verdict({ ...base, threshold: 800, exitedOk: false });
ok(v.result === 'FAILED' && v.nodes.some((n) => n.reason === 'WorkloadFailed'), 'non-zero exit → FAILED/WorkloadFailed');
v = verdict({ ...base, threshold: 1, logsUnavailable: true });
ok(v.result === 'FAILED' && v.jobValidationFailed && v.measurement === 'LogsUnavailable', 'logs unavailable never passes a threshold');
v = verdict({ ...base, thresholdOn: false, logsUnavailable: true });
ok(v.result === 'PASSED' && v.noThresholdWarning, 'logs unavailable + no threshold → PASSED (informational)');
v = verdict({ ...base, metric: 'goodput', value: 0.57, threshold: 0.9 });
ok(v.result === 'FAILED', 'GB300 goodput 0.57 vs goodputRatio ≥ 0.9 → FAILED');
v = verdict({ ...base, metric: 'goodput', value: 0.57, thresholdOn: false });
ok(v.result === 'PASSED', 'GB300 goodput 0.57 with no threshold → PASSED (as published)');

// Explorer — f-02, f-09, f-13, f-15 and the derived defaults
ok(near(algBWFromBus(882.51, 16), 470.672, 0.001), 'algBW = busBW·n/(2(n−1))');
ok(near(ringTimeSec(16, 882.51, 16), 16 / algBWFromBus(882.51, 16), 1e-9), 'ring time = S/algBW');
ok(near(stragglerThroughput(8), 0.92593, 1e-4), '8% straggler → 92.6%');
ok(near(LLAMA3_HOURS_PER_INTERRUPTION, 3.0931, 1e-3), 'Llama 3 ≈ one interruption every ~3.09 h');
ok(near(clusterMTBF(LLAMA3_COMPONENT_MTBF_H, 16384), LLAMA3_HOURS_PER_INTERRUPTION, 1e-9), 'f-15 round-trips at 16,384 GPUs');
console.log(`  implied component MTBF ≈ ${Math.round(LLAMA3_COMPONENT_MTBF_H).toLocaleString()} h`);
// spec arithmetic spot checks
ok(near(882.51 / 191.40, 4.611, 0.001), 'MNNVL on/off ratio ≈ 4.6×');
ok(near(989 / 3.35, 295.2, 0.1), 'H100 ops:byte ≈ 295');
ok(near((2 - 1) / (8 + 2 - 1), 1 / 9, 1e-12) && near((4 - 1) / 8, 0.375, 1e-12), 'pipeline bubble forms (p−1)/(m+p−1) and (p−1)/m');

console.log(`\nlogic: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
