// Source of truth for the Fundamentals Appendix (§11–§23).
// scripts/build-data.mjs lints this file, derives backlinks and emits data/appendix.json,
// which is injected into the page as <script type="application/json" id="appendix-data">.

export const VERSION = '2026-10-08';
const V = VERSION;

// ───────────────────────────── modules ─────────────────────────────
export const modules = [
  {
    id: 'a', label: 'Infra', icon: 'rack',
    title: 'AI Infrastructure System Design (incl. HPC)',
    intro: 'A GPU cluster is a single machine only when every layer agrees: GPUs, NVLink domains, NICs, fabric, drivers, schedulers and storage. Readiness is the evidence that they agree under real load. This module refreshes the physical and platform layers NVCRE exercises. Read it as a map of where faults hide and which tool can see them.',
    selfCheck: [
      'Can you explain why a cluster passing DCGM level 4 can still fail full-scale all-reduce?',
      'Can you explain what NVSentinel does that NVCRE deliberately doesn’t?',
      'Can you explain why an MNNVL-disabled GB200 run shows ~4.6× lower busBW?',
    ],
  },
  {
    id: 'b', label: 'Inference', icon: 'stream',
    title: 'Inference Engineering',
    intro: 'Inference is an operation, not a project. Load is set by users, latency has SLOs, and cost scales with success. An LLM request has two phases: compute-bound prefill and bandwidth-bound decode. Most serving techniques trade between them. This module covers what an inference-cluster operator must reason about, and how far today’s training-oriented readiness checks get you.',
    selfCheck: [
      'Can you explain why decode on H100 at batch 1 is memory-bound?',
      'Can you explain why disaggregation turns the scale-out fabric into a latency-critical path?',
      'Can you explain what ADR-082 v1 would NOT certify?',
    ],
  },
  {
    id: 'c', label: 'Kernels', icon: 'chip',
    title: 'GPU Kernel Engineering',
    intro: 'Most cluster symptoms trace back to kernels: whether they saturate HBM or tensor cores, and whether collectives steal SMs. You don’t need to write CUDA to operate a cluster. You do need the roofline intuition and to know what NCCL kernels compete for.',
    selfCheck: [
      'Can you explain why doubling FLOPs doesn’t speed up decode?',
      'Can you explain why a collective can slow a concurrent GEMM?',
    ],
  },
  {
    id: 'd', label: 'Distributed', icon: 'nodes',
    title: 'Distributed Systems',
    intro: 'A synchronous training job is a distributed system whose step time is its slowest member. NVCRE itself is a Kubernetes controller that reconciles desired state. This module refreshes both sides: failure models (gray, fail-slow, SDC) and the control-plane patterns the artifact’s diagrams use.',
    selfCheck: [
      'Can you explain why reconcile must be idempotent?',
      'Can you explain why bisection needs a deterministic failing signal?',
    ],
  },
  {
    id: 'e', label: 'Tradeoffs', icon: 'scale',
    title: 'Constraints & Tradeoffs',
    intro: 'Every cluster design trades constraints against each other: memory against concurrency, NVLink domain size against blast radius, validation coverage against the GPUs it consumes. Each card names one constraint, the levers that move it, what you gain and pay, the failure signatures it leaves, and whether any NVCRE check sees it. Where no check exists, the card says so. The formula cards give the first-order math, and the explorer connects it to busBW you actually measured.',
    selfCheck: [
      'Can you explain why a bigger NVLink domain raises busBW but also blast radius?',
      'Can you explain why diagnose costs more runs when two nodes are faulty?',
    ],
  },
];

// ───────────────────────────── resources (§16) ─────────────────────────────
// status: verified = fetched by the spec author on 2026-10-08
//         main-spec = cited in the design outline §10 (researched 2026-10-08)
//         listed = URL seen listed on a fetched page, page itself not opened
//         seed = canonical seed named by the spec, URL filled in at build, not re-fetched
//         derived = URL derived from verified URLs (same org/repo)
const res = [];
const R = (o) => res.push({
  year: null, minutes: null, verified: null, site: null, provenance: null, vendor: false,
  status: 'verified', access: 'free', ...o,
});

