// Turns Parcel's bundle.html into two outputs.
// out/green-isnt-ready.html is the artifact body:
// - no <!doctype>/<html>/<head>/<body> (the artifact host adds its own skeleton)
// - <title> first (the host only scans the first 8KB for it)
// - theme pre-paint script, Google Fonts links, inline CSS, #root
// - the appendix dataset as <script type="application/json" id="appendix-data"> (§13)
// - the inlined app bundle
// out/index.html is the same page inside the minimal skeleton the artifact host adds, so it opens
// locally or on any static host. Browser QA (scripts/verify.py) runs against it.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync('bundle.html', 'utf8');
const data = readFileSync('data/appendix.json', 'utf8');
JSON.parse(data); // must be valid

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1].trim(), body: m[2] }));
if (!styles.length) throw new Error('no <style> found');
if (!scripts.some((s) => /type="?module/.test(s.attrs))) throw new Error('no module script found');

const out = [
  '<title>Green Isn\'t Ready</title>',
  '<meta name="description" content="How NVIDIA\'s Cluster Readiness Engine certifies GPU clusters under load, with a fundamentals appendix.">',
  '<script>document.documentElement.lang||(document.documentElement.lang="en");try{var t=localStorage.getItem("nvcre-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap">',
  ...styles.map((s) => `<style>${s}</style>`),
  '<div id="root"></div>',
  `<script type="application/json" id="appendix-data">${data.replace(/</g, '\\u003c')}</script>`,
  ...scripts.map((s) => `<script${s.attrs ? ' ' + s.attrs : ''}>${s.body}</script>`),
].join('\n');

const skeleton = '<!doctype html><html><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  + '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}'
  + 'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
  + '</head><body>';

mkdirSync('out', { recursive: true });
writeFileSync('out/green-isnt-ready.html', out);
writeFileSync('out/index.html', skeleton + out + '</body></html>');
const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
const titleAt = out.indexOf('<title>');
console.log(`out/green-isnt-ready.html + out/index.html  ${kb} KB · title at byte ${titleAt} · ${styles.length} style · ${scripts.length} script blocks · scripts attrs: ${scripts.map((s) => s.attrs || '(classic)').join(' | ')}`);
