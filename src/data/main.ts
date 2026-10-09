// Sourced values from the design outline (§1, §7, §10). Nothing here is invented;
// placeholders used by the illustrative models live in src/lib/diagnose.ts.

export const VALIDATION_RESULTS_URL = 'https://docs.nvidia.com/cluster-readiness-engine/api-reference/validation-results/';
export const BLOG_URL = 'https://developer.nvidia.com/blog/validate-gpu-cluster-readiness-before-ai-workloads-land';

export interface Run {
  id: string; label: string; cloud: string; gpu: string; nodes: number; fabric: string; mnnvl: 'on' | 'off' | 'n/a';
  allReduce: number; allGather: number | null; alltoall: number | null; goodput: number | null; tflops: number | null;
  src: string;
}
// §7.2 — Validation Results page (16 GB message size; all PASSED; no thresholds set) + README/blog 16-node run.
export const RUNS: Run[] = [
  { id: 'aws-h100', label: 'AWS H100 ×2 · EFA', cloud: 'AWS', gpu: 'H100', nodes: 2, fabric: 'EFA', mnnvl: 'n/a', allReduce: 487.87, allGather: 338.57, alltoall: 79.11, goodput: 0.9, tflops: 539.8, src: 'Validation Results' },
  { id: 'aws-gb200-on', label: 'AWS GB200 ×4 · EFA · MNNVL on', cloud: 'AWS', gpu: 'GB200', nodes: 4, fabric: 'EFA', mnnvl: 'on', allReduce: 882.51, allGather: 609.28, alltoall: 568.66, goodput: 0.68, tflops: 1186.5, src: 'Validation Results' },
  { id: 'aws-gb200-off', label: 'AWS GB200 ×4 · EFA · MNNVL off', cloud: 'AWS', gpu: 'GB200', nodes: 4, fabric: 'EFA', mnnvl: 'off', allReduce: 191.4, allGather: 191.26, alltoall: 58.15, goodput: 0.66, tflops: 1118.5, src: 'Validation Results' },
  { id: 'aws-gb300-on', label: 'AWS GB300 ×8 · RoCE · MNNVL on', cloud: 'AWS', gpu: 'GB300', nodes: 8, fabric: 'RoCE', mnnvl: 'on', allReduce: 923.32, allGather: 698.74, alltoall: 678.57, goodput: 0.57, tflops: 1388.5, src: 'Validation Results' },
  { id: 'aws-gb300-off', label: 'AWS GB300 ×8 · RoCE · MNNVL off', cloud: 'AWS', gpu: 'GB300', nodes: 8, fabric: 'RoCE', mnnvl: 'off', allReduce: 376.01, allGather: 365.68, alltoall: 85.62, goodput: 0.57, tflops: 1136.9, src: 'Validation Results' },
  { id: 'gcp-h100', label: 'GCP H100 ×2 · TCPXO', cloud: 'GCP', gpu: 'H100', nodes: 2, fabric: 'TCPXO', mnnvl: 'n/a', allReduce: 337.09, allGather: 189.27, alltoall: 40.16, goodput: 0.92, tflops: 511.7, src: 'Validation Results' },
  { id: 'gcp-gb200-on', label: 'GCP GB200 ×2 · RoCE · MNNVL on', cloud: 'GCP', gpu: 'GB200', nodes: 2, fabric: 'RoCE', mnnvl: 'on', allReduce: 838.07, allGather: 680.18, alltoall: 683.82, goodput: 0.68, tflops: 1175.0, src: 'Validation Results' },
  { id: 'gcp-gb200-off', label: 'GCP GB200 ×2 · RoCE · MNNVL off', cloud: 'GCP', gpu: 'GB200', nodes: 2, fabric: 'RoCE', mnnvl: 'off', allReduce: 837.76, allGather: 680.16, alltoall: 683.84, goodput: 0.69, tflops: 1122.0, src: 'Validation Results' },
  { id: 'readme-gb300-16', label: 'README/blog GB300 ×16 · MNNVL on', cloud: 'AWS', gpu: 'GB300', nodes: 16, fabric: '—', mnnvl: 'on', allReduce: 932.09, allGather: null, alltoall: null, goodput: null, tflops: null, src: 'README / launch blog (3m56s)' },
];

