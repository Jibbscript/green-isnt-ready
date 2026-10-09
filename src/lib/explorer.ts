// Readiness constraint explorer math (§19). First-order, illustrative.
// f-02: busBW = algBW · 2(n−1)/n for all-reduce  →  algBW = busBW · n / (2(n−1))
export const algBWFromBus = (busBW: number, n: number) => (n > 1 ? (busBW * n) / (2 * (n - 1)) : busBW);
// f-09 with B = busBW: t ≈ 2(n−1)/n · S/B  (= S / algBW)
export const ringTimeSec = (sizeGB: number, busBW: number, n: number) => (busBW > 0 && n > 1 ? ((2 * (n - 1)) / n) * (sizeGB / busBW) : NaN);
// f-13: one rank x% slower stretches every synchronous step by (1 + x)
export const stragglerThroughput = (pct: number) => 1 / (1 + pct / 100);
// f-15: cluster MTBF ≈ component MTBF / N
export const clusterMTBF = (componentHours: number, n: number) => (n > 0 ? componentHours / n : NaN);
// Default component MTBF implied by Llama 3 (§1.2): 419 unexpected interruptions in 54 days on 16,384 GPUs,
// charging every interruption to a GPU (an overestimate of per-GPU failure rate).
export const LLAMA3_HOURS_PER_INTERRUPTION = (54 * 24) / 419;
export const LLAMA3_COMPONENT_MTBF_H = LLAMA3_HOURS_PER_INTERRUPTION * 16384;