// NVIDIA / NVCRE
R({ id: 'r-nvcre-repo', url: 'https://github.com/NVIDIA/cluster-readiness-engine', title: 'NVIDIA Cluster Readiness Engine (repository)', org: 'NVIDIA', year: 2026, type: 'repo', level: 'intermediate', minutes: 20, verified: V, why: 'Canonical NVCRE source: README, ADRs, catalog, releases.', vendor: true });
R({ id: 'r-nvcre-intro', url: 'https://docs.nvidia.com/cluster-readiness-engine/overview/introduction/', title: 'NVCRE docs: Introduction', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'refresher', minutes: 10, verified: V, why: 'What NVCRE does and does not do.', vendor: true });
R({ id: 'r-nvcre-interpret', url: 'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/interpret-results/', title: 'NVCRE docs: Interpret results', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'refresher', minutes: 10, verified: V, why: 'Verdicts, reasons and goodput interpretation.', vendor: true });
R({ id: 'r-nvcre-results', url: 'https://docs.nvidia.com/cluster-readiness-engine/api-reference/validation-results/', title: 'NVCRE docs: Validation Results', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'refresher', minutes: 10, verified: V, why: 'NVIDIA’s own runs, incl. the MNNVL on/off datapoint.', vendor: true });
R({ id: 'r-nvcre-pr365', url: 'https://github.com/NVIDIA/cluster-readiness-engine/pull/365', title: 'PR #365: ADR-082 inference certification (Proposed)', org: 'NVIDIA (kaynetu)', year: 2026, type: 'repo', level: 'deep', minutes: 20, verified: V, why: 'Exactly what a v1 inference certification would and would not cover.', vendor: true });
R({ id: 'r-nvcre-pr419', url: 'https://github.com/NVIDIA/cluster-readiness-engine/pull/419', title: 'PR #419: GPU arch detection from DRA ResourceSlices', org: 'NVIDIA', year: 2026, type: 'repo', level: 'intermediate', minutes: 5, verified: V, why: 'How NVCRE detects GPUs on DRA-only clusters.', vendor: true });
R({ id: 'r-nvcre-i405', url: 'https://github.com/NVIDIA/cluster-readiness-engine/issues/405', title: 'Issue #405: EFA silently falling back to TCP', org: 'NVIDIA', year: 2026, type: 'repo', level: 'intermediate', minutes: 10, status: 'main-spec', verified: V, provenance: 'Design outline §10', why: 'Real log: RDMA plugin loads, NCCL uses sockets, busBW 0.03 GB/s.', vendor: true });
R({ id: 'r-nvsentinel-monitor', url: 'https://docs.nvidia.com/nvsentinel/components/nvcre-certification-monitor/', title: 'NVSentinel: NVCRE Certification Monitor', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'refresher', minutes: 10, status: 'main-spec', verified: V, provenance: 'Design outline §10', why: 'How failed rows become a condition and a NoSchedule taint.', vendor: true });
R({ id: 'r-aicr', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://github.com/NVIDIA/aicr', title: 'NVIDIA AI Cluster Runtime (AICR) repository', org: 'NVIDIA', year: 2026, type: 'repo', level: 'intermediate', minutes: 15, provenance: 'Repo root of the AICR issues cited in the design outline §10', why: 'Version-locked driver/operator/kernel recipes: the config half of readiness.', vendor: true });
R({ id: 'r-dcgm-diag', url: 'https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/dcgm-diagnostics.html', title: 'DCGM Diagnostics', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'intermediate', minutes: 20, verified: V, why: 'What each diag level runs and how long it takes.', vendor: true });
R({ id: 'r-dcgm-plugins', url: 'https://docs.nvidia.com/datacenter/dcgm/latest/reference/diagnostics/plugins/index.html', title: 'DCGM diagnostic plugins', org: 'NVIDIA', year: 2026, type: 'official-doc', level: 'intermediate', minutes: 10, verified: V, why: 'memtest and pulse_test internals.', vendor: true });
R({ id: 'r-nccl-perf', url: 'https://github.com/NVIDIA/nccl-tests/blob/master/doc/PERFORMANCE.md', title: 'nccl-tests: PERFORMANCE.md', org: 'NVIDIA', type: 'official-doc', level: 'refresher', minutes: 10, verified: V, why: 'The algBW and busBW definitions NVCRE reports.', vendor: true });
R({ id: 'r-nccl-docs', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/index.html', title: 'NCCL User Guide', org: 'NVIDIA', type: 'official-doc', level: 'intermediate', minutes: 30, why: 'Environment variables, net plugins, debugging hangs.', vendor: true });
R({ id: 'r-gb300-power', url: 'https://developer.nvidia.com/blog/how-new-gb300-nvl72-features-provide-steady-power-for-ai/', title: 'How new GB300 NVL72 features provide steady power for AI', org: 'NVIDIA', year: 2025, type: 'blog', level: 'refresher', minutes: 10, verified: V, why: 'Power smoothing and energy storage (vendor claims).', vendor: true });
R({ id: 'r-cuda-guide', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/', title: 'CUDA C++ Programming Guide', org: 'NVIDIA', type: 'official-doc', level: 'intermediate', minutes: 60, why: 'Execution model, memory hierarchy, streams.', vendor: true });

// Papers
R({ id: 'r-llama3', url: 'https://arxiv.org/abs/2407.21783', title: 'The Llama 3 Herd of Models', org: 'Meta', year: 2024, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: '§3.3: interruption statistics from 54 days of 405B pretraining.' });
R({ id: 'r-megascale', url: 'https://arxiv.org/abs/2402.15627', title: 'MegaScale: Scaling Large Language Model Training to More Than 10,000 GPUs', org: 'ByteDance', year: 2024, type: 'paper', level: 'deep', minutes: 40, verified: V, why: '12k-GPU operations, straggler and recovery tooling.' });
R({ id: 'r-meta-reliability', url: 'https://arxiv.org/abs/2410.21680', title: 'Revisiting Reliability in Large-Scale Machine Learning Research Clusters', org: 'Meta', year: 2024, type: 'paper', level: 'deep', minutes: 40, verified: V, why: 'Failure taxonomy and an MTTF/ETTR model from two research clusters.' });
R({ id: 'r-acme', url: 'https://arxiv.org/abs/2403.07648', title: 'Characterization of Large Language Model Development in the Datacenter', org: 'Hu et al. (NSDI’24)', year: 2024, type: 'paper', level: 'deep', minutes: 30, verified: V, why: 'Where LLM jobs fail in a production datacenter.' });
R({ id: 'r-megatron', url: 'https://arxiv.org/abs/2104.04473', title: 'Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM', org: 'Narayanan et al.', year: 2021, type: 'paper', level: 'deep', minutes: 40, verified: V, why: 'PTD-P parallelism and the pipeline-bubble math.' });
R({ id: 'r-palm', url: 'https://arxiv.org/abs/2204.02311', title: 'PaLM: Scaling Language Modeling with Pathways', org: 'Google', year: 2022, type: 'paper', level: 'intermediate', minutes: 15, verified: V, why: 'Appendix B defines MFU.' });
R({ id: 'r-kaplan', url: 'https://arxiv.org/abs/2001.08361', title: 'Scaling Laws for Neural Language Models', org: 'Kaplan et al.', year: 2020, type: 'paper', level: 'intermediate', minutes: 20, verified: V, why: 'Source of the 6ND / 2N FLOP estimates.' });
R({ id: 'r-pope', url: 'https://arxiv.org/abs/2211.05102', title: 'Efficiently Scaling Transformer Inference', org: 'Pope et al.', year: 2022, type: 'paper', level: 'deep', minutes: 40, verified: V, why: 'Inference arithmetic: KV size, memory-bound decode, partitioning.' });
R({ id: 'r-vllm-paged', url: 'https://arxiv.org/abs/2309.06180', title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention', org: 'Kwon et al. (SOSP’23)', year: 2023, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'Paged KV cache and why fragmentation matters.' });
R({ id: 'r-sarathi', url: 'https://arxiv.org/abs/2403.02310', title: 'Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve', org: 'Agrawal et al. (OSDI’24)', year: 2024, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'Chunked prefill and stall-free batching.' });
R({ id: 'r-distserve', url: 'https://arxiv.org/abs/2401.09670', title: 'DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving', org: 'Zhong et al. (OSDI’24)', year: 2024, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'Defines goodput under TTFT/TPOT SLOs; disaggregation.' });
R({ id: 'r-splitwise', url: 'https://arxiv.org/abs/2311.18677', title: 'Splitwise: Efficient generative LLM inference using phase splitting', org: 'Patel et al. (ISCA’24)', year: 2023, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'Prefill and decode on different hardware pools.' });
R({ id: 'r-mooncake', url: 'https://arxiv.org/abs/2407.00079', title: 'Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving', org: 'Moonshot AI', year: 2024, type: 'paper', level: 'deep', minutes: 30, verified: V, why: 'KV-centric disaggregation and tiered KV storage.' });
R({ id: 'r-sglang', url: 'https://arxiv.org/abs/2312.07104', title: 'SGLang: Efficient Execution of Structured Language Model Programs', org: 'Zheng et al.', year: 2023, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'RadixAttention prefix reuse.' });
R({ id: 'r-deepseek-v3', url: 'https://arxiv.org/abs/2412.19437', title: 'DeepSeek-V3 Technical Report', org: 'DeepSeek-AI', year: 2024, type: 'paper', level: 'deep', minutes: 60, verified: V, why: 'MoE, MLA and expert-parallel communication at scale.' });
R({ id: 'r-leviathan', url: 'https://arxiv.org/abs/2211.17192', title: 'Fast Inference from Transformers via Speculative Decoding', org: 'Leviathan et al.', year: 2022, type: 'paper', level: 'intermediate', minutes: 20, verified: V, why: 'The original speculative decoding algorithm.' });
R({ id: 'r-eagle', url: 'https://arxiv.org/abs/2401.15077', title: 'EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty', org: 'Li et al.', year: 2024, type: 'paper', level: 'deep', minutes: 20, verified: V, why: 'Feature-level drafting.' });
R({ id: 'r-fp8', url: 'https://arxiv.org/abs/2209.05433', title: 'FP8 Formats for Deep Learning', org: 'Micikevicius et al.', year: 2022, type: 'paper', level: 'intermediate', minutes: 20, verified: V, why: 'E4M3 and E5M2 and why scaling is needed.' });
R({ id: 'r-awq', url: 'https://arxiv.org/abs/2306.00978', title: 'AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration', org: 'Lin et al.', year: 2023, type: 'paper', level: 'intermediate', minutes: 20, verified: V, why: 'Weight-only quantization.' });
R({ id: 'r-flashattn', url: 'https://arxiv.org/abs/2205.14135', title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness', org: 'Dao et al.', year: 2022, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'IO-aware tiling of attention.' });
R({ id: 'r-fa2', url: 'https://arxiv.org/abs/2307.08691', title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning', org: 'Dao', year: 2023, type: 'paper', level: 'deep', minutes: 20, verified: V, why: 'Better work partitioning.' });
R({ id: 'r-fa3', url: 'https://arxiv.org/abs/2407.08608', title: 'FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision', org: 'Shah et al.', year: 2024, type: 'paper', level: 'deep', minutes: 20, verified: V, why: 'Hopper asynchrony and FP8.' });
R({ id: 'r-flashinfer', url: 'https://arxiv.org/abs/2501.01005', title: 'FlashInfer: Efficient and Customizable Attention Engine for LLM Inference Serving', org: 'Ye et al.', year: 2025, type: 'paper', level: 'deep', minutes: 20, verified: V, why: 'Attention kernels for paged KV serving.' });
R({ id: 'r-railonly', url: 'https://arxiv.org/abs/2307.12169', title: 'Rail-only: A Low-Cost High-Performance Network for Training LLMs with Trillion Parameters', org: 'Wang et al.', year: 2023, type: 'paper', level: 'intermediate', minutes: 30, verified: V, why: 'Why training traffic is sparse and rail-local.' });
R({ id: 'r-bytecheckpoint', url: 'https://arxiv.org/abs/2407.20143', title: 'ByteCheckpoint: A Unified Checkpointing System for Large Foundation Model Development', org: 'Wan et al.', year: 2024, type: 'paper', level: 'deep', minutes: 20, verified: V, why: 'Asynchronous, sharded checkpointing.' });
R({ id: 'r-sdc-meta', url: 'https://arxiv.org/abs/2102.11245', title: 'Silent Data Corruptions at Scale', org: 'Dixit et al. (Meta)', year: 2021, type: 'paper', level: 'intermediate', minutes: 20, verified: V, why: 'SDC observed across a large fleet.' });
R({ id: 'r-group-testing', url: 'https://arxiv.org/abs/1902.06002', title: 'Group Testing: An Information Theory Perspective', org: 'Aldridge, Johnson, Scarlett', year: 2019, type: 'paper', level: 'deep', minutes: 30, verified: V, why: 'Survey of adaptive and non-adaptive group testing.' });

// learn-inference.com (independent companion to the book; vendor-adjacent)
const LI = { org: 'Learn Inference', year: 2026, type: 'interactive-refresher', level: 'refresher', site: 'learn-inference', provenance: 'Independent companion to Baseten’s Inference Engineering book (vendor-adjacent)' };
R({ ...LI, id: 'r-li-ch0', url: 'https://learn-inference.com/chapters/inference', title: 'Learn Inference: Ch. 0 Inference', minutes: 15, verified: V, why: 'Chapter 0 hub; §0.4 and §0.5 live inside.' });
R({ ...LI, id: 'r-li-latency', url: 'https://learn-inference.com/chapters/prerequisites/latency-throughput', title: 'Learn Inference: Latency & throughput', minutes: 15, verified: V, why: 'TTFT/TPS simulator (illustrative).' });
R({ ...LI, id: 'r-li-bottlenecks', url: 'https://learn-inference.com/chapters/models/bottlenecks', title: 'Learn Inference: Bottlenecks', minutes: 15, verified: V, why: 'ops:byte and arithmetic intensity.' });
R({ ...LI, id: 'r-li-autoscaling', url: 'https://learn-inference.com/chapters/production/autoscaling', title: 'Learn Inference: Autoscaling', minutes: 15, verified: V, why: 'Cold-start simulator (illustrative).' });
const LIL = { ...LI, status: 'link-checked', verified: V, check: 'resolved and on-topic (2026-10-08)', minutes: 15 };
R({ ...LIL, id: 'r-li-gpu-arch', url: 'https://learn-inference.com/chapters/hardware/gpu-architecture', title: 'Learn Inference: GPU architecture', why: 'SMs, tensor cores, HBM.' });
R({ ...LIL, id: 'r-li-generations', url: 'https://learn-inference.com/chapters/hardware/generations', title: 'Learn Inference: GPU generations', why: 'Hopper to Rubin, dated.' });
R({ ...LIL, id: 'r-li-engines', url: 'https://learn-inference.com/chapters/software/engines', title: 'Learn Inference: Engines', why: 'vLLM, SGLang, TensorRT-LLM.' });
R({ ...LIL, id: 'r-li-dynamo', url: 'https://learn-inference.com/chapters/software/dynamo', title: 'Learn Inference: Dynamo', why: 'Distributed serving orchestration.' });
R({ ...LIL, id: 'r-li-benchmarking', url: 'https://learn-inference.com/chapters/software/benchmarking', title: 'Learn Inference: Benchmarking', why: 'Load testing and percentiles.' });
R({ ...LIL, id: 'r-li-quant', url: 'https://learn-inference.com/chapters/techniques/quantization', title: 'Learn Inference: Quantization', why: 'FP8, FP4, weight-only.' });
R({ ...LIL, id: 'r-li-specdec', url: 'https://learn-inference.com/chapters/techniques/speculative-decoding', title: 'Learn Inference: Speculative decoding', why: 'Draft and verify.' });
R({ ...LIL, id: 'r-li-caching', url: 'https://learn-inference.com/chapters/techniques/caching', title: 'Learn Inference: Caching', why: 'Prefix and KV reuse.' });
R({ ...LIL, id: 'r-li-parallelism', url: 'https://learn-inference.com/chapters/techniques/parallelism', title: 'Learn Inference: Parallelism', why: 'TP, EP and attention-DP at serve time.' });
R({ ...LIL, id: 'r-li-disagg', url: 'https://learn-inference.com/chapters/techniques/disaggregation', title: 'Learn Inference: Disaggregation', why: 'Prefill/decode pools and KV transfer.' });
R({ ...LIL, id: 'r-li-testing', url: 'https://learn-inference.com/chapters/production/testing-deployment', title: 'Learn Inference: Testing & deployment', why: 'Canary and perf regression tests.' });

// inferenceengineering.tech (built from Baseten's book; vendor)
const IE = { org: 'Philip Kiely / Baseten Books', year: 2026, type: 'interactive-refresher', level: 'refresher', site: 'inferenceengineering', provenance: 'Built from Baseten’s Inference Engineering book', vendor: true };
R({ ...IE, id: 'r-ie-ch0', url: 'https://inferenceengineering.tech/chapters/inference/', title: 'Inference Engineering: Ch. 0 Inference', minutes: 10, verified: V, why: 'The three-layer framing.' });
R({ ...IE, id: 'r-ie-ch1', url: 'https://inferenceengineering.tech/chapters/prerequisites', title: 'Inference Engineering: Ch. 1 Prerequisites', minutes: 20, verified: V, why: 'Latency and cost budgeting.' });
R({ ...IE, id: 'r-ie-kvcalc', url: 'https://inferenceengineering.tech/exercises/kv-cache-sizing/', title: 'KV cache sizing calculator', minutes: 10, verified: V, why: 'Size KV per token, sequence and batch.' });
R({ ...IE, id: 'r-ie-vram', url: 'https://inferenceengineering.tech/exercises/vram-calculator', title: 'VRAM calculator', minutes: 10, verified: V, why: 'Weights + KV + overhead (rough percentages, illustrative).' });
R({ ...IE, id: 'r-ie-gpu-inference', url: 'https://inferenceengineering.tech/learn/gpu-inference/', title: 'GPU inference (spec table)', minutes: 15, verified: V, why: 'GPU spec table; its cloud prices are not used here.' });
R({ ...IE, id: 'r-ie-paths', url: 'https://inferenceengineering.tech/paths/', title: 'Learning paths (Getting Started ~3h · Architect ~4h · Optimizer ~4h)', type: 'course', minutes: 240, verified: V, why: 'Role paths; step lists not verified (§22).' });
R({ ...IE, id: 'r-ie-cheats', url: 'https://inferenceengineering.tech/cheat-sheets/', title: 'Cheat sheets', minutes: 10, verified: V, why: 'Formula sheets.' });
R({ id: 'r-book', url: 'https://www.baseten.co/inference-engineering/', title: 'Inference Engineering (book, read online)', org: 'Philip Kiely, Baseten Books', year: 2026, type: 'book', access: 'free', level: 'intermediate', minutes: 600, verified: V, provenance: 'Finished January 2026, 256 pp; print is paid', why: 'The source book behind both sites.', vendor: true });

// Canonical seeds — named by the spec, URLs filled at build; "verify before ship" (§22.4)
const S = { status: 'seed' };
R({ ...S, id: 'r-ultrascale', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook', title: 'The Ultra-Scale Playbook', org: 'Hugging Face (nanotron)', year: 2025, type: 'book', level: 'intermediate', minutes: 120, why: 'Training parallelism end to end, with measurements.' });
R({ ...S, id: 'r-stas-mle', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://github.com/stas00/ml-engineering', title: 'Machine Learning Engineering Open Book', org: 'Stas Bekman', type: 'book', level: 'intermediate', minutes: 60, why: 'Practitioner notes on fabrics, burn-in, debugging hangs.' });
R({ ...S, id: 'r-modal-glossary', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://modal.com/gpu-glossary', title: 'GPU Glossary', org: 'Modal', year: 2025, type: 'interactive-refresher', level: 'refresher', minutes: 20, why: 'Hyperlinked definitions of GPU hardware and software terms.' });
R({ ...S, id: 'r-roofline', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2008/EECS-2008-134.html', title: 'Roofline: An Insightful Visual Performance Model (Berkeley tech report)', org: 'Williams, Waterman, Patterson', year: 2008, type: 'paper', level: 'intermediate', minutes: 30, why: 'The roofline model; free tech-report version of the CACM’09 paper.' });
R({ ...S, id: 'r-gray-failure', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://www.microsoft.com/en-us/research/publication/gray-failure-achilles-heel-cloud-scale-systems/', title: 'Gray Failure: The Achilles’ Heel of Cloud-Scale Systems', org: 'Huang et al. (HotOS’17)', year: 2017, type: 'paper', level: 'intermediate', minutes: 20, why: 'Differential observability.' });
R({ ...S, id: 'r-fail-slow', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://www.usenix.org/conference/fast18/presentation/gunawi', title: 'Fail-Slow at Scale: Evidence of Hardware Performance Faults in Large Production Systems', org: 'Gunawi et al. (FAST’18)', year: 2018, type: 'paper', level: 'intermediate', minutes: 30, why: 'Slow-but-alive hardware and how it cascades.' });
R({ ...S, id: 'r-tail-at-scale', status: 'unverified', check: 'fetch blocked from the build environment (ACM DL)', url: 'https://dl.acm.org/doi/10.1145/2408776.2408794', title: 'The Tail at Scale', org: 'Dean & Barroso (CACM)', year: 2013, type: 'paper', level: 'refresher', minutes: 15, why: 'Why the slowest component sets the pace.' });
R({ ...S, id: 'r-cores-dont-count', status: 'unverified', check: 'fetch blocked from the build environment (ACM DL)', url: 'https://dl.acm.org/doi/10.1145/3458336.3465297', title: 'Cores That Don’t Count', org: 'Hochschild et al. (HotOS’21)', year: 2021, type: 'paper', level: 'intermediate', minutes: 20, why: 'Mercurial cores and silent corruption at Google.' });
R({ ...S, id: 'r-borg-omega-k8s', status: 'unverified', check: 'queue.acm.org returned HTTP 526 (server SSL error) twice on 2026-10-08', url: 'https://queue.acm.org/detail.cfm?id=2898444', title: 'Borg, Omega, and Kubernetes', org: 'Burns et al. (ACM Queue)', year: 2016, type: 'paper', level: 'refresher', minutes: 20, why: 'Where Kubernetes scheduling ideas come from.' });
R({ ...S, id: 'r-k8s-controller', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://kubernetes.io/docs/concepts/architecture/controller/', title: 'Kubernetes: Controllers', org: 'Kubernetes', type: 'official-doc', level: 'refresher', minutes: 10, why: 'Control loops and desired state.' });
R({ ...S, id: 'r-k8s-api-conv', status: 'unverified', check: 'robots-disallowed for the build fetcher; canonical Kubernetes URL', url: 'https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md', title: 'Kubernetes API Conventions', org: 'Kubernetes SIG Architecture', type: 'official-doc', level: 'intermediate', minutes: 30, why: 'Spec vs status, conditions, versioning, patches.' });
R({ ...S, id: 'r-k8s-taints', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/', title: 'Kubernetes: Taints and Tolerations', org: 'Kubernetes', type: 'official-doc', level: 'refresher', minutes: 10, why: 'How taints repel pods.' });
R({ ...S, id: 'r-kubebuilder', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://book.kubebuilder.io/', title: 'The Kubebuilder Book', org: 'Kubernetes SIGs', type: 'book', level: 'intermediate', minutes: 60, why: 'Scaffolding CRDs and reconcilers.' });
R({ ...S, id: 'r-cel-spec', status: 'link-checked', verified: V, check: 'google/cel-spec redirects here (2026-10-08)', url: 'https://github.com/cel-expr/cel-spec', title: 'Common Expression Language specification', org: 'CEL project (formerly google/cel-spec)', type: 'spec', level: 'intermediate', minutes: 20, why: 'The language NVCRE thresholds are written in.' });
R({ ...S, id: 'r-k8s-cel', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://kubernetes.io/docs/reference/using-api/cel/', title: 'Common Expression Language in Kubernetes', org: 'Kubernetes', type: 'official-doc', level: 'refresher', minutes: 15, why: 'How Kubernetes uses CEL for validation.' });
R({ ...S, id: 'r-patarasuk', status: 'unverified', check: 'DOI resolves (302 to Elsevier); landing page blocked, title not confirmed', url: 'https://doi.org/10.1016/j.jpdc.2008.09.002', title: 'Bandwidth optimal all-reduce algorithms for clusters of workstations', org: 'Patarasuk & Yuan (JPDC)', year: 2009, type: 'paper', access: 'paywalled', level: 'deep', minutes: 30, why: 'Proof that ring all-reduce is bandwidth-optimal.' });
R({ id: 'r-young', status: 'unverified', check: 'fetch blocked from the build environment; DOI from the citation', url: 'https://doi.org/10.1145/361147.361115', title: 'A first order approximation to the optimum checkpoint interval', org: 'J. W. Young (CACM 17(9))', year: 1974, type: 'paper', level: 'intermediate', minutes: 10, why: 'The original √(2δM) checkpoint-interval result.' });
R({ id: 'r-daly', status: 'unverified', check: 'DOI resolves (302 to Elsevier); landing page blocked, title not confirmed', url: 'https://doi.org/10.1016/j.future.2004.11.016', title: 'A higher order estimate of the optimum checkpoint interval for restart dumps', org: 'J. T. Daly (FGCS 22(3))', year: 2006, type: 'paper', access: 'paywalled', level: 'deep', minutes: 20, why: 'Refines Young’s estimate for larger checkpoint costs.' });
R({ ...S, id: 'r-slsa', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://slsa.dev/', title: 'SLSA: Supply-chain Levels for Software Artifacts', org: 'OpenSSF', type: 'spec', level: 'refresher', minutes: 15, why: 'Provenance attestations.' });
R({ ...S, id: 'r-mcp', status: 'link-checked', verified: V, check: 'resolved and title matched (2026-10-08)', url: 'https://modelcontextprotocol.io/', title: 'Model Context Protocol', org: 'MCP project', type: 'spec', level: 'refresher', minutes: 15, why: 'The protocol behind nvcrectl mcp serve.' });

export const resources = res;

// ───────────────────────────── entries (§14) ─────────────────────────────
const E = (id, title, tier, refresher, whyHere, resources, o = {}) => ({
  id, module: id[0], title, tier, refresher, whyHere, resources, startHere: resources[0],
  prereqs: [], related: [], aliases: [], flags: [], ...o,
});

export const entries = [
  // Module A
  E('a-readiness', 'Cluster readiness vs health', 'CORE',
    'Readiness means the cluster runs the target workload at the expected performance. Health means components report OK. Readiness is measured with real distributed load against thresholds; health comes from passive signals.',
    'The artifact’s thesis: green health ≠ ready.',
    ['r-nvcre-intro', 'r-nvcre-results'], { related: ['d-gray-failure', 'a-passive-health', 'e-14'], aliases: ['acceptance', 'certification'] }),
  E('a-nvcre-verdicts', 'NVCRE verdicts & reasons', 'CORE',
    'Results are PASSED, INCOMPLETE or FAILED (RUNNING while in progress). Each failed node carries a reason: ThresholdViolation, HardwareFailureDetected or WorkloadFailed. Failed nodes go into ConfigMaps referenced by failedNodesRef.',
    'Read S5 verdicts precisely.',
    ['r-nvcre-interpret', 'r-nvcre-results', 'r-nvcre-repo'], { related: ['a-readiness', 'd-conditions'], aliases: ['PASSED', 'FAILED', 'INCOMPLETE', 'ThresholdViolation', 'HardwareFailureDetected', 'WorkloadFailed', 'failedNodesRef'] }),
  E('a-nvcre-testscale', 'testScale levels', 'CORE',
    'intra-node, intra-rack (grouped by nvidia.com/gpu.clique), full-scale and diagnose. Each scale exercises a different interconnect tier.',
    'Maps faults to the tier that reveals them.',
    ['r-nvcre-repo'], { related: ['a-nvlink-domain', 'a-fabrics', 'd-group-testing'], aliases: ['intra-node', 'intra-rack', 'full-scale', 'diagnose'] }),
  E('a-nvcre-cli', 'nvcrectl & catalog', 'CORE',
    'A CLI for setup, render, run, report and cleanup, also usable as kubectl nvcre. The certification catalog is embedded in the binary, so adding a category needs a rebuild.',
    'S4 walkthrough, S7 limits.',
    ['r-nvcre-repo'], { aliases: ['kubectl nvcre', 'catalog'] }),
  E('a-nvidia-stack', 'DSX OS: AICR, NVSentinel, NVCRE', 'CORE',
    'AICR pins config/version recipes. NVSentinel turns passive health into node conditions and taints. NVCRE actively certifies but never cordons.',
    'Who quarantines vs who detects.',
    ['r-nvcre-repo', 'r-nvsentinel-monitor', 'r-aicr'], { related: ['a-stack-compat', 'd-taints'], aliases: ['DSX OS', 'AICR', 'NVSentinel'] }),
  E('a-reliability-data', 'Failure at scale (data)', 'CORE',
    'Llama 3: 419 unexpected interruptions in 54 days on 16,384 H100s, ~78% hardware-related. Meta’s research clusters: 11 months, 4M jobs and 150M+ A100 GPU-hours, used to fit an MTTF model.',
    'Grounds the S2 hook.',
    ['r-llama3', 'r-meta-reliability', 'r-megascale', 'r-acme'], { related: ['e-08', 'f-15'], aliases: ['interruptions', 'MTTF', 'Llama 3'] }),
  E('a-mfu', 'MFU', 'CORE',
    'Model FLOPs utilization: achieved model FLOP/s ÷ peak hardware FLOP/s, counting only the model’s FLOPs (not recomputation). Defined in the PaLM paper.',
    'A threshold candidate (avgTFLOPsPerGPU).',
    ['r-palm', 'r-ultrascale'], { related: ['f-04', 'f-03'], aliases: ['model FLOPs utilization'] }),
  E('a-goodput', 'Goodput (training)', 'CORE',
    'Fraction of wall time spent making useful forward progress. NVCRE parses it from pod logs and freezes it once the run completes; NVIDIA’s docs flag a ratio below ~0.95 as meaningful overhead.',
    'goodputRatio threshold; differs from inference goodput.',
    ['r-nvcre-interpret'], { related: ['b-goodput-slo'], aliases: ['goodputRatio', 'frozen'] }),
  E('a-burnin', 'Burn-in & infant mortality', 'CORE',
    'Failure rates follow a bathtub curve: high early, flat, then wear-out. Burn-in front-loads early failures before tenants arrive. Re-run it after repair or RMA.',
    'S6 fit.',
    ['r-meta-reliability', 'r-stas-mle'], { related: ['e-15', 'a-readiness'], aliases: ['bathtub curve', 'RMA', 're-burn-in'] }),
  E('a-dcgm', 'DCGM diagnostics levels', 'CORE',
    'dcgmi diag -r 1..4 runs quick → extended suites. Level 4 adds memtest (memory patterns) and pulse_test (rapid power-load swings that expose PSU/board instability).',
    'NVCRE runs level 4.',
    ['r-dcgm-diag', 'r-dcgm-plugins'], { related: ['a-gpu-errors', 'e-09'], aliases: ['dcgmi', 'memtest', 'pulse_test', 'dcgm-level4'] }),
  E('a-gpu-errors', 'ECC & XID errors', 'CORE',
    'ECC corrects or flags memory bit errors. XIDs are driver-reported GPU error codes. Both surface through DCGM, and through node conditions when a health agent sets them.',
    'C3 fault menu.',
    ['r-dcgm-diag'], { related: ['a-dcgm', 'a-passive-health'], aliases: ['ECC', 'XID'] }),
  E('a-passive-health', 'Passive health checks', 'CORE',
    'LBNL NHC (Slurm) and Node Problem Detector (k8s) check node state periodically. They catch hard faults, not performance faults.',
    'The contrast to active validation.',
    ['r-stas-mle'], { related: ['a-readiness', 'e-14'], aliases: ['NHC', 'Node Problem Detector'] }),
  E('a-gpu-discovery', 'GPU Operator & labels', 'CORE',
    'The GPU Operator deploys the driver, device plugin and GFD labels (nvidia.com/gpu.product). The Network Operator handles RDMA NICs.',
    'NVCRE’s architecture detection.',
    ['r-nvcre-repo'], { related: ['a-dra'], aliases: ['GPU Operator', 'Network Operator', 'GFD', 'gpu.product'] }),
  E('a-dra', 'DRA, ResourceSlices, ComputeDomain', 'CORE',
    'Dynamic Resource Allocation advertises devices via ResourceSlices. NVIDIA’s DRA driver adds ComputeDomains for IMEX/MNNVL. NVCRE PR #419 reads GPU arch from ResourceSlices when GFD labels are absent.',
    'DRA-only clusters.',
    ['r-nvcre-pr419'], { related: ['a-gpu-discovery', 'a-nvlink-domain'], aliases: ['DRA', 'ResourceSlice', 'ComputeDomain', 'IMEX'] }),
  E('a-nvlink-domain', 'NVLink, NVSwitch, NVL72 domain', 'CORE',
    'NVLink/NVSwitch is the scale-up fabric. NVL72 joins 72 GPUs in one NVLink domain (multi-node NVLink, MNNVL). A clique label marks GPUs sharing a domain.',
    'intra-rack scale; MNNVL datapoint.',
    ['r-ie-gpu-inference', 'r-li-gpu-arch'], { related: ['e-03', 'a-nvcre-testscale'], aliases: ['MNNVL', 'NVSwitch', 'clique', 'gpu.clique'] }),
  E('a-fabrics', 'Scale-out fabrics', 'CORE',
    'InfiniBand (credit-based, lossless), RoCE (Ethernet with PFC/ECN), AWS EFA (SRD) and GCP GPUDirect-TCPX(O). Rail-optimized topologies put same-index GPUs on a shared switch “rail”.',
    'full-scale results.',
    ['r-railonly', 'r-stas-mle'], { related: ['e-07', 'a-rdma'], aliases: ['InfiniBand', 'IB', 'RoCE', 'EFA', 'TCPXO', 'rail'] }),
  E('a-rdma', 'RDMA & NCCL net plugins', 'CORE',
    'NCCL reaches NICs through net plugins (e.g., aws-ofi-nccl for EFA). If the plugin fails to load, NCCL can fall back to TCP sockets: functional but orders of magnitude slower.',
    'The ~0.03 GB/s EFA story.',
    ['r-nvcre-repo', 'r-nvcre-i405', 'r-nccl-docs'], { related: ['e-13', 'a-fabrics'], aliases: ['aws-ofi-nccl', 'TCP fallback', 'net plugin'] }),
  E('a-topology-aware', 'Topology-aware grouping', 'CORE',
    'Clouds expose placement labels (AWS network-node-layer, GCP gce-topology-block, Azure PPG). Grouping nodes by these labels keeps tests and jobs inside low-hop domains.',
    'diagnose groups.',
    ['r-nvcre-repo'], { related: ['d-group-testing'], aliases: ['topology labels', 'network-node-layer', 'gce-topology-block', 'PPG'] }),
  E('a-scheduling', 'Gang & topology scheduling', 'CORE',
    'Distributed jobs need all-or-nothing placement (gang scheduling: KAI, Run:ai, Kueue). Fragmentation and mixed GPU types break that.',
    'Homogeneity limit.',
    ['r-borg-omega-k8s'], { related: ['e-11', 'a-k8s-batch'], aliases: ['gang scheduling', 'KAI', 'Run:ai'] }),
  E('a-k8s-batch', 'Kueue & Kubeflow Trainer', 'CORE',
    'Kueue queues and admits (suspends/unsuspends) batch workloads. Kubeflow Trainer’s TrainJob runs distributed training. NVCRE drives TrainJobs through an adapter.',
    'S3/S5 lifecycle.',
    ['r-nvcre-repo'], { related: ['a-scheduling'], aliases: ['Kueue', 'TrainJob', 'Kubeflow Trainer'] }),
  E('a-slurm', 'Slurm contrast', 'CORE',
    'Slurm allocates nodes and launches ranks with srun. Topology/block plugins provide placement. Health is usually checked by NHC, run periodically or in prolog/epilog.',
    'Readers fluent in Slurm.',
    ['r-stas-mle'], { related: ['a-passive-health'], aliases: ['srun'] }),
  E('a-stack-compat', 'Stack compatibility matrices', 'CORE',
    'Driver, CUDA, NCCL, OFED/EFA, NIC and GPU firmware must match tested combinations. AICR pins these. Drift causes silent fallbacks or hangs.',
    'S5, C3 wrong firmware.',
    ['r-nvcre-repo', 'r-aicr'], { related: ['e-13', 'a-rdma'], aliases: ['firmware', 'version matrix', 'drift'] }),
  E('a-observability', 'Metrics & results export', 'CORE',
    'NVCRE exposes Prometheus metrics (via ServiceMonitor) and JSON results. Pair them with DCGM exporter for continuous telemetry.',
    'S5.',
    ['r-nvcre-repo'], { related: ['e-14'], aliases: ['Prometheus', 'ServiceMonitor', 'results-file'] }),
  E('a-gpu-generations', 'GPU generations (dated)', 'CORE',
    'Hopper (H100/H200), Blackwell (B200/GB200), Blackwell Ultra (GB300), then Rubin. NVIDIA lists Rubin at 288 GB HBM4 and 22 TB/s, with partner availability in H2 2026 (CES 2026; status as of 2026-10-08).',
    '§7 GPUs; dated.',
    ['r-li-generations', 'r-ie-gpu-inference'], { related: ['e-01'], aliases: ['Hopper', 'Blackwell', 'Rubin', 'H100', 'GB200', 'GB300'], flags: ['Rubin status softened to what §23 supports'] }),
  E('a-parallelism', 'Parallelism (training)', 'CORE',
    'DP replicates the model. TP splits layers (NVLink-heavy). PP splits stages (bubbles). CP/SP split the sequence. EP splits MoE experts (all-to-all). Megatron composes them.',
    'NVCRE pretraining workloads.',
    ['r-ultrascale', 'r-megatron'], { related: ['e-04', 'f-10'], aliases: ['DP', 'TP', 'PP', 'EP', 'Megatron', 'NeMo'] }),
  E('a-benchmarks', 'Benchmarks (HPL, MLPerf)', 'CORE',
    'HPL/GEMM measure dense FLOPs, not fabric health. MLPerf measures end-to-end training/inference at fixed quality.',
    'HPL is only an indirect signal.',
    ['r-ultrascale'], { related: ['e-14'], aliases: ['HPL', 'GEMM', 'MLPerf'], flags: ['Tier set to CORE: anchored at anc-hpl (spec §12 says C, §14 table said E)'] }),

  // Module B
  E('b-three-layers', 'Runtime · infrastructure · tooling', 'EXTENDED',
    'The book’s framing: runtime (kernels/engines/techniques), infrastructure (autoscaling, capacity, multi-cloud) and tooling. Each layer fails differently.',
    'Readiness touches infra + hardware, not runtime tuning.',
    ['r-li-ch0', 'r-ie-ch0']),
  E('b-scale-problem', 'Scale changes the problem', 'EXTENDED',
    'Past a few hundred GPUs, capacity spreads across regions and clouds, and the problem shifts from optimization to capacity management. (book framing, secondary)',
    'Why multi-cluster readiness matters.',
    ['r-li-ch0', 'r-ie-ch0'], { related: ['e-12'] }),
  E('b-abstraction', 'Where to put the abstraction', 'EXTENDED',
    'Choose what the platform hides (hardware, engine, cloud) vs what it exposes. (book §0.5)',
    'Validation must certify the layer you abstract over.',
    ['r-li-ch0'], { related: ['e-12'] }),
  E('b-prefill-decode', 'Prefill vs decode', 'EXTENDED',
    'Prefill processes the whole prompt in parallel (compute-bound → TTFT). Decode emits one token per pass, re-reading weights and KV each time (bandwidth-bound → ITL/TPOT).',
    'Different hardware stress → different readiness signals.',
    ['r-li-latency', 'r-sarathi', 'r-splitwise'], { related: ['b-kv-cache', 'f-07'], aliases: ['prefill', 'decode', 'TTFT', 'ITL'] }),
  E('b-latency-metrics', 'TTFT, TPOT/ITL, percentiles', 'EXTENDED',
    'TTFT = time to first token. TPOT/ITL = time per output token. Report p50/p99, not means. Inference time ≠ end-to-end time.',
    'ADR-082 proposes success-only latency percentiles.',
    ['r-li-latency'], { prereqs: ['b-prefill-decode'], aliases: ['TTFT', 'TPOT', 'ITL', 'p99'] }),
  E('b-goodput-slo', 'Goodput under SLO', 'CORE',
    'Inference goodput = request rate served while meeting TTFT/TPOT SLOs (DistServe). Not the same as training goodputRatio.',
    'Avoid conflating NVCRE metrics.',
    ['r-distserve'], { related: ['a-goodput', 'b-latency-metrics'] }),
  E('b-budget', 'Latency & cost budgeting', 'EXTENDED',
    'Define the model, interface, latency budget, unit economics and usage pattern before optimizing. (book ch1)',
    'Sets thresholds a future inference cert would check.',
    ['r-ie-ch1']),
  E('b-model-select', 'Model selection & eval', 'EXTENDED',
    'Model choice dominates cost and speed; evaluate quality before tuning.',
    'Out-of-scope depth; linked only.',
    ['r-ie-ch1']),
  E('b-bottlenecks', 'Ops:byte & bottlenecks', 'EXTENDED',
    'Compare a GPU’s ops:byte (peak FLOP/s ÷ HBM B/s) with the workload’s arithmetic intensity. Below the ridge you are memory-bound.',
    'Basis for E-02.',
    ['r-li-bottlenecks', 'r-roofline'], { related: ['c-roofline', 'f-08'], aliases: ['arithmetic intensity', 'ops:byte'] }),
  E('b-kv-cache', 'KV cache', 'EXTENDED',
    'Stores per-layer K and V for past tokens. Size grows linearly with context × batch. GQA/MQA/MLA shrink it. PagedAttention reduces fragmentation.',
    'HBM capacity wall (E-01).',
    ['r-ie-kvcalc', 'r-vllm-paged', 'r-pope'], { prereqs: ['b-prefill-decode'], related: ['e-01', 'f-05'], aliases: ['KV', 'PagedAttention', 'GQA', 'MLA'] }),
  E('b-batching', 'Continuous batching & chunked prefill', 'EXTENDED',
    'Iteration-level scheduling (Orca) admits requests per step. Chunked prefill (Sarathi-Serve) avoids decode stalls.',
    'Throughput/latency knob.',
    ['r-sarathi'], { prereqs: ['b-prefill-decode'], aliases: ['continuous batching', 'chunked prefill'] }),
  E('b-caching', 'Prefix caching / KV reuse', 'EXTENDED',
    'Shared prefixes reuse KV and skip prefill (RadixAttention). Tiering to CPU/SSD (Mooncake, LMCache) trades bandwidth for capacity.',
    'Storage/fabric demands.',
    ['r-li-caching', 'r-sglang', 'r-mooncake'], { prereqs: ['b-kv-cache'], aliases: ['prefix caching', 'RadixAttention'] }),
  E('b-quant', 'Quantization (FP8/FP4)', 'EXTENDED',
    'Lower precision shrinks weights/KV and raises FLOPs. Formats: FP8 E4M3/E5M2, NVFP4 (Blackwell+), weight-only AWQ/GPTQ.',
    'Changes the memory ceiling (f-07).',
    ['r-li-quant', 'r-fp8', 'r-awq'], { related: ['c-lowprec', 'f-07'], aliases: ['FP8', 'FP4', 'NVFP4', 'AWQ'] }),
  E('b-specdec', 'Speculative decoding', 'EXTENDED',
    'A draft proposes k tokens and the target verifies them in one pass. Exact output; speedup depends on acceptance rate. EAGLE drafts at the feature level.',
    'Uses spare decode compute.',
    ['r-li-specdec', 'r-leviathan', 'r-eagle'], { prereqs: ['b-prefill-decode'] }),
  E('b-moe-ep', 'MoE & expert parallelism', 'CORE',
    'MoE routes tokens to a few experts. EP shards experts, so dispatch/combine are all-to-all. DeepSeek-V3 is the canonical large open MoE.',
    'nccl-alltoall partially de-risks EP.',
    ['r-li-parallelism', 'r-deepseek-v3'], { related: ['d-collectives', 'e-04'], aliases: ['MoE', 'all-to-all', 'expert parallelism'] }),
  E('b-inf-parallel', 'Inference parallelism (TP/EP/attn-DP)', 'EXTENDED',
    'TP shards layers (NVLink-bound). EP shards experts. Attention-DP replicates attention. PP is rarer at serve time.',
    'Maps to intra-rack vs full-scale.',
    ['r-li-parallelism', 'r-pope']),
  E('b-disagg', 'Prefill/decode disaggregation', 'EXTENDED',
    'Run prefill and decode on separate pools and ship the KV cache between them. Removes interference and allows separate parallelism, but needs KV-transfer bandwidth.',
    'Fabric becomes the serving path (E-06).',
    ['r-li-disagg', 'r-distserve', 'r-splitwise', 'r-mooncake'], { prereqs: ['b-prefill-decode', 'b-kv-cache'], aliases: ['disaggregation', 'NIXL'] }),
  E('b-engines', 'Engines & Dynamo', 'EXTENDED',
    'vLLM, SGLang and TensorRT-LLM are engines. NVIDIA Dynamo orchestrates distributed/disaggregated serving with NIXL for KV transfer.',
    'Stack in ADR-082 (vLLM).',
    ['r-li-engines', 'r-li-dynamo'], { aliases: ['vLLM', 'SGLang', 'TensorRT-LLM', 'Dynamo'] }),
  E('b-benchmarking', 'Benchmarking & load testing', 'EXTENDED',
    'Sweep concurrency, report latency percentiles plus throughput, and separate client saturation from server limits.',
    'ADR-082’s ClientSaturated/InsufficientEvidence.',
    ['r-li-benchmarking', 'r-nvcre-pr365'], { aliases: ['AIPerf', 'load testing'] }),
  E('b-autoscale', 'Autoscaling & cold starts', 'EXTENDED',
    'Replicas follow load with min/max, window, scale-down delay and concurrency target. Cold start = procurement + image pull + weight load + engine compile.',
    'Model-load I/O (E-10).',
    ['r-li-autoscaling'], { aliases: ['cold start'] }),
  E('b-multicloud', 'Multi-cloud capacity', 'EXTENDED',
    'Treat GPUs across regions/clouds as one pool. Needs portable validation per cluster. (vendor framing; Baseten sells this)',
    'Readiness per provider.',
    ['r-li-ch0']),
  E('b-deploy', 'Testing & deployment', 'EXTENDED',
    'Canary, zero-downtime rollout and regression tests on perf.',
    'Re-validate after stack change.',
    ['r-li-testing']),
  E('b-modalities', 'Other modalities', 'EXTENDED',
    'VLMs, embeddings and ASR/TTS mostly reuse LLM serving. Image/video diffusion is compute-bound throughout.',
    'Same cluster constraints; no separate entries.',
    ['r-li-ch0']),
  E('b-adr082', 'ADR-082 inference certification', 'CORE',
    'Proposed: a finite InferenceRun (single-node vLLM + same-node CPU-only AIPerf client), success-only latency percentiles, error ratio and a frozen result. v1 defers multi-node TP/PP/EP, NVL72 MNNVL, front door and cluster capacity.',
    'Exactly what is and isn’t coming.',
    ['r-nvcre-pr365'], { related: ['b-readiness-map', 'b-benchmarking'], aliases: ['InferenceRun', 'ADR-082'] }),
  E('b-readiness-map', 'What readiness de-risks for inference', 'CORE',
    'all-to-all busBW → EP dispatch. MNNVL/intra-rack → TP. full-scale busBW → KV transfer (partial: different message sizes and patterns). DCGM L4 → HBM/SDC. Not covered: TTFT/ITL, autoscaling, cold start.',
    'S7 roadmap honesty.',
    ['r-nvcre-pr365'], { related: ['b-adr082', 'e-06'], flags: ['Anchored via anc-adr082 (spec §12 left this CORE entry unanchored)'] }),

  // Module C
  E('c-gpu-arch', 'SMs, tensor cores, HBM, SRAM', 'EXTENDED',
    'A GPU is many SMs with tensor cores, a small on-chip SRAM/L2 and large off-chip HBM. Kernels win by reusing data on-chip.',
    'Why decode is bandwidth-bound.',
    ['r-li-gpu-arch', 'r-modal-glossary'], { aliases: ['SM', 'tensor core', 'HBM'] }),
  E('c-roofline', 'Roofline model', 'EXTENDED',
    'Attainable FLOP/s = min(peak, AI × bandwidth). The ridge point is the AI where they meet.',
    'f-08.',
    ['r-roofline', 'r-li-bottlenecks'], { related: ['f-08', 'b-bottlenecks'], aliases: ['ridge point'] }),
  E('c-cuda-model', 'CUDA execution model', 'EXTENDED',
    'Grids, blocks and warps; occupancy; memory coalescing; streams for concurrency.',
    'Reading Nsight output.',
    ['r-cuda-guide'], { aliases: ['warp', 'occupancy'] }),
  E('c-flashattn', 'IO-aware attention', 'EXTENDED',
    'FlashAttention tiles attention to avoid HBM round-trips. FA2 improves partitioning; FA3 uses Hopper async/FP8. FlashInfer serves paged KV.',
    'Attention dominates long context.',
    ['r-flashattn', 'r-fa2', 'r-fa3', 'r-flashinfer'], { aliases: ['FlashAttention', 'FlashInfer'] }),
  E('c-comm-overlap', 'Comm/compute overlap & SM contention', 'EXTENDED',
    'NCCL kernels occupy SMs, so overlapping them with GEMMs can slow both. NVLS/SHARP offload reductions to switches. (details: unverified at research time)',
    'Why busBW in isolation ≠ step time.',
    ['r-nccl-docs'], { aliases: ['NVLS', 'SHARP'], flags: ['Details unverified at research time (§22.7)'] }),
  E('c-profiling', 'Profiling (Nsight)', 'EXTENDED',
    'Nsight Systems shows the timeline and overlap. Nsight Compute shows per-kernel roofline.',
    'Diagnosing slow ranks.',
    ['r-cuda-guide'], { aliases: ['Nsight'] }),
  E('c-lowprec', 'Low-precision math', 'EXTENDED',
    'FP8/FP4 tensor-core paths double/quadruple peak FLOPs vs BF16 but need scaling.',
    'f-07/f-08 inputs.',
    ['r-fp8'], { related: ['b-quant'] }),

  // Module D
  E('d-gray-failure', 'Gray failure', 'CORE',
    'Differential observability: the system looks healthy to monitors but is broken for applications.',
    '“Green isn’t ready.”',
    ['r-gray-failure'], { related: ['d-fail-slow', 'a-readiness'] }),
  E('d-fail-slow', 'Fail-slow hardware', 'CORE',
    'Components that are slow but not dead; at scale they cascade.',
    'Stragglers in S2/C2.',
    ['r-fail-slow'], { related: ['d-sync-step'], aliases: ['straggler'] }),
  E('d-sync-step', 'Synchronous step = max over ranks', 'CORE',
    'Every all-reduce waits for the slowest rank, so one slow GPU taxes thousands.',
    'C2 explainer.',
    ['r-tail-at-scale'], { related: ['f-13', 'd-fail-slow'], aliases: ['slowest rank', 'synchronous training'] }),
  E('d-sdc', 'Silent data corruption', 'CORE',
    'Wrong results with no error raised. Found at fleet scale in CPUs (Meta, Google), with analogous concerns for GPUs.',
    'DCGM L4 partially.',
    ['r-sdc-meta', 'r-cores-dont-count'], { aliases: ['SDC'] }),
  E('d-reconcile', 'Level-triggered reconciliation', 'CORE',
    'Controllers compare desired vs observed state on every event or requeue. They act on current state, not on deltas.',
    'C1 lifecycle.',
    ['r-k8s-controller'], { aliases: ['reconciler', 'controller', 'requeue'] }),
  E('d-ownerrefs', 'Owner references', 'CORE',
    'Child objects point at parents; GC cascades. Certification→Workflow→Job mirrors Deployment→ReplicaSet→Pod.',
    'S3 analogy.',
    ['r-k8s-controller'], { aliases: ['ownerReferences'] }),
  E('d-crd', 'CRDs & immutable spec', 'CORE',
    'Custom resources extend the API. Spec = desired, status = observed. Immutable spec forces a new object per change.',
    'S3/S7.',
    ['r-k8s-api-conv'], { aliases: ['CRD', 'custom resource'] }),
  E('d-conditions', 'Status conditions', 'CORE',
    'Typed True/False/Unknown entries with reason and message.',
    'Verdict surfaces.',
    ['r-k8s-api-conv'], { aliases: ['conditions'] }),
  E('d-kubebuilder', 'Kubebuilder / controller-runtime', 'CORE',
    'Go frameworks that scaffold CRDs and reconcilers. NVCRE defaults to 10 concurrent reconciles per main controller and 5 per measurement controller.',
    'S3.',
    ['r-kubebuilder'], { aliases: ['controller-runtime'] }),
  E('d-patch', 'Strategic-merge vs JSON Patch', 'CORE',
    'Strategic merge uses k8s list-merge keys. RFC 6902 applies ordered ops.',
    'Overrides in S3.',
    ['r-k8s-api-conv'], { aliases: ['RFC 6902', 'jobTemplatePatch', 'strategic merge'] }),
  E('d-api-maturity', 'API versioning', 'CORE',
    'alpha → beta → GA; v1alpha1 may break.',
    'S1/S7.',
    ['r-k8s-api-conv'], { aliases: ['v1alpha1'] }),
  E('d-cel', 'CEL', 'CORE',
    'Common Expression Language: non-Turing-complete, safe, used in k8s validation.',
    'NVCRE thresholds/health.',
    ['r-cel-spec', 'r-k8s-cel'], { aliases: ['Common Expression Language', 'thresholds'] }),
  E('d-taints', 'Cordon, taint, drain', 'CORE',
    'Cordon = unschedulable. Taint repels pods without matching tolerations. Drain evicts.',
    'Quarantine is NOT NVCRE’s job.',
    ['r-k8s-taints'], { aliases: ['cordon', 'uncordon', 'NoSchedule'] }),
  E('d-collectives', 'Collectives & busBW', 'CORE',
    'all-reduce = reduce-scatter + all-gather. Ring algorithms are bandwidth-optimal. busBW normalizes algBW to hardware load.',
    'S4/C4.',
    ['r-nccl-perf', 'r-patarasuk'], { related: ['f-01', 'f-02', 'f-09'], aliases: ['all-reduce', 'all-gather', 'busBW', 'algBW', 'nccl-tests'] }),
  E('d-group-testing', 'Adaptive group testing', 'CORE',
    'Pool items; a pool tests positive if any member is defective. Binary splitting finds one defective in ~log2 N tests.',
    'diagnose.',
    ['r-group-testing'], { related: ['f-14'], aliases: ['bisection', 'binary splitting', 'minGroupSize'] }),
  E('d-nccl-watchdog', 'NCCL hangs & watchdog', 'CORE',
    'A missing rank stalls a collective forever. PyTorch’s NCCL watchdog/flight recorder times out and dumps state.',
    'C3 NCCL hang.',
    ['r-nccl-docs'], { aliases: ['hang', 'flight recorder'] }),
  E('d-supply-chain', 'Supply-chain signing', 'CORE',
    'Sigstore/cosign sign artifacts, SLSA attests provenance, CycloneDX lists components (SBOM).',
    'S5.',
    ['r-slsa'], { aliases: ['cosign', 'Sigstore', 'SBOM', 'CycloneDX'] }),
  E('d-mcp', 'Model Context Protocol', 'CORE',
    'Open protocol letting LLM agents call tools/servers.',
    'S6 MCP server.',
    ['r-mcp'], { aliases: ['MCP'] }),
  E('d-consensus', 'Raft/etcd', 'EXTENDED',
    'The k8s control plane stores state in etcd (Raft); large clusters stress it.',
    'Controller scale.',
    ['r-k8s-controller'], { aliases: ['etcd', 'Raft'] }),
];

// ───────────────────────────── formulas (§15) ─────────────────────────────
export const formulas = [
  { id: 'f-01', title: 'Algorithm bandwidth', expr: 'algBW = S / t', vars: { S: 'bytes in each rank’s buffer (message size)', t: 'time for one collective' }, assumptions: 'S = bytes per rank’s buffer.', sources: ['r-nccl-perf'], entries: ['d-collectives'] },
  { id: 'f-02', title: 'Bus bandwidth', expr: 'busBW = algBW · 2(n−1)/n  (all-reduce)\nbusBW = algBW · (n−1)/n  (all-gather, reduce-scatter, all-to-all)\nbusBW = algBW · 1  (broadcast, reduce)', vars: { n: 'ranks in the collective' }, assumptions: 'For all-gather and reduce-scatter, S is the total array size. nccl-tests issue #45 notes doc/code phrasing differences.', sources: ['r-nccl-perf'], entries: ['d-collectives'] },
  { id: 'f-03', title: 'Training and inference FLOPs', expr: 'training FLOPs ≈ 6 · N · D\nforward inference ≈ 2 · N FLOPs / token', vars: { N: 'parameters', D: 'training tokens' }, assumptions: 'Dense model; ignores the attention-context term; for MoE use active N.', sources: ['r-kaplan'], entries: ['a-parallelism', 'a-mfu'] },
  { id: 'f-04', title: 'MFU', expr: 'MFU = (model FLOPs/token × tokens/s) ÷ peak FLOP/s', vars: {}, assumptions: 'Excludes rematerialization (PaLM Appendix B).', sources: ['r-palm'], entries: ['a-mfu'] },
  { id: 'f-05', title: 'KV cache per token', expr: 'KV bytes/token = 2 · L · n_kv · d_head · b', vars: { L: 'layers', n_kv: 'KV heads', d_head: 'head dimension', b: 'bytes per element' }, assumptions: 'GQA lowers n_kv. MLA caches a compressed latent instead (use its latent dim).', sources: ['r-pope', 'r-deepseek-v3'], entries: ['b-kv-cache'] },
  { id: 'f-06', title: 'VRAM budget', expr: 'VRAM ≈ weights (N · b) + KV (f-05 × tokens × batch) + activations/overhead', vars: { N: 'parameters', b: 'bytes per weight' }, assumptions: 'Overhead is engine-specific; site calculators use rough percentages (illustrative).', sources: ['r-ie-vram'], entries: ['b-kv-cache', 'b-quant'] },
  { id: 'f-07', title: 'Decode ceiling', expr: 'decode tok/s per replica ≤ HBM BW ÷ bytes read per step (weights + KV)', vars: {}, assumptions: 'Batch-1 upper bound; ignores compute and communication.', sources: ['r-pope'], entries: ['b-prefill-decode', 'b-quant', 'c-lowprec'] },
  { id: 'f-08', title: 'Ridge point & arithmetic intensity', expr: 'ridge = peak FLOP/s ÷ memory BW\ndecode AI ≈ batch;  prefill AI ≈ prompt tokens', vars: { AI: 'arithmetic intensity, FLOPs per byte (per weight byte, roughly)' }, assumptions: 'Dense vs sparse peak and precision both change the ridge.', sources: ['r-roofline'], entries: ['c-roofline', 'b-bottlenecks', 'c-lowprec'] },
  { id: 'f-09', title: 'Ring all-reduce time', expr: 't ≈ 2(n−1)/n · S/B + latency terms', vars: { B: 'per-rank link bandwidth' }, assumptions: 'Bandwidth-dominant regime (large S).', sources: ['r-patarasuk'], entries: ['d-collectives'] },
  { id: 'f-10', title: 'Pipeline bubble', expr: 'bubble fraction ≈ (p−1)/(m+p−1)\nbubble/ideal = (p−1)/m', vars: { p: 'pipeline stages', m: 'microbatches', v: 'interleaved chunks per stage' }, assumptions: 'GPipe/1F1B schedules; interleaving divides the bubble by v.', sources: ['r-megatron'], entries: ['a-parallelism'] },
  { id: 'f-11', title: 'Little’s law', expr: 'L = λ · W', vars: { L: 'requests in flight', λ: 'arrival rate', W: 'time in system' }, assumptions: 'Steady state.', sources: [], sourceNote: 'Standard queueing result', entries: ['b-latency-metrics', 'b-batching'] },
  { id: 'f-12', title: 'Optimal checkpoint interval (Young/Daly)', expr: 'τ_opt ≈ √(2 · δ · M)', vars: { δ: 'time to write a checkpoint', M: 'MTBF' }, assumptions: 'First-order; assumes δ ≪ M.', sources: ['r-young', 'r-daly'], sourceNote: 'Young 1974 / Daly 2006 (DOIs filled at build; see their verification status)', entries: ['a-reliability-data'] },
  { id: 'f-13', title: 'Synchronous step time', expr: 'step time = max over ranks (compute_i + comm)', vars: {}, assumptions: 'Synchronous SGD.', sources: ['r-tail-at-scale'], entries: ['d-sync-step'] },
  { id: 'f-14', title: 'Adaptive binary splitting', expr: 'tests ≈ ⌈log₂ N⌉ for 1 defective', vars: { N: 'items (nodes) in the pool' }, assumptions: 'Deterministic test; NVCRE adds screening and confirmation runs.', sources: ['r-group-testing'], entries: ['d-group-testing'] },
  { id: 'f-15', title: 'Cluster MTBF', expr: 'cluster MTBF ≈ component MTBF / N', vars: { N: 'components (GPUs)' }, assumptions: 'Independent, exponential failures; correlated failures (shared PSU, an NVL72 tray) break it.', sources: ['r-meta-reliability'], entries: ['a-reliability-data'] },
];

// ───────────────────────────── cards (§15) ─────────────────────────────
// coverage: yes | partial | proposed | no  (does any NVCRE check see this constraint today?)
export const cards = [
  { id: 'e-01', title: 'HBM capacity/bandwidth wall & KV growth',
    why: 'Weights + KV must fit in HBM, and decode re-reads both every token.',
    numbers: [
      { v: 'H100 SXM: 80 GB HBM3 at 3.35 TB/s', date: '2026-10-08', src: 'r-ie-gpu-inference' },
      { v: 'Rubin: 288 GB HBM4 at 22 TB/s; NVIDIA said partner availability in H2 2026', date: '2026-01-05', src: null, note: 'NVIDIA figures via secondary quotes (§23); no verified URL' },
    ],
    levers: ['GQA/MLA', 'FP8/FP4 KV', 'paging', 'offload'],
    gains: 'More concurrent sequences per GPU.', costs: 'Quality risk from lower precision; transfer cost from offload.',
    signatures: ['OOM', 'preemption churn', 'p99 TPOT spikes'],
    nvcre: 'DCGM level-4 memtest checks HBM integrity, not capacity planning. Capacity is not covered by NVCRE today.', coverage: 'partial',
    links: ['b-kv-cache', 'b-quant', 'b-caching', 'c-gpu-arch', 'c-flashattn', 'a-gpu-generations', 'a-dcgm'], formulas: ['f-05', 'f-06', 'f-07'], resources: [],
    matrix: { lever: 'KV precision/GQA', gain: 'concurrency', cost: 'quality', check: 'dcgm L4 (integrity only)' } },
  { id: 'e-02', title: 'Compute- vs memory-bound regimes',
    why: 'Decode arithmetic intensity ≈ batch size; prefill ≈ prompt tokens. Which side of the ridge you are on decides what helps.',
    numbers: [{ v: 'H100 FP16 ≈ 989 TFLOPS (dense) ÷ 3.35 TB/s ≈ 295 ops/byte', date: '2026-10-08', src: 'r-li-bottlenecks', note: 'Site figure; consistent with NVIDIA dense specs' }],
    levers: ['batching', 'chunked prefill', 'disaggregation'],
    gains: 'Higher throughput per GPU.', costs: 'Higher per-token latency at large batch.',
    signatures: ['low SM utilization in decode'],
    nvcre: 'avgTFLOPsPerGPU (training) is the only compute signal. Inference regimes are not covered by NVCRE today.', coverage: 'no',
    links: ['b-prefill-decode', 'b-bottlenecks', 'c-roofline', 'c-gpu-arch', 'c-lowprec', 'c-cuda-model', 'b-batching', 'b-modalities'], formulas: ['f-08', 'f-07'], resources: [],
    matrix: { lever: 'batching', gain: 'throughput', cost: 'latency', check: 'none (inference)' } },
  { id: 'e-03', title: 'Scale-up vs scale-out',
    why: 'NVLink domain bandwidth ≫ NIC bandwidth, so put TP/EP inside the domain.',
    numbers: [
      { v: 'AWS GB200 ×4 all-reduce busBW at 16 GB: 882.51 GB/s with MNNVL vs 191.40 GB/s without (~4.6×)', date: '2026-10-08', src: 'r-nvcre-results' },
      { v: 'Vera Rubin NVL72: 260 TB/s aggregate NVLink 6 bandwidth', date: '2026-01-05', src: null, note: 'Vendor figure via secondary quotes (§23)' },
    ],
    levers: ['domain size', 'placement'],
    gains: 'Faster collectives inside the domain.', costs: 'Bigger blast radius (E-08) and rack power.',
    signatures: ['busBW falls toward scale-out levels when MNNVL is off or a job spills out of the domain'],
    nvcre: 'intra-rack (clique) vs full-scale; MNNVL on/off.', coverage: 'yes',
    links: ['a-nvlink-domain', 'a-fabrics', 'b-inf-parallel', 'a-nvcre-testscale'], formulas: ['f-02'], resources: [],
    matrix: { lever: 'NVLink domain', gain: 'busBW', cost: 'blast radius/power', check: 'intra-rack, MNNVL' } },
  { id: 'e-04', title: 'Parallelism mapping & comm volume',
    why: 'Each parallelism type emits a distinct collective: TP → all-reduce per layer; DP → gradient all-reduce; EP → all-to-all; PP → point-to-point plus bubbles.',
    numbers: [], levers: ['TP/EP/PP mix', 'placement inside the NVLink domain'],
    gains: 'The model fits and steps faster.', costs: 'More communication volume.',
    signatures: [],
    nvcre: 'nccl all-reduce / all-gather / all-to-all plus Megatron runs. PP bubbles are not directly tested.', coverage: 'partial',
    links: ['a-parallelism', 'b-inf-parallel', 'b-moe-ep', 'd-collectives'], formulas: ['f-10', 'f-03'], resources: [],
    matrix: { lever: 'TP/EP/PP mix', gain: 'fit/speed', cost: 'comm volume', check: 'all-reduce/all-gather/all-to-all' } },
  { id: 'e-05', title: 'Latency vs throughput & cost',
    why: 'Bigger batches raise tokens/s/$ but raise ITL. Set SLOs first (book ch1).',
    numbers: [], levers: ['batch size', 'quantization', 'spec decode', 'replicas'],
    gains: 'Lower $/token.', costs: 'Worse p99 latency.',
    signatures: ['throughput fine but p99 bad'],
    nvcre: 'Not covered by NVCRE today. ADR-082 (Proposed) would add success-only latency percentiles on a single node.', coverage: 'proposed',
    links: ['b-latency-metrics', 'b-budget', 'b-model-select', 'b-specdec', 'b-quant', 'b-goodput-slo', 'b-adr082'], formulas: ['f-11'], resources: [],
    matrix: { lever: 'batch/replicas', gain: '$/token', cost: 'p99', check: 'ADR-082 (proposed)' } },
  { id: 'e-06', title: 'Disaggregation & KV transfer',
    why: 'KV must move prefill→decode within the TTFT budget, so the fabric is now on the serving path.',
    numbers: [], levers: ['NIXL/RDMA', 'co-location in an NVLink domain', 'KV compression'],
    gains: 'Better ITL: no prefill/decode interference.', costs: 'Extra pools, scheduler complexity, fabric load.',
    signatures: [],
    nvcre: 'Full-scale busBW is partial evidence only (collective, not point-to-point KV patterns). ADR-082 v1 is single-node, so it doesn’t cover this.', coverage: 'partial',
    links: ['b-disagg', 'b-engines', 'b-caching', 'b-readiness-map'], formulas: [], resources: [],
    matrix: { lever: 'separate pools', gain: 'ITL', cost: 'fabric load', check: 'partial (full-scale)' } },
  { id: 'e-07', title: 'Network design',
    why: 'Training traffic is sparse and rail-local (rail-only paper). IB is credit-based lossless; RoCE needs PFC/ECN tuning; adaptive routing and SHARP/NVLS offload help.',
    numbers: [], levers: ['topology', 'congestion control', 'adaptive routing'],
    gains: 'More usable bandwidth.', costs: 'Cost and tuning effort.',
    signatures: ['congestion spreading', 'flapping ports', 'TCP fallback'],
    nvcre: 'full-scale busBW plus diagnose localize bad links. Multi-tenant interference is not covered by NVCRE today.', coverage: 'partial',
    links: ['a-fabrics', 'a-rdma', 'a-topology-aware', 'c-comm-overlap', 'd-group-testing'], formulas: ['f-09'], resources: [],
    matrix: { lever: 'topology/CC', gain: 'bandwidth', cost: 'cost/tuning', check: 'full-scale + diagnose' } },
  { id: 'e-08', title: 'Reliability at scale',
    why: 'Cluster MTBF ≈ component MTBF / N.',
    numbers: [
      { v: 'Llama 3: 419 unexpected interruptions in 54 days on 16,384 GPUs (≈ one every ~3 h); 58.7% GPU issues', date: '2024-07', src: 'r-llama3' },
      { v: 'MegaScale: 55.2% MFU at 12,288 GPUs', date: '2024-02', src: 'r-megascale' },
    ],
    levers: ['checkpoint interval (f-12)', 'hot spares', 'burn-in', 'fast isolation'],
    gains: 'Higher ETTR (effective training time ratio).', costs: 'Checkpoint and spare-capacity overhead.',
    signatures: ['frequent restarts', 'one tray taking down a whole NVL72 domain'],
    extra: [{ label: 'NVL72 blast radius', text: 'One bad tray can degrade a 72-GPU domain.' }],
    nvcre: 'dcgm-level4 + workloads + diagnose; NVSentinel for passive health.', coverage: 'yes',
    links: ['a-reliability-data', 'a-burnin', 'd-gray-failure', 'd-fail-slow', 'd-sdc', 'a-mfu'], formulas: ['f-15', 'f-12'], resources: [],
    matrix: { lever: 'checkpoint/spares', gain: 'ETTR', cost: 'overhead', check: 'dcgm L4 + workloads' } },
  { id: 'e-09', title: 'Power & thermal',
    why: 'Synchronized steps make power swing fleet-wide. Throttled GPUs become stragglers.',
    numbers: [{ v: 'GB300 NVL72 power shelf stores 65 J per GPU; NVIDIA claims up to 30% lower peak grid demand', date: '2025', src: 'r-gb300-power', note: 'Vendor claim' }],
    levers: ['liquid cooling', 'power caps', 'smoothing'],
    gains: 'Stable clocks and power draw.', costs: 'Less peak performance.',
    signatures: ['clock throttling', 'stragglers that move with load'],
    nvcre: 'No dedicated check. Throttling shows up only indirectly via thresholds. DCGM pulse_test probes power delivery per node.', coverage: 'partial',
    links: ['a-dcgm', 'd-fail-slow'], formulas: [], resources: [],
    matrix: { lever: 'caps/smoothing', gain: 'stability', cost: 'peak perf', check: 'indirect only' } },
  { id: 'e-10', title: 'Storage / data path',
    why: 'Checkpoint write bandwidth bounds checkpoint frequency. Model-load time bounds cold start (weights can be hundreds of GB). KV tiering needs SSD/CPU bandwidth.',
    numbers: [], levers: ['async/sharded checkpoints (ByteCheckpoint)', 'local weight caches'],
    gains: 'Faster recovery and cold start.', costs: 'More storage infrastructure.',
    signatures: ['long restarts after a failure', 'slow scale-up'],
    nvcre: 'Checkpoint-restart for training jobs exists. Storage throughput is not covered by NVCRE today.', coverage: 'no',
    links: ['b-autoscale', 'b-caching'], formulas: ['f-12'], resources: ['r-bytecheckpoint'],
    matrix: { lever: 'async ckpt/cache', gain: 'recovery/cold start', cost: 'infra', check: 'none' } },
  { id: 'e-11', title: 'Scheduling & placement',
    why: 'Gang + topology + homogeneity requirements → fragmentation.',
    numbers: [], levers: ['Kueue', 'KAI', 'topology labels', 'MIG/MPS for small inference tenants'],
    gains: 'Better step time.', costs: 'Fragmented, idle capacity.',
    signatures: ['jobs pending with free GPUs'],
    nvcre: 'One homogeneous GPU product per run; topology-aware grouping.', coverage: 'yes',
    links: ['a-scheduling', 'a-k8s-batch', 'a-topology-aware'], formulas: [], resources: [],
    matrix: { lever: 'gang/topology', gain: 'step time', cost: 'fragmentation', check: 'homogeneity, grouping' } },
  { id: 'e-12', title: 'Capacity management',
    why: 'Past a few hundred GPUs, capacity spans clouds/regions (book framing). Each pool needs its own evidence.',
    numbers: [], levers: ['a unified pool abstraction', 'per-provider certification'],
    gains: 'Availability.', costs: 'Complexity.',
    signatures: [],
    nvcre: 'Platform detection across AWS/GCP/Azure/OCI/etc. supports per-cluster runs. Cross-cluster capacity is not covered. The docs suggest splitting clusters above ~500 nodes into several Certifications.', coverage: 'partial',
    links: ['b-scale-problem', 'b-abstraction', 'b-multicloud', 'b-three-layers', 'd-consensus'], formulas: [], resources: [],
    matrix: { lever: 'multi-cloud', gain: 'availability', cost: 'complexity', check: 'per-cluster runs' } },
  { id: 'e-13', title: 'Stack compatibility & drift',
    why: 'Mismatched driver/CUDA/NCCL/plugin/firmware → silent fallbacks.',
    numbers: [{ v: 'EFA → TCP fallback recorded ~0.03 GB/s busBW (fixed in v0.6.0, #434/#405)', date: '2026-10-05', src: 'r-nvcre-i405' }],
    levers: ['AICR recipes', 'pinned images', 'attestation'],
    gains: 'Correctness.', costs: 'Less agility.',
    signatures: ['busBW collapses with no error', 'hangs after an upgrade'],
    nvcre: 'busBW thresholds catch the symptom; AICR prevents the cause.', coverage: 'partial',
    links: ['a-stack-compat', 'a-rdma', 'd-supply-chain'], formulas: [], resources: [],
    matrix: { lever: 'pinned recipes', gain: 'correctness', cost: 'agility', check: 'busBW thresholds (+AICR)' } },
  { id: 'e-14', title: 'Observability & validation strategy',
    why: 'Active tests catch performance faults; passive monitors catch hard faults.',
    numbers: [], levers: ['active + passive', 'cadence'],
    gains: 'Coverage.', costs: 'Operational effort.',
    signatures: [],
    extra: [
      { label: 'Thresholds', text: 'Must match run length; short runs are noisy. No thresholds ship by default.' },
      { label: 'Cadence', text: 'Acceptance, post-repair and periodic re-burn-in.' },
    ],
    nvcre: 'CEL thresholds + node-health CEL during runs.', coverage: 'yes',
    links: ['a-passive-health', 'a-observability', 'b-benchmarking', 'b-deploy', 'c-profiling', 'a-benchmarks', 'a-readiness'], formulas: [], resources: [],
    matrix: { lever: 'active+passive', gain: 'coverage', cost: 'ops effort', check: 'CEL thresholds' } },
  { id: 'e-15', title: 'Cost of validation',
    why: 'Burn-in consumes the GPUs it certifies. diagnose adds ~log₂ N runs per fault.',
    numbers: [], levers: ['tiered scales (intra-node first)', 'targeted re-validation'],
    gains: 'Less wasted capacity.', costs: 'Coverage gaps.',
    signatures: [],
    nvcre: 'testScale choice is the cost knob.', coverage: 'yes',
    links: ['a-nvcre-testscale', 'd-group-testing', 'a-burnin'], formulas: ['f-14'], resources: [],
    matrix: { lever: 'tiered scales', gain: 'less waste', cost: 'coverage gaps', check: 'testScale' } },
];

// ───────────────────────────── paths (§18) ─────────────────────────────
export const paths = [
  { id: 'p-1', title: 'Collectives & fabrics', minutes: 30, steps: ['d-collectives', 'f-01', 'f-02', 'a-nvlink-domain', 'a-fabrics', 'a-rdma', 'e-03', 'e-07'], external: null, relation: 'No equivalent on either site (gap).' },
  { id: 'p-2', title: 'Inference serving fundamentals', minutes: 60, steps: ['b-prefill-decode', 'b-latency-metrics', 'b-bottlenecks', 'b-kv-cache', 'b-batching', 'b-disagg', 'b-adr082', 'b-readiness-map'], external: 'r-ie-paths', relation: 'Overlaps the inferenceengineering.tech Getting Started path (~3h); take that as the extension.' },
  { id: 'p-3', title: 'GPU kernel fundamentals', minutes: 120, steps: ['c-gpu-arch', 'c-roofline', 'c-cuda-model', 'c-flashattn', 'c-comm-overlap', 'c-profiling'], external: 'r-ie-paths', relation: 'Partial overlap with the inferenceengineering.tech Optimizer path (~4h).' },
  { id: 'p-4', title: 'Reliability at scale', minutes: 45, steps: ['a-reliability-data', 'd-gray-failure', 'd-fail-slow', 'd-sdc', 'f-15', 'f-12', 'a-burnin', 'e-08'], external: null, relation: 'No equivalent on either site.' },
  { id: 'p-5', title: 'Inference cluster architect', minutes: 60, steps: ['e-01', 'e-02', 'e-04', 'e-05', 'e-06', 'e-12', 'b-multicloud'], external: 'r-ie-paths', relation: 'Then the inferenceengineering.tech Infrastructure Architect path (~4h).' },
  { id: 'p-6', title: 'System-design review', minutes: 40, steps: ['matrix', 'e-13', 'e-14', 'e-15', 'e-09', 'e-10', 'e-11'], external: null, relation: 'Starts at the tradeoff matrix.' },
];

// ───────────────────────────── anchors (§12) ─────────────────────────────
const A = (id, loc, term, entries, kind = 'F') => ({ id, loc, term, entries, kind });
export const anchors = [
  A('anc-readiness', 'S1', 'GPU cluster readiness / acceptance / certification', ['a-readiness']),
  A('anc-green-not-ready', 'S1', 'health checks pass but the workload fails', ['d-gray-failure', 'a-readiness']),
  A('anc-reasons', 'S1', 'ThresholdViolation, HardwareFailureDetected', ['a-nvcre-verdicts'], 'N'),
  A('anc-k8s-version', 'S1', 'Kubernetes ≥1.29', ['d-api-maturity']),
  A('anc-crd-version', 'S1', 'CRD API group/version (v1alpha1)', ['d-api-maturity', 'd-crd']),
  A('anc-interruptions', 'S2', 'job-interruption statistics; GPU/HBM3 faults; effective training time', ['a-reliability-data', 'e-08']),
  A('anc-mfu', 'S2', 'MFU; fault recovery', ['a-mfu', 'f-04']),
  A('anc-fail-slow', 'S2', 'stragglers / fail-slow; gray failure', ['d-fail-slow', 'd-gray-failure']),
  A('anc-sync-step', 'S2', 'synchronous training gated by slowest rank', ['d-sync-step', 'f-13']),
  A('anc-sdc', 'S2', 'silent data corruption', ['d-sdc']),
  A('anc-goodput', 'S2', 'goodput', ['a-goodput', 'b-goodput-slo']),
  A('anc-reconcile', 'S3', 'controller/reconciler; level-triggered', ['d-reconcile']),
  A('anc-ownership', 'S3', 'Deployment→ReplicaSet→Pod; owner refs', ['d-ownerrefs']),
  A('anc-crd', 'S3', 'CRDs; status conditions', ['d-crd', 'd-conditions']),
  A('anc-requeue', 'S3', 'watches + periodic requeue; reconcile concurrency', ['d-reconcile']),
  A('anc-kubebuilder', 'S3', 'Kubebuilder / controller-runtime', ['d-kubebuilder']),
  A('anc-trainjob', 'S3', 'Kubeflow Trainer TrainJob', ['a-k8s-batch']),
  A('anc-node-labels', 'S3', 'providerID; nvidia.com/gpu.product; DRA ResourceSlices', ['a-gpu-discovery', 'a-dra']),
  A('anc-patch', 'S3', 'strategic-merge patch; RFC 6902', ['d-patch']),
  A('anc-nvcrectl', 'S4', 'nvcrectl / kubectl plugins', ['a-nvcre-cli'], 'N'),
  A('anc-busbw', 'S4', 'NCCL all-reduce; busBW vs algBW; sweep to 16 GB', ['d-collectives', 'f-01', 'f-02']),
  A('anc-cel', 'S4', 'CEL', ['d-cel']),
  A('anc-testscale', 'S4', 'testScale; NVLink clique / domain', ['a-nvcre-testscale', 'a-nvlink-domain'], 'N'),
  A('anc-bisection', 'S4', 'adaptive group testing / bisection; minGroupSize', ['d-group-testing', 'f-14']),
  A('anc-topo-labels', 'S4', 'cloud topology labels', ['a-topology-aware']),
  A('anc-mnnvl', 'S4', 'MNNVL on GB200/GB300 NVL72', ['a-nvlink-domain', 'e-03']),
  A('anc-cordon', 'S4', 'cordon / uncordon / taint / drain', ['d-taints']),
  A('anc-thresholds', 'S5', 'CEL thresholds', ['d-cel', 'e-14'], 'N'),
  A('anc-val-vs-work', 'S5', 'validation failure vs workload success', ['a-readiness']),
  A('anc-incomplete', 'S5', 'INCOMPLETE via excluded nodes', ['a-nvcre-verdicts'], 'N'),
  A('anc-frozen', 'S5', 'goodput from log parsing; “frozen”', ['a-goodput'], 'N'),
  A('anc-kueue', 'S5', 'Kueue-suspended', ['a-k8s-batch']),
  A('anc-metrics', 'S5', 'Prometheus / ServiceMonitor; JSON', ['a-observability']),
  A('anc-matrix', 'S5', 'version matrices (AICR)', ['a-stack-compat', 'e-13']),
  A('anc-supply', 'S5', 'Sigstore/cosign, SLSA, CycloneDX', ['d-supply-chain']),
  A('anc-tcp-fallback', 'S5', 'NCCL net plugins; RDMA vs TCP fallback (EFA)', ['a-rdma', 'e-13']),
  A('anc-burnin', 'S6', 'burn-in; infant mortality; re-burn-in', ['a-burnin']),
  A('anc-handoff', 'S6', 'provider→tenant handoff; post-repair / RMA', ['a-burnin', 'a-readiness']),
  A('anc-dsx', 'S6', 'DSX OS, AICR, NVSentinel', ['a-nvidia-stack'], 'N'),
  A('anc-dcgm', 'S6', 'DCGM levels 1–4', ['a-dcgm']),
  A('anc-nccl-tests', 'S6', 'nccl-tests', ['d-collectives']),
  A('anc-operators', 'S6', 'GPU Operator, Network Operator', ['a-gpu-discovery']),
  A('anc-nhc', 'S6', 'LBNL NHC; Node Problem Detector', ['a-passive-health']),
  A('anc-gang', 'S6', 'gang scheduling (KAI, Run:ai)', ['a-scheduling']),
  A('anc-mcp', 'S6', 'MCP server', ['d-mcp']),
  A('anc-slurm', 'S6', 'Slurm srun', ['a-slurm']),
  A('anc-api-maturity', 'S7', 'API maturity', ['d-api-maturity']),
  A('anc-homog', 'S7', 'homogeneous GPU per run', ['a-scheduling', 'e-11'], 'N'),
  A('anc-val-cost', 'S7', 'validation consumes capacity', ['e-15']),
  A('anc-run-length', 'S7', 'thresholds calibrated to run length', ['e-14']),
  A('anc-catalog', 'S7', 'embedded catalog rebuild', ['a-nvcre-cli'], 'N'),
  A('anc-immutable', 'S7', 'immutable spec', ['d-crd']),
  A('anc-adr082', 'S7', 'inference certification roadmap', ['b-adr082', 'b-readiness-map'], 'N'),
  A('anc-f-nvlink', 'C3', 'degraded NVLink', ['a-nvlink-domain']),
  A('anc-f-ib', 'C3', 'IB port down-trained / flapping', ['a-fabrics']),
  A('anc-f-ecc', 'C3', 'ECC; XID', ['a-dcgm', 'a-gpu-errors']),
  A('anc-f-throttle', 'C3', 'thermal/power throttling', ['e-09']),
  A('anc-f-fw', 'C3', 'wrong firmware', ['a-stack-compat']),
  A('anc-f-hang', 'C3', 'NCCL hang', ['d-nccl-watchdog']),
  A('anc-fabrics', 'C4/§7', 'EFA; TCPXO; RoCE; InfiniBand', ['a-fabrics', 'a-rdma']),
  A('anc-imex', 'C4/§7', 'hugepages; DRA ComputeDomain (IMEX)', ['a-dra', 'a-nvlink-domain']),
  A('anc-gpus', 'C4/§7', 'H100…RTX PRO 6000', ['a-gpu-generations']),
  A('anc-megatron', 'C4/§7', 'Megatron/NeMo; TFLOPs/GPU; step time', ['a-parallelism', 'f-03']),
  A('anc-a2a', 'C4/§7', 'all-gather; all-to-all (MoE)', ['d-collectives', 'b-moe-ep']),
  A('anc-nvswitch', 'C4/§7', 'NVSwitch; NCCL iterations', ['a-nvlink-domain']),
  A('anc-hpl', 'C4/§7', 'HPL/GEMM', ['a-benchmarks']),
];

// ───────────────────────────── crosswalk (§17) ─────────────────────────────
// li / ie: arrays of { path, rid? } (rid = registry resource) or plain text
const X = (book, topic, li, ie, entries, module, tier, out = null, note = null) => ({ book, topic, li, ie, entries, module, tier, out, note });
export const crosswalk = [
  X('0.1–0.2', 'Two phases, three layers', [{ path: '/inference/two-phases', ok: true }, { path: '/inference/three-layers', ok: true }], [{ rid: 'r-ie-ch0' }], ['b-three-layers', 'b-prefill-decode'], 'B', 'E'),
  X('0.3', 'Six runtime techniques', [{ path: '/inference/runtime-techniques', ok: true }], [{ rid: 'r-ie-ch0' }], ['b-quant', 'b-specdec', 'b-caching', 'b-inf-parallel', 'b-disagg', 'b-batching'], 'B', 'E'),
  X('0.4', 'Scale changes the problem', [{ path: '/inference/scale-changes-problem', ok: true }], [{ rid: 'r-ie-ch0', text: 'ch0 “capacity management”' }], ['b-scale-problem', 'e-12'], 'B/E', 'E'),
  X('0.5', 'Where to put the abstraction', [{ path: '/inference/abstraction', ok: true }], [], ['b-abstraction', 'e-12'], 'B/E', 'E'),
  X('1.1–1.3', 'Scale and specialization, about your app, model selection', [{ path: '/prerequisites/scale-and-specialization', ok: true }, { path: '/prerequisites/about-your-app', ok: true }, { path: '/prerequisites/model-selection', ok: true }], [{ rid: 'r-ie-ch1' }], ['b-budget', 'b-model-select'], 'B', 'E'),
  X('1.4', 'Latency & throughput', [{ rid: 'r-li-latency' }], [{ rid: 'r-ie-ch1' }], ['b-latency-metrics', 'e-05'], 'B', 'E'),
  X('2.1', 'Neural networks', [{ path: '/models/neural-networks', ok: true }], [{ text: 'ch2' }], [], '—', '—', 'Model-architecture background; the serving-relevant part is covered by prefill vs decode.', 'Missing from the source crosswalk; mapped at build from the chapter index.'),
  X('2.2', 'LLM mechanics', [{ path: '/models/llm-mechanics', ok: true }], [{ text: 'ch2' }], ['b-prefill-decode', 'b-kv-cache'], 'B', 'E'),
  X('2.3', 'Image generation inference mechanics', [{ path: '/models/image-mechanics', ok: true }], [{ text: 'ch2' }], ['b-modalities'], 'B', 'E', null, 'Missing from the source crosswalk; mapped at build from the chapter index.'),
  X('2.4', 'Bottlenecks', [{ rid: 'r-li-bottlenecks' }], [{ text: 'arithmetic-intensity calc (URL unverified)' }], ['b-bottlenecks', 'c-roofline', 'f-08'], 'B/C', 'E'),
  X('2.5', 'Optimizing attention', [{ path: '/models/optimizing-attention', ok: true }], [{ text: 'ch2' }], ['c-flashattn'], 'C', 'E'),
  X('3.1–3.3', 'GPU architecture, generations, instances', [{ rid: 'r-li-gpu-arch' }, { rid: 'r-li-generations' }], [{ text: 'ch3' }, { rid: 'r-ie-gpu-inference' }], ['c-gpu-arch', 'a-gpu-generations'], 'A/C', 'C/E'),
  X('3.4–3.5', 'Other accelerators, local inference', [{ path: '/hardware/other-accelerators', ok: true }, { path: '/hardware/local-inference', ok: true }], [{ text: 'ch3' }], [], '—', '—', 'NVCRE is NVIDIA-only; local inference is irrelevant to cluster readiness.'),
  X('4.1', 'CUDA', [{ path: '/software/cuda', ok: true }], [{ text: 'ch4' }], ['c-cuda-model'], 'C', 'E'),
  X('4.2', 'Frameworks', [{ path: '/software/frameworks', ok: true }], [{ text: 'ch4' }], [], '—', '—', 'Model-development layer.'),
  X('4.3–4.4', 'Engines, Dynamo', [{ rid: 'r-li-engines' }, { rid: 'r-li-dynamo' }], [{ text: 'ch4' }], ['b-engines'], 'B', 'E'),
  X('4.5', 'Benchmarking', [{ rid: 'r-li-benchmarking' }], [{ text: '/benchmarks/ (not opened)' }], ['b-benchmarking', 'e-14'], 'B/E', 'E'),
  X('5.1–5.5', 'Techniques', [{ rid: 'r-li-quant' }, { rid: 'r-li-specdec' }, { rid: 'r-li-caching' }, { rid: 'r-li-parallelism' }, { rid: 'r-li-disagg' }], [{ text: 'ch5' }, { rid: 'r-ie-kvcalc' }], ['b-quant', 'b-specdec', 'b-caching', 'b-inf-parallel', 'b-moe-ep', 'b-disagg'], 'B', 'C/E'),
  X('6.x', 'Modalities', [{ text: '/modalities/*' }], [{ text: 'ch6' }], ['b-modalities'], 'B', 'E', null, 'Single entry by design.'),
  X('7.1', 'Containerization', [{ path: '/production/containerization', ok: true }], [{ text: 'ch7' }], ['b-autoscale'], 'B', 'E', null, 'Image pull is part of cold start.'),
  X('7.2', 'Autoscaling', [{ rid: 'r-li-autoscaling' }], [{ text: 'ch7' }], ['b-autoscale', 'e-10'], 'B/E', 'E'),
  X('7.3', 'Multi-cloud', [{ path: '/production/multi-cloud', ok: true }], [{ text: 'ch7' }], ['b-multicloud', 'e-12'], 'B/E', 'E'),
  X('7.4', 'Testing & deployment', [{ rid: 'r-li-testing' }], [{ text: 'ch7' }], ['b-deploy', 'e-14'], 'B/E', 'E'),
  X('7.5', 'Client code', [{ path: '/production/client-code', ok: true }], [{ text: 'ch7' }], [], '—', '—', 'Application layer.'),
  X('ch7 obs.', 'Observability (inferenceengineering.tech only)', [], [{ text: 'ch7' }], ['a-observability', 'e-14'], 'A/E', 'C'),
  X('App. A', 'Glossary', [{ path: '/glossary', ok: true }], [{ text: '/glossary/ (not fetched)' }], [], '—', '—', null, 'Glossary mining incomplete (§22).'),
  X('App. B', 'Reading lists B.1–B.6', [{ path: '/reading', ok: true }], [{ text: '/reading/ (not fetched)' }], [], '—', '—', null, 'Items not enumerated (§22).'),
];

export const gapAudit = {
  added: ['b-scale-problem', 'b-abstraction', 'b-budget', 'b-benchmarking', 'b-autoscale', 'b-multicloud', 'b-deploy', 'b-modalities'],
  addedNote: 'E-12 is framed with the book’s capacity argument.',
  sitesMiss: ['Collectives and busBW', 'Group testing', 'Gray failure / SDC', 'DCGM', 'Kubernetes controllers', 'Power smoothing', 'Checkpointing'],
  sitesMissNote: 'Both sites are serving-centric and say little about fabric validation, so the appendix adds these.',
  outOfScope: ['Fine-tuning', 'Client code', 'Local inference', 'Non-NVIDIA accelerators (NVCRE is NVIDIA-only)', 'Per-modality pipelines beyond one entry'],
  credibility: [
    'The site’s H100 ops:byte (~295) matches NVIDIA dense specs, so it is kept.',
    'The Rubin text on inferenceengineering.tech dates from a January 2026 cutoff. NVIDIA-sourced figures are used instead: 288 GB HBM4, 22 TB/s, partner availability H2 2026.',
    '“NVL144” was renamed NVL72 (counting packages) per secondary reporting; no primary source verified. CPX and Rubin Ultra are announced, not shipping.',
    'The sites’ cloud $/hr figures are not used.',
  ],
  siteRule: 'Where both sites cover a concept, learn-inference.com is linked for concepts (one URL per section, simulators labelled illustrative, independent) and inferenceengineering.tech for calculators (KV, VRAM). Both are secondary, vendor-adjacent sources.',
};

export const researchLimits = [
  'learn-inference.com/chapters/reading and inferenceengineering.tech /reading/, /paths/* step lists, /glossary and /exercises/ index could not be fetched, so the reading lists are not mined.',
  'Section headings of both sites are verified; individual reading-list items are not.',
  'Deep links are limited to URLs the spec author saw returned or listed on fetched pages. Listed-but-unopened URLs are marked “listed”.',
];

export const openQuestions = [
  'Reading lists not mined: learn-inference /chapters/reading (B.1–B.6) and inferenceengineering /reading/ items are unverified, so no “via reading list” provenance appears yet. Needs a follow-up research pass.',
  'Glossaries of both sites were not mined (the learn-inference glossary page exists, ~213 terms).',
  'Path step lists on inferenceengineering.tech are unverified; only names and times (~3h/~4h/~4h) are confirmed.',
  'Seed URLs: 16 of 23 resolved with matching titles at build (2026-10-08). 7 could not be verified from the build environment (ACM DL and Elsevier fetches blocked, queue.acm.org returned HTTP 526, the Kubernetes API-conventions page is robots-blocked); each is flagged where it appears.',
  'Rubin naming (NVL144 → NVL72) and CPX timing come from secondary sources.',
  'Comm/compute SM contention and NVLS details are unverified.',
  'ADR-082 is Proposed and could change. Re-check PR #365 before relying on it.',
];

export const additionalSources = [
  'NVIDIA newsroom, CES 2026 (2026-01-05): Rubin in full production, partner availability H2 2026 (via secondary quotes).',
  'Tom’s Hardware and StorageReview Rubin coverage (secondary).',
  'nccl-tests issue #45 (all-gather busBW phrasing).',
  'learn-inference.com homepage (structure; “independent companion” disclaimer).',
  'inferenceengineering.tech /free-pdf/: chapters are free online; the PDF is a cheat-sheet bundle gated by email.',
  'Baseten book page: 256 pp, ~46k words; PDF/EPUB/print/audiobook formats.',
  'The book was finished January 2026 (Baseten ch0 page).',
];