// §1.6 — catalog (8 categories in v0.6.0)
export const CATALOG = [
  { cat: 'communication/nccl-all-reduce', layer: 'Scale-up + scale-out fabric, collective bandwidth', scale: 'Multi-node group', duration: '3m56s (16× GB300, blog) to 20m20s (AWS GB200 ×4, MNNVL off)', notes: 'Non-destructive, but occupies GPUs and fabric [inferred]' },
  { cat: 'communication/nccl-all-gather', layer: 'Same', scale: 'Multi-node', duration: '2m56s (GCP GB200 ×2, MNNVL on) to 11m19s (GCP H100 ×2)', notes: 'Same' },
  { cat: 'communication/nccl-alltoall', layer: 'Same, all-to-all (MoE-like)', scale: 'Multi-node', duration: '3m7s–40m40s in published runs', notes: 'Same' },
  { cat: 'communication/nccl-loopback', layer: 'Single-node NVLink/NVSwitch', scale: 'One Job per node', duration: 'Not published', notes: 'Same' },
  { cat: 'communication/nccl-loopback-nvswitch', layer: 'NVSwitch fabric', scale: 'One Job per node', duration: 'Not published', notes: 'Same' },
  { cat: 'diagnostics/dcgm-level4', layer: 'Per-GPU deep diag (dcgmi diag -r 4, incl. memtest and pulse_test)', scale: 'One Job per node; maxConcurrent / timeoutPerJob', duration: 'About 90 min on healthy hardware; entry timeout 2h', notes: 'Heavy stress on GPU, CPU, memory, power and fabric (DCGM docs)' },
  { cat: 'training/nemotron5-8b', layer: 'End-to-end Megatron-LM pretraining (goodput, TFLOPs/GPU, step time)', scale: 'nodesPerJob option; defaults sized for DGX-class nodes', duration: 'Short runs (maxSteps 50). Superseded nemotron4-15b: 2m44s–5m40s (GCP GB200); avg step 1.11s–3.01s', notes: 'Non-destructive' },
  { cat: 'training/nemotron5-56b', layer: 'Same, larger', scale: 'Same', duration: 'Not published', notes: 'Same' },
];

export const CATALOG_OPTIONS = ['testScale', 'nodesPerJob', 'gpusPerNode', 'maxConcurrent', 'minGroupSize', 'timeoutPerJob', 'thresholds', 'enableMNNVL', 'maxSteps', 'resources', 'sourceRepo', 'nicResourceName', 'gangScheduler'];

// §7.4 — code defaults (pkg/catalog v0.6.0)
export const DEFAULTS: [string, string][] = [
  ['DefaultMinGroupSize', '2'],
  ['MaxConcurrent', '0 = unlimited'],
  ['DefaultTimeoutPerJob', '1h'],
  ['DiagnoseTimeoutPerJob', '15m'],
  ['DefaultWorkloadRunTimeoutPerJob', '24h'],
  ['dcgm-level4 timeout', '2h'],
  ['NCCL NumIterations / NumCycles', '100 / 10 (diagnose: 5 / 1)'],
  ['NCCL MaxBytes', '16G'],
  ['training MaxSteps', '50'],
  ['GoodputMeasurement sampleInterval', '60s (120s suggested for large clusters)'],
  ['CLI --wait floor', '30 min'],
];

