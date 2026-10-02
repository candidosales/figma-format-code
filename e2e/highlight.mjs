// E2E check for the plugin UI's syntax highlighting.
//
// Loads the built dist/ui.html in headless Chromium, feeds it code the same way
// the Figma sandbox does (a `text` pluginMessage), then renders every
// language x theme combination through the real UI controls.
//
// Usage:
//   node e2e/highlight.mjs <label>             write e2e/out/<label>/{preview,timings}.json
//   node e2e/highlight.mjs compare <a> <b>     diff two runs (exit 1 if previews differ)

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'e2e', 'out');
const uiUrl = pathToFileURL(join(root, 'dist', 'ui.html')).href;
const COLD_RUNS = 7;

const SAMPLES = {
  c: '#include <stdio.h>\nint main(void) { printf("hi %d\\n", 42); return 0; }',
  cpp: '#include <vector>\ntemplate <typename T> class Box { public: T value; };\nint main() { std::vector<int> v{1, 2}; return v.size(); }',
  css: '.btn{color:#fff;background:rgba(0,0,0,.5)}@media (max-width:600px){.btn{display:none}}',
  less: '@primary: #333;\n.mixin(@a) { width: @a; }\n.box { color: @primary; .mixin(10px); }',
  scss: '$primary: #333;\n@mixin m($a) { width: $a; }\n.box { color: $primary; &:hover { @include m(10px); } }',
  json: '{"name":"format-code","version":2,"tags":["a","b"],"ok":true,"none":null}',
  html: '<!doctype html><html><head><title>Hi</title><style>p{color:red}</style></head><body><p class="x">Hello</p><script>const a = 1;</script></body></html>',
  markdown: '# Title\n\nSome *emphasis* and `code`.\n\n- item one\n- item two\n\n```js\nconst a = 1;\n```\n',
  yaml: 'name: format-code\nversion: 2\ntags:\n  - a\n  - b\nnested:\n  key: "value"\n',
  graphql: 'query GetUser($id: ID!) { user(id: $id) { id name posts(first: 10) { title } } }',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tx := 42\n\tfmt.Println("hi", x)\n}',
  haskell: 'module Main where\n\nmain :: IO ()\nmain = mapM_ print [x * 2 | x <- [1..10], even x]',
  java: 'public class Main {\n  public static void main(String[] args) {\n    int x = 42;\n    System.out.println("hi " + x);\n  }\n}',
  javascript: 'const sum=(a,b)=>a+b;async function run(){const r=await fetch("/x");return r.json()}export default sum',
  kotlin: 'data class User(val name: String)\nfun main() {\n  val u = User("a")\n  println("hi ${u.name}")\n}',
  lua: 'local function add(a, b)\n  return a + b\nend\nfor i = 1, 10 do print(add(i, 2)) end',
  python: 'import os\n\nclass A:\n    def run(self, x: int) -> str:\n        return f"hi {x}"\n\nprint(A().run(42))',
  ruby: 'class Greeter\n  def initialize(name)\n    @name = name\n  end\n  def hi = puts("hi #{@name}")\nend\nGreeter.new(:a).hi',
  rust: 'fn main() {\n    let v: Vec<i32> = (1..10).filter(|x| x % 2 == 0).collect();\n    println!("{:?}", v);\n}',
  typescript: 'interface User{id:number;name?:string}export function greet(u:User):string{return `hi ${u.name ?? "anon"}`}',
};

async function openUi(browser) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('[console]', m.text()));
  // The UI loads fonts from Google; keep the run offline and deterministic.
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/css', body: '' })
  );
  const t0 = Date.now();
  await page.goto(uiUrl, { waitUntil: 'load' });
  const loadMs = Date.now() - t0;
  return { page, loadMs };
}

// Simulates figma -> UI `text` message and waits for the first highlighted preview.
async function sendText(page, code) {
  return page.evaluate(async (code) => {
    const preview = document.getElementById('preview-content');
    preview.innerHTML = '';
    document.getElementById('original-error').classList.remove('show-error');
    const t0 = performance.now();
    window.postMessage({ pluginMessage: { type: 'text', textCode: code } }, '*');
    await new Promise((resolve, reject) => {
      const check = () => {
        // Auto-detection can pick a language Prettier rejects; that run ends in the error panel.
        if (preview.querySelector('pre')) return resolve();
        if (document.getElementById('original-error').classList.contains('show-error')) return resolve();
        if (performance.now() > t0 + 10000) return reject(new Error('timeout waiting for first preview'));
        requestAnimationFrame(check);
      };
      check();
    });
    return performance.now() - t0;
  }, code);
}

