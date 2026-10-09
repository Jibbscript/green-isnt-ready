import { R } from '../lib/appx';
import { Drawer, N, SecHead, TableWrap } from '../components/ui';
import { IconWarn } from '../components/Icon';
import { C2Straggler } from '../interactives/C2Straggler';

export function S2Why() {
  return (
    <section id="s2" className="sec" aria-labelledby="s2-title" data-sec="S2">
      <SecHead id="S2" label="Why" title="Faults Hide Until There’s Load" lead="At scale, hardware faults are routine. The worst ones raise no alarm." />
      <div className="prose">
        <p>
          Meta’s Llama 3 paper covers a 54-day snapshot of 405B pretraining on up to <N src="Llama 3 §3.3">16,384</N> H100s. It logged{' '}
          <N src="Llama 3 Table 5">419</N> unexpected <R a="anc-interruptions">job interruptions</R>, and about <N src="Llama 3 §3.3">78%</N> were
          confirmed or suspected hardware issues. The run still kept more than <N src="Llama 3 §3.3">90%</N> effective training time.
          ByteDance’s MegaScale reached <N src="MegaScale NSDI’24">55.2%</N> <R a="anc-mfu">MFU</R> on <N src="MegaScale NSDI’24">12,288</N> GPUs
          while recovering the job more than <N src="MegaScale NSDI’24">100</N> times, with dedicated straggler tooling.
        </p>
        <p>
          Crashes are the easy case. NVCRE’s FAQ calls the hard case a <R a="anc-fail-slow">gray failure</R>: hardware that is degraded while no
          health monitor fires. A slow GPU, a link that degrades under load, or a configuration that routes traffic over a slower path all look
          healthy until a real job runs. Some faults raise no error at all; <R a="anc-sdc">silent data corruption</R> returns wrong numbers quietly.
        </p>
        <p>
          <R a="anc-sync-step">Synchronous training</R> waits for every rank at every step, so one degraded GPU holds the whole job to the speed
          of its worst rank (NVIDIA blog). Each stall and each straggler eats <R a="anc-goodput">goodput</R>, the share of wall time spent making progress.
        </p>
      </div>
      <C2Straggler />
      <p className="small muted" style={{ maxWidth: '72ch' }}>
        These are runtime statistics from mature fleets. They show that faults are routine at scale. They do not measure what share NVCRE would catch.
      </p>
      <Drawer title="The full Llama 3 breakdown">
        <TableWrap label="Llama 3 interruption breakdown">
          <table className="tbl">
            <caption>54-day snapshot, up to 16,384 H100s (Llama 3 paper, Table 5 and §3.3)</caption>
            <thead><tr><th scope="col">Measure</th><th scope="col" className="num">Value</th></tr></thead>
            <tbody>
              <tr><th scope="row">Total interruptions</th><td className="num">466</td></tr>
              <tr><th scope="row">Planned</th><td className="num">47</td></tr>
              <tr><th scope="row">Unexpected</th><td className="num">419</td></tr>
              <tr><th scope="row">Confirmed or suspected hardware</th><td className="num">≈78%</td></tr>
              <tr><th scope="row">GPU issues (share of unexpected)</th><td className="num">58.7%</td></tr>
              <tr><th scope="row">Faulty GPU</th><td className="num">148 (30.1%)</td></tr>
              <tr><th scope="row">HBM3 memory</th><td className="num">72 (17.2%)</td></tr>
              <tr><th scope="row">Effective training time</th><td className="num">&gt;90%</td></tr>
            </tbody>
          </table>
        </TableWrap>
        <div className="callout callout--warn">
          <IconWarn />
          <div><p className="callout__title">Caveat</p><p>Runtime failure statistics from mature fleets; not a measure of what NVCRE catches.</p></div>
        </div>
      </Drawer>
    </section>
  );
}
