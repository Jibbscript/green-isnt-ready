# Runtime QA for the NVCRE learning artifact (design outline §8 + appendix §21).
# Usage (from the repo root, after scripts/build.sh): python3 scripts/verify.py out/index.html node_modules/axe-core/axe.min.js data/appendix.json
# Or just: pnpm qa
import asyncio, json, pathlib, re, sys
from playwright.async_api import async_playwright

PAGE, AXE_PATH, DATA_PATH = sys.argv[1], sys.argv[2], sys.argv[3]
URL = pathlib.Path(PAGE).resolve().as_uri()
AXE = open(AXE_PATH).read()
DATA = json.load(open(DATA_PATH))
R = []
def rec(name, ok, detail=''):
    R.append((name, ok, detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  — {detail}' if detail else ''), flush=True)

SEC_FOR_LOC = {'S1': ['s1'], 'S2': ['s2'], 'S3': ['s3'], 'S4': ['s4'], 'S5': ['s5'], 'S6': ['s6'], 'S7': ['s7'], 'C3': ['s4'], 'C4/§7': ['s5', 's7']}
TITLE = {e['id']: e['title'] for e in DATA['entries']}
TITLE.update({c['id']: f"{c['id'].upper()} · {c['title']}" for c in DATA['cards']})
TITLE.update({f['id']: f"{f['id']} · {f['title']}" for f in DATA['formulas']})

OPEN_ALL = 'document.querySelectorAll("details:not(.menu)").forEach(d => d.open = true)'
WORDS_JS = '''(sel) => {
  const root = document.querySelector(sel); if (!root) return null;
  const isWord = (t) => /[\\p{L}\\p{N}]/u.test(t);
  const count = (excludeSel) => {
    let n = 0; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const t = w.currentNode, el = t.parentElement; if (!el) continue;
      if (el.closest('.sr-only, script, style, [aria-hidden="true"]')) continue;
      const d = el.closest('details'); if (d && !d.open && !el.closest('summary')) continue;
      if (excludeSel && el.closest(excludeSel)) continue;
      if (!el.getClientRects().length) continue;
      n += t.textContent.split(/\\s+/).filter(isWord).length;
    }
    return n;
  };
  return { all: count(null), prose: count('.stage, .table-wrap, details, .verdict-card, .cluster') };
}'''

async def new_page(b, w=380, h=800, scheme='light', motion='no-preference', init=None):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, color_scheme=scheme, reduced_motion=motion)
    if init: await ctx.add_init_script(init)
    pg = await ctx.new_page()
    pg.errors, pg.requests = [], []
    pg.on('console', lambda m: pg.errors.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: pg.errors.append('pageerror: ' + str(e)))
    pg.on('request', lambda r: pg.requests.append(r.url))
    await pg.goto(URL); await pg.wait_for_timeout(500)
    return ctx, pg

async def goto_hash(pg, h, wait=250):
    await pg.evaluate(f'location.hash = {json.dumps(h)}'); await pg.wait_for_timeout(wait)

async def axe(pg, label):
    await pg.add_script_tag(content=AXE)
    res = await pg.evaluate('''async () => { const r = await axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes.slice(0,3).map(x => x.target.join(' ') + ' :: ' + (x.failureSummary||'').split('\\n').slice(1,2).join('')) })); }''')
    rec(f'axe: {label}', not res, '; '.join(f"{v['id']}({v['impact']},{v['n']}): {v['t'][0][:160]}" for v in res))
    return res

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # ── 1. load, console, network
        ctx, pg = await new_page(b, motion='reduce')
        errs = [e for e in pg.errors if 'ERR_TUNNEL_CONNECTION_FAILED' not in e and 'fonts.g' not in e]
        rec('no console/page errors on load', not errs, '; '.join(errs[:5]))
        bad = [u for u in pg.requests if not (u.startswith('file://') or u.startswith('data:') or u.startswith('https://fonts.googleapis.com') or u.startswith('https://fonts.gstatic.com'))]
        rec('no runtime fetches beyond Google Fonts', not bad, ', '.join(bad[:5]))
        html = open(PAGE).read()
        rec('appendix data shipped as <script type="application/json" id="appendix-data">', 'type="application/json" id="appendix-data"' in html)
        src_html = open('out/green-isnt-ready.html').read()
        rec('<title> within first 8KB of the published file', 0 <= src_html.find('<title>') < 8192, f"at byte {src_html.find('<title>')}")
        rec('published file has no skeleton tags', not re.search(r'<!doctype|<html|<head>|<body', src_html, re.I))
        size = len(src_html.encode())
        rec('page size ≤ 16 MB', size < 16 * 1024 * 1024, f'{size/1024:.0f} KB')

        # ── 2. anchors present, ≤1 per term per section, in their mapped section
        await pg.evaluate(OPEN_ALL)
        place = await pg.evaluate('''() => [...document.querySelectorAll('[data-anchor]')].map(el => [el.dataset.anchor, (el.closest('section[data-sec]')||{}).id || '?'])''')
        ids = {a['id'] for a in DATA['anchors']}
        placed = {}
        for a, s in place: placed.setdefault(a, []).append(s)
        missing = sorted(ids - set(placed)); unknown = sorted(set(placed) - ids)
        rec(f'all {len(ids)} anchors render in the article', not missing and not unknown, f'missing {missing} unknown {unknown}')
        dup = {a: s for a, s in placed.items() if len(s) != len(set(s))}
        rec('≤1 anchor per term per section', not dup, str(dup))
        wrong = {a['id']: placed.get(a['id']) for a in DATA['anchors'] if not set(placed.get(a['id'], [])) & set(SEC_FOR_LOC[a['loc']])}
        rec('every anchor appears in its mapped location (§12)', not wrong, str(wrong))
        rec('anchors are buttons with aria-haspopup=dialog', await pg.evaluate('''() => [...document.querySelectorAll('[data-anchor]')].every(b => b.tagName === 'BUTTON' && b.getAttribute('aria-haspopup') === 'dialog')'''))
        rec('C5 explanation links point at real entries', all(r in TITLE for r in ['a-nvcre-verdicts', 'a-readiness', 'd-taints', 'a-nvcre-testscale', 'a-nvlink-domain', 'a-nvidia-stack', 'a-stack-compat']))

        # ── 3. every anchor opens the sheet correctly; Esc closes and returns focus
        fails = []
        for a in DATA['anchors']:
            btn = pg.locator(f'[data-anchor="{a["id"]}"]').first
            await btn.evaluate('el => el.scrollIntoView({ block: "center" })'); await btn.click(); await pg.wait_for_timeout(120)
            st = await pg.evaluate('''() => { const d = document.querySelector('[role="dialog"]'); if (!d) return null;
              return { modal: d.getAttribute('aria-modal'), title: d.querySelector('.sheet__title')?.textContent, focusTitle: document.activeElement === d.querySelector('.sheet__title'),
                       term: d.querySelector('.sheet__term')?.textContent, start: !!d.querySelector('a[target="_blank"]') || !!d.querySelector('pre') || !!d.querySelector('.sheet__why') }; }''')
            exp = TITLE[a['entries'][0]]
            if not st or st['modal'] != 'true' or st['title'] != exp or not st['focusTitle'] or a['term'] not in (st['term'] or ''):
                fails.append(f"{a['id']}: {st}")
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(120)
            back = await pg.evaluate(f'''() => !document.querySelector('[role="dialog"]') && document.activeElement?.dataset?.anchor === {json.dumps(a['id'])}''')
            if not back: fails.append(f"{a['id']}: Esc did not close/return focus")
        rec('every anchor: sheet opens (role=dialog, aria-modal), focuses heading, shows term; Esc closes and returns focus', not fails, '; '.join(fails[:4]))

        # alternates inside the sheet + focus trap + backdrop close
        await pg.locator('[data-anchor="anc-busbw"]').first.click(); await pg.wait_for_timeout(150)
        alts = await pg.locator('.sheet__alt .chip').count()
        rec('multi-target anchor offers its other targets (anc-busbw → f-01, f-02)', alts == 2, f'{alts} chips')
        await pg.locator('.sheet__alt .chip').first.click(); await pg.wait_for_timeout(120)
        rec('switching target updates the sheet', (await pg.locator('.sheet__title').text_content()).startswith('f-01'))
        inside = True
        for _ in range(25):
            await pg.keyboard.press('Tab')
            if not await pg.evaluate('''() => !!document.activeElement.closest('[role="dialog"]')'''): inside = False; break
        rec('focus is trapped inside the sheet (25 × Tab)', inside)
        await pg.mouse.click(5, 5); await pg.wait_for_timeout(200)
        rec('backdrop click closes the sheet', await pg.evaluate('''() => !document.querySelector('[role="dialog"]')'''))

        # ── 4. open in appendix → back to the article restores place + focus
        await pg.evaluate('document.querySelectorAll("details:not(.menu)").forEach(d => d.open = false)')
        btn = pg.locator('[data-anchor="anc-busbw"]').first
        await btn.evaluate('el => el.scrollIntoView({ block: "center" })'); y0 = await pg.evaluate('scrollY')
        await btn.click(); await pg.wait_for_timeout(150)
        await pg.get_by_role('button', name='Open in appendix').click(); await pg.wait_for_timeout(350)
        h = await pg.evaluate('location.hash'); fid = await pg.evaluate('document.activeElement?.id')
        rec('"Open in appendix" routes to the entry and focuses its heading', h == '#appendix/d/d-collectives' and fid == 'appx-h1', f'{h} focus={fid}')
        await pg.locator('.topbar').get_by_role('button', name='Article').click(); await pg.wait_for_timeout(400)
        y1 = await pg.evaluate('scrollY'); act = await pg.evaluate('document.activeElement?.dataset?.anchor')
        rec('"Article" returns to the same scroll position and refocuses the anchor', abs(y1 - y0) < 4 and act == 'anc-busbw', f'y {y0}→{y1} focus={act}')
        # seen-in jump
        await goto_hash(pg, '#appendix/a/a-dcgm', 350)
        await pg.get_by_role('button', name=re.compile(r'Seen in S6')).click(); await pg.wait_for_timeout(500)
        act = await pg.evaluate('document.activeElement?.dataset?.anchor'); vis = await pg.evaluate('!document.querySelector(".shell").hidden')
        rec('"Seen in S6" jumps back to the article anchor', vis and act == 'anc-dcgm', f'focus={act}')
        # browser back
        await goto_hash(pg, '#appendix/b', 250); await goto_hash(pg, '#appendix/b/b-kv-cache', 250)
        await pg.go_back(); await pg.wait_for_timeout(300)
        rec('browser Back works inside the appendix', await pg.evaluate('location.hash') == '#appendix/b')
        await ctx.close()

        # ── 5. routes
        ctx, pg = await new_page(b, 1280, 900)
        routes = [('#appendix', 'Fundamentals Appendix'), ('#appendix/a', DATA['modules'][0]['title']), ('#appendix/b/b-kv-cache', 'KV cache'),
                  ('#appendix.b.b-kv-cache', 'KV cache'), ('#b-kv-cache', 'KV cache'), ('#appendix/e', 'Constraints & Tradeoffs'),
                  ('#appendix/e/e-03', 'Scale-up vs scale-out'), ('#appendix/e/f-05', 'KV cache per token'), ('#appendix/e/explorer', 'Readiness constraint explorer'),
                  ('#appendix/paths', 'Refresh paths'), ('#p-2', 'Refresh paths'), ('#appendix/registry', 'Resource registry'),
                  ('#appendix/crosswalk', 'Book & site crosswalk'), ('#appendix/x/zzz', 'No entry called')]
        bad = []
        for hsh, t in routes:
            await goto_hash(pg, hsh)
            got = await pg.evaluate('document.getElementById("appx-h1")?.textContent || ""')
            if not got.startswith(t): bad.append(f'{hsh} → {got!r}')
        rec('hash routes (incl. dot form and bare id) render the right page', not bad, '; '.join(bad))
        await goto_hash(pg, '#appendix/e/matrix', 400)
        top = await pg.evaluate('document.getElementById("e-matrix").getBoundingClientRect().top')
        rec('#appendix/e/matrix scrolls to the matrix', 0 <= top < 160, f'top={top:.0f}')
        bad = []
        for item, t in TITLE.items():
            await goto_hash(pg, '#' + item, 60)
            got = await pg.evaluate('document.getElementById("appx-h1")?.textContent || ""')
            if got != t.split(' · ', 1)[-1] and got != t: bad.append(f'{item} → {got!r}')
        rec(f'all {len(TITLE)} entries/cards/formulas have a working page', not bad, '; '.join(bad[:5]))
        # reachability: tabs on every appendix page; module pages list every entry
        tabs_ok, list_ok = True, []
        for m in 'abcd':
            await goto_hash(pg, f'#appendix/{m}', 200)
            n_links = await pg.evaluate(f'document.querySelectorAll(\'.elist a[href^="#appendix/{m}/"]\').length')
            n_exp = sum(1 for e in DATA['entries'] if e['module'] == m)
            if n_links != n_exp: list_ok.append(f'{m}: {n_links}/{n_exp}')
            tabs_ok &= await pg.evaluate('document.querySelectorAll(".tabs .tab").length') == 9
        await goto_hash(pg, '#appendix/e', 200)
        n_cards = await pg.evaluate('document.querySelectorAll(\'a.tcard[href^="#appendix/e/e-"]\').length'); n_f = await pg.evaluate('document.querySelectorAll(\'a.formula[href^="#appendix/e/f-"]\').length')
        rec('≤3 taps to any entry: Fundamentals → module tab → entry (tabs on every page, module lists complete)', tabs_ok and not list_ok and n_cards == 15 and n_f == 15, f'{list_ok} cards={n_cards} formulas={n_f}')
        # search + filters
        await goto_hash(pg, '#appendix', 250)
        await pg.fill('input[type=search]', 'busbw'); await pg.wait_for_timeout(150)
        hits = await pg.evaluate('[...document.querySelectorAll(".elist .eitem")].map(a => a.getAttribute("href"))')
        rec('search finds d-collectives for "busbw"', any(h.endswith('/d-collectives') for h in hits), f'{len(hits)} hits')
        await pg.fill('input[type=search]', ''); await pg.get_by_role('button', name='Kernels').click(); await pg.wait_for_timeout(150)
        hits = await pg.evaluate('[...document.querySelectorAll(".elist .eitem")].map(a => a.getAttribute("href"))')
        rec('domain filter narrows to module C', hits and all('/c/' in h for h in hits), f'{len(hits)} hits')
        await goto_hash(pg, '#appendix/registry', 250)
        await pg.get_by_role('button', name='Only unverified').click(); await pg.wait_for_timeout(150)
        n = await pg.evaluate('document.querySelectorAll(".grid-cards .rcard").length')
        n_exp = sum(1 for r in DATA['resources'] if r['status'] not in ('verified', 'main-spec', 'link-checked'))
        rec('registry "Only unverified" filter', n == n_exp, f'{n}/{n_exp}')
        # resource-card policy: links open in new tab with noopener noreferrer, no favicons
        await goto_hash(pg, '#appendix/registry', 200)
        rel = await pg.evaluate('''() => [...document.querySelectorAll('.rcard a[target="_blank"]')].every(a => /noopener/.test(a.rel) && /noreferrer/.test(a.rel))''')
        imgs = await pg.evaluate('document.querySelectorAll("img").length')
        rec('external links: target=_blank rel="noopener noreferrer"; no favicons/images', rel and imgs == 0)
        # explorer numbers
        await goto_hash(pg, '#appendix/e/explorer', 300)
        txt = await pg.evaluate('document.querySelector(".explorer-out").textContent')
        rec('explorer defaults: algBW 470.67 GB/s, t ≈ 34.0 ms, 92.6%, MTBF ≈ 3,167 h', all(x in txt for x in ['470.67', '34.0 ms', '92.6%', '3,167']), txt[:200])
        await ctx.close()

        # ── 6. interactives (UI wiring)
        ctx, pg = await new_page(b, 1280, 900, motion='reduce')
        c4 = pg.locator('[data-comp="C4"]')
        v0 = await c4.locator('.pill').first.text_content()
        warn0 = await c4.get_by_text('No thresholds ship by default').count()
        rec('C4 default: PASSED with the "No thresholds ship by default" banner', 'PASSED' in v0 and warn0 == 1, v0)
        await c4.get_by_label('Set a threshold').check(); await pg.wait_for_timeout(100)
        v1 = await c4.locator('.pill').first.text_content(); t1 = await c4.text_content()
        rec('C4 GB200 MNNVL-on 882.51 vs ≥900 → FAILED / ThresholdViolation / JobValidationFailed', 'FAILED' in v1 and 'ThresholdViolation' in t1 and 'JobValidationFailed' in t1)
        await c4.locator('input[type=number]').fill('100'); await c4.get_by_label('gpu-node-03 was cordoned before the run').check(); await pg.wait_for_timeout(100)
        rec('C4 cordoned + otherwise passing → INCOMPLETE', 'INCOMPLETE' in await c4.locator('.pill').first.text_content())
        await c4.get_by_label('Health expression fired on gpu-node-12').check(); await pg.wait_for_timeout(100)
        rec('C4 health expression fired → FAILED / HardwareFailureDetected', 'FAILED' in await c4.locator('.pill').first.text_content() and 'HardwareFailureDetected' in await c4.text_content())
        c3 = pg.locator('[data-comp="C3"]')
        for fault, node in [('Degraded NVLink on one node', 'gpu-node-07'), ('Scale-out NIC or link degraded on one node', 'gpu-node-12')]:
            await c3.get_by_label(fault).check()
            await c3.get_by_role('button', name='Run diagnose').click(); await pg.wait_for_timeout(80)
            if await c3.get_by_role('button', name='Pause').count(): await c3.get_by_role('button', name='Pause').click()
            for _ in range(12):
                nb = c3.get_by_role('button', name='Next stage')
                if await nb.is_disabled(): break
                await nb.click(); await pg.wait_for_timeout(40)
            rep = await c3.locator('.report').text_content()
            rec(f'C3 diagnose names {node} ({fault.split(" ")[0]})', node in rep and 'ThresholdViolation' in rep, rep[:140])
        await c3.get_by_label('Node already cordoned').check(); await c3.get_by_role('button', name='Run full-scale').click(); await pg.wait_for_timeout(80)
        rec('C3 cordoned node → INCOMPLETE', 'INCOMPLETE' in await c3.locator('.report').text_content())
        c1 = pg.locator('[data-comp="C1"]')
        await c1.get_by_role('button', name=re.compile('^Job:')).click(); await pg.wait_for_timeout(60)
        a = await c1.locator('.panel__title').text_content()
        await c1.get_by_role('button', name=re.compile('^TrainJob:')).focus(); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(60)
        b2 = await c1.locator('.panel__title').text_content()
        rec('C1 nodes select by click and by keyboard', a.startswith('Job') and b2.startswith('TrainJob'), f'{a} / {b2}')
        await c1.get_by_role('button', name='Report (bottom-up)').click(); await pg.wait_for_timeout(60)
        rec('C1 report mode shows the failedNodes path', await c1.locator('.dedge--report').count() == 3)
        c5 = pg.locator('[data-comp="C5"]')
        for qi in range(5):
            await c5.locator('fieldset.q').nth(qi).locator('input[type=radio]').nth(1).check(); await pg.wait_for_timeout(30)
        done = await c5.text_content()
        ls = await pg.evaluate('localStorage.getItem("nvcre-quiz-done")')
        rec('C5 completes with feedback and sets the quiz flag', 'Done:' in done and ls == '1', re.search(r'Done: \d of 5', done).group(0) if 'Done:' in done else '')
        n_refs = await c5.locator('[data-fund]').count()
        rec('C5 explanations link to appendix entries', n_refs >= 5, f'{n_refs} links')
        await ctx.close()

        # ── 7. reduced motion
        ctx, pg = await new_page(b, 1280, 900, motion='reduce')
        c3 = pg.locator('[data-comp="C3"]')
        await c3.get_by_role('button', name='Run diagnose').click(); await pg.wait_for_timeout(1500)
        auto = await c3.get_by_role('button', name=re.compile('Auto-play|Pause')).count()
        stage = await c3.locator('.stages [aria-current="step"]').text_content()
        rec('reduced motion: no auto-play, manual stepping only', auto == 0 and stage.startswith('intra-screening'), f'auto buttons={auto} stage={stage}')
        sb = await pg.evaluate('getComputedStyle(document.documentElement).scrollBehavior')
        rec('reduced motion: smooth scrolling off', sb == 'auto', sb)
        await ctx.close()

        # ── 8. storage blocked + theme
        ctx, pg = await new_page(b, 380, 800, init='Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });')
        ok = await pg.evaluate('document.querySelectorAll("[data-anchor]").length') > 60
        await pg.locator('[data-anchor="anc-mfu"]').first.click(); await pg.wait_for_timeout(150)
        ok2 = await pg.locator('[role="dialog"]').count() == 1
        perr = [e for e in pg.errors if e.startswith('pageerror')]
        rec('works with localStorage blocked (render, sheet, no page errors)', ok and ok2 and not perr, '; '.join(perr[:3]))
        await ctx.close()
        ctx, pg = await new_page(b, 1280, 900)
        seq = []
        for _ in range(3):
            await pg.locator('.topbar button[aria-label^="Theme"]').click(); await pg.wait_for_timeout(50)
            seq.append(await pg.evaluate('document.documentElement.getAttribute("data-theme")'))
        rec('theme toggle cycles light → dark → system', seq == ['light', 'dark', None], str(seq))
        await pg.locator('.topbar button[aria-label^="Theme"]').click(); await pg.locator('.topbar button[aria-label^="Theme"]').click()
        await pg.reload(); await pg.wait_for_timeout(300)
        rec('theme choice persists across reload', await pg.evaluate('document.documentElement.getAttribute("data-theme")') == 'dark')
        bg = await pg.evaluate('getComputedStyle(document.body).backgroundColor')
        rec('body paints an explicit token background', bg == 'rgb(13, 17, 23)', bg)
        await ctx.close()

        # ── 9. overflow + tap targets + axe, both widths and themes
        appx_pages = ['#appendix', '#appendix/a', '#appendix/a/a-dcgm', '#appendix/e', '#appendix/e/e-08', '#appendix/e/f-02', '#appendix/e/explorer', '#appendix/paths', '#appendix/registry', '#appendix/crosswalk']
        for w, scheme in [(380, 'light'), (380, 'dark'), (1280, 'light'), (1280, 'dark')]:
            ctx, pg = await new_page(b, w, 800, scheme)
            await pg.evaluate(OPEN_ALL); await pg.wait_for_timeout(150)
            over = []
            sw = await pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if sw > 0: over.append(f'article +{sw}px')
            for hsh in appx_pages:
                await goto_hash(pg, hsh, 200); await pg.evaluate(OPEN_ALL)
                sw = await pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
                if sw > 0: over.append(f'{hsh} +{sw}px')
            rec(f'no horizontal page scroll at {w}px ({scheme})', not over, '; '.join(over))
            if w == 380 and scheme == 'light':
                await goto_hash(pg, '', 300); await pg.evaluate(OPEN_ALL)
                small = await pg.evaluate('''() => { const out = [];
                  const sel = '.btn, .chip, .seg button, .tab, .drawer > summary, select, input[type=range], .check, .q__opt, .eitem, .steps a, .menu > summary, .dnode, .rail a';
                  for (const el of document.querySelectorAll(sel)) { const r = el.getBoundingClientRect(); if (!r.width) continue;
                    if (r.height < 43.5 || r.width < 43.5) out.push((el.className.baseVal ?? el.className) + ' ' + Math.round(r.width) + '×' + Math.round(r.height) + ' ' + (el.textContent||'').trim().slice(0,30)); }
                  return out; }''')
                rec('tap targets ≥44×44 at 380px (article controls)', not small, '; '.join(small[:6]))
                for hsh in ['#appendix', '#appendix/a/a-dcgm', '#appendix/registry']:
                    await goto_hash(pg, hsh, 200)
                    small = await pg.evaluate('''() => [...document.querySelectorAll('.btn, .chip, .tab, select, input:not([type=checkbox]):not([type=radio]), .eitem')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.height < 35.5 || r.width < 35.5); }).map(el => el.className + ' ' + (el.textContent||'').trim().slice(0,24))''')
                    rec(f'appendix controls ≥36px (chips) / ≥44px (buttons) at 380px {hsh}', not small, '; '.join(small[:5]))
            # axe on article + sheet + appendix pages
            if w == 380 or scheme == 'dark':
                await goto_hash(pg, '', 300); await pg.evaluate(OPEN_ALL)
                await axe(pg, f'article {w}px {scheme} (all drawers open)')
                await pg.locator('[data-anchor="anc-goodput"]').first.click(); await pg.wait_for_timeout(250)
                await axe(pg, f'sheet open {w}px {scheme}')
                await pg.keyboard.press('Escape')
                for hsh in appx_pages:
                    await goto_hash(pg, hsh, 250); await pg.evaluate(OPEN_ALL)
                    await axe(pg, f'{hsh} {w}px {scheme}')
            await ctx.close()

        # ── 10. budgets + content rules
        ctx, pg = await new_page(b, 1280, 900)
        s1 = await pg.evaluate(WORDS_JS, '#s1')
        rec('S1 skim ≤ 120 visible words', s1['all'] <= 120, str(s1))
        total = {'all': 0, 'prose': 0}
        for s in ['s1', 's2', 's3', 's4', 's5', 's6', 's7']:
            wv = await pg.evaluate(WORDS_JS, '#' + s); total['all'] += wv['all']; total['prose'] += wv['prose']
            print(f'      {s}: {wv}')
        guide = await pg.evaluate(WORDS_JS, '.legend-strip')
        rec('main path ≤ ~2,100 visible prose words (drawers closed)', total['prose'] + guide['all'] <= 2100, f"prose {total['prose'] + guide['all']}, all text incl. interactives {total['all'] + guide['all']}")
        rec('≤ 7 sections', await pg.evaluate('document.querySelectorAll("section[data-sec]").length') == 7)
        s5 = await pg.evaluate('document.getElementById("s5").textContent')
        rec('"No thresholds ship by default" appears in S5 and in C4', s5.count('No thresholds ship by default') >= 2)
        rec('C2 and C3 carry an Illustrative badge', await pg.evaluate('''() => ['C2','C3'].every(c => document.querySelector(`[data-comp="${c}"] .badge--illus`))'''))
        foot = await pg.evaluate('document.querySelector(".foot").textContent')
        rec('footer version stamp', 'Based on NVCRE v0.6.0 docs/repo, researched 2026-10-08' in foot)
        await pg.evaluate(OPEN_ALL)
        mono = await pg.evaluate('''() => ['testScale: diagnose', 'ThresholdViolation', 'nvcre_nccl_busbw_gbs', 'busBandwidthGBps'].map(id => [id, [...document.querySelectorAll('code')].some(c => c.textContent.includes(id))])''')
        rec('identifiers set in mono (code) with exact casing', all(x[1] for x in mono), str(mono))
        nsrc = await pg.evaluate('document.querySelectorAll("[data-src]").length')
        rec('sourced numbers carry data-src', nsrc >= 15, f'{nsrc} tagged')
        sent = await pg.evaluate('''() => document.querySelector('#main').innerText.split(/(?<=[.!?])\\s+/).filter(s => /NVCRE/.test(s) && /(Slurm|firmware|continuous|quarantin|cordon|taint)/i.test(s))''')
        print('      sentences pairing NVCRE with Slurm/firmware/continuous/quarantine/cordon/taint (manual review):')
        for s in sent: print('        · ' + ' '.join(s.split())[:200])
        await ctx.close()
        await b.close()

    fails = [r for r in R if not r[1]]
    print(f'\n{len(R) - len(fails)} passed, {len(fails)} failed')
    return len(fails)

sys.exit(1 if asyncio.run(main()) else 0)