// Picks format + theme in the selects and clicks Preview, like a user would.
async function render(page, format, theme) {
  return page.evaluate(
    async ({ format, theme }) => {
      document.getElementById('select-format').value = format;
      document.getElementById('select-theme').value = theme;
      const preview = document.getElementById('preview-content');
      preview.innerHTML = '';
      document.getElementById('original-error').classList.remove('show-error');
      const t0 = performance.now();
      document.getElementById('button-preview').click();
      await new Promise((resolve, reject) => {
        const deadline = t0 + 10000;
        const error = document.getElementById('original-error');
        const check = () => {
          if (preview.querySelector('pre')) return resolve();
          if (error.classList.contains('show-error')) return reject(new Error(`${format}: ${error.textContent}`));
          if (performance.now() > deadline) return reject(new Error(`timeout ${format}/${theme}`));
          requestAnimationFrame(check);
        };
        check();
      });
      return { ms: performance.now() - t0, html: preview.innerHTML };
    },
    { format, theme }
  );
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const round = (n) => Math.round(n * 10) / 10;

async function run(label) {
  const browser = await chromium.launch();
  const timings = { coldLoadMs: [], coldFirstPreviewMs: [], firstThemeSwitchMs: [], firstLangSwitchMs: [] };

  // Cold runs: fresh page each time, measure what a user feels on plugin open.
  for (let i = 0; i < COLD_RUNS; i++) {
    const { page, loadMs } = await openUi(browser);
    console.log(`cold run ${i + 1}/${COLD_RUNS}`);
    timings.coldLoadMs.push(loadMs);
    timings.coldFirstPreviewMs.push(await sendText(page, SAMPLES.typescript));
    timings.firstThemeSwitchMs.push((await render(page, 'typescript', 'nord')).ms);
    timings.firstLangSwitchMs.push((await render(page, 'rust', 'nord')).ms);
    await page.close();
  }

  // Full matrix on one page: every language x every theme offered by the UI.
  const { page } = await openUi(browser);
  const themes = await page.$$eval('#select-theme option', (os) => os.map((o) => o.value));
  const formats = await page.$$eval('#select-format option', (os) => os.map((o) => o.value));
  const missing = formats.filter((f) => !SAMPLES[f]);
  if (missing.length) throw new Error(`no sample for: ${missing.join(', ')}`);

  const preview = {};
  for (const format of formats) {
    await sendText(page, SAMPLES[format]);
    preview[format] = {};
    for (const theme of themes) {
      preview[format][theme] = (await render(page, format, theme)).html;
    }
  }
  await browser.close();

  const summary = Object.fromEntries(
    Object.entries(timings).map(([k, v]) => [k, { median: round(median(v)), runs: v.map(round) }])
  );
  const dir = join(outDir, label);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'preview.json'), JSON.stringify(preview, null, 2));
  await writeFile(join(dir, 'timings.json'), JSON.stringify(summary, null, 2));
  console.log(`${formats.length} languages x ${themes.length} themes rendered -> e2e/out/${label}/`);
  console.table(Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, v.median])));
}

async function compare(a, b) {
  const load = async (l, f) => JSON.parse(await readFile(join(outDir, l, f), 'utf8'));
  const [pa, pb, ta, tb] = await Promise.all([
    load(a, 'preview.json'), load(b, 'preview.json'), load(a, 'timings.json'), load(b, 'timings.json'),
  ]);
  const diffs = [];
  for (const format of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
    for (const theme of new Set([...Object.keys(pa[format] ?? {}), ...Object.keys(pb[format] ?? {})])) {
      if (pa[format]?.[theme] !== pb[format]?.[theme]) diffs.push(`${format}/${theme}`);
    }
  }
  console.table(
    Object.fromEntries(Object.keys(ta).map((k) => [k, { [a]: ta[k].median, [b]: tb[k]?.median }]))
  );
  if (diffs.length) {
    console.error(`${diffs.length} preview(s) differ:\n  ${diffs.join('\n  ')}`);
    process.exit(1);
  }
  console.log('All previews identical.');
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'compare') await compare(rest[0], rest[1]);
else if (cmd) await run(cmd);
else {
  console.error('usage: node e2e/highlight.mjs <label> | compare <a> <b>');
  process.exit(2);
}