// §1.9 — Prometheus metrics
export const METRICS: [string, string][] = [
  ['nvcre_certification_status', ''],
  ['nvcre_workflow_status', 'added in v0.6.0'],
  ['nvcre_job_status', ''],
  ['nvcre_job_failed_nodes', ''],
  ['nvcre_hardware_failures_detected_total', ''],
  ['nvcre_goodput_ratio', ''],
  ['nvcre_nccl_algbw_gbs', 'renamed from _gbps in v0.6.0 (old name: deprecated alias for one minor release)'],
  ['nvcre_nccl_busbw_gbs', 'renamed from _gbps in v0.6.0 (old name: deprecated alias for one minor release)'],
  ['nvcre_topology_validated_nodes', ''],
  ['nvcre_reconcile_duration_seconds', ''],
  ['nvcre_reconcile_total', ''],
];

// §1.4 — seven CRDs
export const CRDS: [string, string, string][] = [
  ['Certification', 'Namespaced, top-level', 'Targets + categories; spec immutable after creation'],
  ['Workflow', 'One per category', 'Catalog entry + platform/GPU overrides, iterations, grouping'],
  ['Job', 'One per node group', 'Creates the workload via an adapter (today only trainJob), CEL health, measurements'],
  ['WorkloadRun', 'Ad hoc', 'A single run that bypasses the catalog (framework: torch | mpi | exec)'],
  ['GoodputMeasurement', 'Per workload', 'Goodput from pod logs; provisional while running, frozen at Complete=True'],
  ['BandwidthMeasurement', 'Per workload', 'algBW/busBW from the complete final launcher log'],
  ['LogProfile', 'Cluster-scoped', 'Regex profiles used by the measurements'],
];

// §1.3 — support matrix
export const SUPPORT: [string, string][] = [
  ['Orchestrator', 'Kubernetes ≥1.29 only; Helm 3.x; no Slurm, no bare-metal mode'],
  ['Platform detection (spec.providerID)', 'AWS, GCP, Azure, OCI, nscale, TogetherAI, Mistral, Forge, on-prem'],
  ['GPU detection', 'nvidia.com/gpu.product, or DRA ResourceSlices since v0.6.0'],
  ['Hard prerequisites', 'NVIDIA GPU Operator (not installed by NVCRE); Kubeflow Trainer 2.2.1 (installed by setup init); Prometheus Operator CRDs or ServiceMonitor off; DRA driver for GB200/GB300 ComputeDomain; standalone DCGM (spec.dcgm.enabled=true) for dcgm-level4'],
  ['Optional', 'Gang scheduler (KAI, or Run:ai via queueLabelKey: runai/queue); Kueue-suspended workloads handled as queued'],
  ['Homogeneity', 'Every target node shares one nvidia.com/gpu.product value'],
  ['Non-NVIDIA GPUs', 'No (FAQ)'],
];

