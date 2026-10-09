// C3 diagnose model. Stage names and the algorithm's shape follow design outline §1.8:
// screening (one group per topology domain) → bisection (halve failing groups, split by domain,
// stop at minGroupSize) → DetectBothHalvesPass → cross-boundary mixed probes → confirmation
// (suspect + known-healthy node). Group sizes and bandwidth numbers are illustrative placeholders.
export type FaultKind = 'nvlink' | 'nic';
export const N = 16;
export const DOMAIN_A = Array.from({ length: 8 }, (_, i) => i);
export const DOMAIN_B = Array.from({ length: 8 }, (_, i) => i + 8);
export const THRESHOLD = 90;
export const HEALTHY_BW = 100;
export const FAULT_BW: Record<FaultKind, number> = { nvlink: 62, nic: 34 };

export interface Probe { nodes: number[]; result: 'pass' | 'fail'; bw: number; reused?: boolean; label?: string }
export interface Stage { key: string; name: string; round?: number; note: string; probes: Probe[]; skipped?: boolean }
export interface DiagResult { stages: Stage[]; suspects: number[]; confirmed: number[]; runs: number; boundary: boolean }

const spans = (nodes: number[]) => nodes.some((n) => n < 8) && nodes.some((n) => n >= 8);

export function failsProbe(kind: FaultKind, faulty: number, nodes: number[]): boolean {
  if (!nodes.includes(faulty)) return false;
  return kind === 'nvlink' ? true : spans(nodes);
}

export function simulate(kind: FaultKind, faulty: number, minGroupSize: number): DiagResult {
  const m = Math.max(2, minGroupSize);
  const probe = (nodes: number[], label?: string): Probe => {
    const bad = failsProbe(kind, faulty, nodes);
    return { nodes, result: bad ? 'fail' : 'pass', bw: bad ? FAULT_BW[kind] : HEALTHY_BW, label };
  };
  const stages: Stage[] = [];

  const intra = [probe(DOMAIN_A, 'clique-a'), probe(DOMAIN_B, 'clique-b')];
  stages.push({ key: 'intra', name: 'intra-screening', note: 'One group per NVLink domain (topology key nvidia.com/gpu.clique).', probes: intra });
  stages.push({ key: 'intra-no-nvl', name: 'intra-screening-no-nvl', skipped: true, note: 'This stage exists in NVCRE, but its exact semantics are unverified, so the model skips it.', probes: [] });
  const inter = [probe([...DOMAIN_A, ...DOMAIN_B], 'cross-domain')];
  stages.push({ key: 'inter', name: 'inter-screening', note: 'One cross-domain group exercises the scale-out fabric.', probes: inter });

  let suspects: number[] = [];
  let boundary = false;
  const failedIntra = intra.filter((p) => p.result === 'fail').map((p) => p.nodes);

  if (failedIntra.length) {
    let queue = failedIntra;
    let round = 1;
    while (queue.some((g) => g.length > m)) {
      const probes: Probe[] = [];
      const next: number[][] = [];
      for (const g of queue) {
        if (g.length <= m) { next.push(g); continue; }
        const h = Math.ceil(g.length / 2);
        const L = g.slice(0, h);
        const Rr = g.slice(h);
        const pl = probe(L);
        const pr = probe(Rr);
        probes.push(pl, pr);
        if (pl.result === 'fail') next.push(L);
        if (pr.result === 'fail') next.push(Rr);
        if (pl.result === 'pass' && pr.result === 'pass') boundary = true;
      }
      stages.push({ key: `bis-${round}`, name: 'bisection', round, note: `Halve each failing group; stop at minGroupSize ${m}.`, probes });
      queue = next;
      round += 1;
    }
    suspects = queue.flat();
  } else if (inter[0].result === 'fail') {
    stages.push({
      key: 'bis-1', name: 'bisection', round: 1,
      note: 'Split the failing cross-domain group by topology domain. Both halves already passed in intra-screening (results reused), so the both-halves-pass check flags a boundary fault.',
      probes: [{ ...probe(DOMAIN_A, 'clique-a'), reused: true }, { ...probe(DOMAIN_B, 'clique-b'), reused: true }],
    });
    boundary = true;
    let SA = DOMAIN_A.slice();
    let SB = DOMAIN_B.slice();
    let round = 1;
    while (SA.length + SB.length > m) {
      const ha = Math.ceil(SA.length / 2);
      const hb = Math.ceil(SB.length / 2);
      const A1 = SA.slice(0, ha), A2 = SA.slice(ha), B1 = SB.slice(0, hb), B2 = SB.slice(hb);
      const p1 = probe([...A1, ...B1]);
      const p2 = probe([...A2, ...B2]);
      stages.push({ key: `cb-${round}`, name: 'cross-boundary', round, note: 'Mixed probes pair half of each domain; keep the halves inside the probe that fails.', probes: [p1, p2] });
      if (p1.result === 'fail') { SA = A1; SB = B1; } else if (p2.result === 'fail') { SA = A2; SB = B2; } else break;
      round += 1;
    }
    suspects = [...SA, ...SB];
  }

  // known-healthy = members of passing probes that exercised the faulty fabric
  const healthy = new Set<number>();
  for (const st of stages) for (const p of st.probes) {
    if (p.result === 'pass' && (kind === 'nvlink' || spans(p.nodes))) p.nodes.forEach((n) => healthy.add(n));
  }
  suspects.forEach((s) => healthy.delete(s));
  const pick = (s: number) => {
    const sameA = s < 8;
    const pool = [...healthy].filter((h) => (kind === 'nic' ? (h < 8) !== sameA : (h < 8) === sameA));
    return pool[0] ?? [...healthy][0] ?? (s === 0 ? 1 : 0);
  };
  const conf = suspects.map((s) => {
    const partner = pick(s);
    return probe([s, partner].sort((a, b) => a - b), `suspect ${s} + healthy ${partner}`);
  });
  if (suspects.length) stages.push({ key: 'confirm', name: 'confirmation', note: 'Pair each suspect with a known-healthy node; only the faulty node keeps failing.', probes: conf });
  const confirmed = suspects.filter((_, i) => conf[i].result === 'fail');
  stages.push({ key: 'complete', name: 'complete', note: confirmed.length ? 'Suspect confirmed.' : 'No single node confirmed.', probes: [] });

  const runs = stages.reduce((n, st) => n + st.probes.filter((p) => !p.reused).length, 0);
  return { stages, suspects, confirmed, runs, boundary };
}

export function fmtNodes(nodes: number[]): string {
  const s = [...nodes].sort((a, b) => a - b);
  const out: string[] = [];
  let i = 0;
  const p = (n: number) => String(n).padStart(2, '0');
  while (i < s.length) {
    let j = i;
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j += 1;
    out.push(j - i >= 2 ? `${p(s[i])}–${p(s[j])}` : s.slice(i, j + 1).map(p).join(', '));
    i = j + 1;
  }
  return out.join(', ');
}