// §10 — sources
export const SOURCES = [
  'https://docs.nvidia.com/cluster-readiness-engine/overview/introduction',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/architecture/',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/catalog/',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/workload-types/',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/health-monitoring-failed-node-attribution/',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/goodput-bandwidth-measurement/',
  'https://docs.nvidia.com/cluster-readiness-engine/concepts/platform-detection-overrides/',
  'https://docs.nvidia.com/cluster-readiness-engine/getting-started/your-first-certification/',
  'https://docs.nvidia.com/cluster-readiness-engine/getting-started/quick-start/',
  'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/certify-a-cluster/',
  'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/adaptive-fault-isolation/',
  'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/run-nccl-benchmarks/',
  'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/custom-catalog-entries/',
  'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/interpret-results/',
  'https://docs.nvidia.com/cluster-readiness-engine/api-reference/certification/',
  'https://docs.nvidia.com/cluster-readiness-engine/api-reference/workflow/',
  'https://docs.nvidia.com/cluster-readiness-engine/api-reference/job/',
  'https://docs.nvidia.com/cluster-readiness-engine/api-reference/validation-results/',
  'https://docs.nvidia.com/cluster-readiness-engine/cli-reference/mcp/',
  'https://docs.nvidia.com/cluster-readiness-engine/cli-reference/cluster/',
  'https://docs.nvidia.com/cluster-readiness-engine/cli-reference/workloadrun/',
  'https://docs.nvidia.com/cluster-readiness-engine/operations/deployment/',
  'https://docs.nvidia.com/cluster-readiness-engine/operations/monitoring/',
  'https://docs.nvidia.com/cluster-readiness-engine/operations/troubleshooting/',
  'https://docs.nvidia.com/cluster-readiness-engine/operations/faq/',
  'https://github.com/NVIDIA/cluster-readiness-engine',
  'https://github.com/NVIDIA/cluster-readiness-engine/releases/tag/v0.6.0',
  'https://github.com/NVIDIA/cluster-readiness-engine/issues/403',
  'https://github.com/NVIDIA/cluster-readiness-engine/issues/405',
  'https://github.com/NVIDIA/cluster-readiness-engine/issues/430',
  'https://github.com/NVIDIA/cluster-readiness-engine/pull/451',
  'https://github.com/NVIDIA/cluster-readiness-engine/pull/380',
  'https://github.com/NVIDIA/cluster-readiness-engine/pull/365',
  'https://pkg.go.dev/github.com/NVIDIA/cluster-readiness-engine/pkg/orchestration',
  'https://pkg.go.dev/github.com/NVIDIA/cluster-readiness-engine/pkg/catalog',
  'https://developer.nvidia.com/blog/validate-gpu-cluster-readiness-before-ai-workloads-land',
  'https://docs.nvidia.com/nvsentinel/components/nvcre-certification-monitor/',
  'https://github.com/NVIDIA/aicr/issues/3090',
  'https://github.com/NVIDIA/aicr/issues/2683',
  'https://developer.nvidia.com/blog/manage-kubernetes-node-fleets-with-nodewright/',
  'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-DSX-Gives-Infrastructure-Builders-the-Playbook-for-AI-Factories/default.aspx',
  'https://docs.nvidia.com/datacenter/dcgm/latest/reference/command-line-reference/dcgmi/dcgmi-diag.html',
  'https://rafay.co/ai-and-cloud-native-blog/certifying-tenant-gpu-kubernetes-clusters-with-nvidia-cluster-readiness-engine',
  'https://ar5iv.labs.arxiv.org/html/2407.21783',
  'https://arxiv.org/abs/2402.15627',
  'https://www.usenix.org/system/files/nsdi24-jiang-ziheng.pdf',
  'https://blockchain.news/news/nvidia-cluster-readiness-engine-ai-validation',
];

export const DOCS = {
  certification: 'https://docs.nvidia.com/cluster-readiness-engine/api-reference/certification/',
  workflow: 'https://docs.nvidia.com/cluster-readiness-engine/api-reference/workflow/',
  job: 'https://docs.nvidia.com/cluster-readiness-engine/api-reference/job/',
  workloadTypes: 'https://docs.nvidia.com/cluster-readiness-engine/concepts/workload-types/',
  measurement: 'https://docs.nvidia.com/cluster-readiness-engine/concepts/goodput-bandwidth-measurement/',
  architecture: 'https://docs.nvidia.com/cluster-readiness-engine/concepts/architecture/',
  health: 'https://docs.nvidia.com/cluster-readiness-engine/concepts/health-monitoring-failed-node-attribution/',
  faultIsolation: 'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/adaptive-fault-isolation/',
  interpret: 'https://docs.nvidia.com/cluster-readiness-engine/how-to-guides/interpret-results/',
  monitoring: 'https://docs.nvidia.com/cluster-readiness-engine/operations/monitoring/',
  faq: 'https://docs.nvidia.com/cluster-readiness-engine/operations/faq/',
  mcp: 'https://docs.nvidia.com/cluster-readiness-engine/cli-reference/mcp/',
  nvsentinel: 'https://docs.nvidia.com/nvsentinel/components/nvcre-certification-monitor/',
  release: 'https://github.com/NVIDIA/cluster-readiness-engine/releases/tag/v0.6.0',
  repo: 'https://github.com/NVIDIA/cluster-readiness-engine',
};
