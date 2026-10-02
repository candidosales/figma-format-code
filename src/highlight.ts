// Shiki - Syntax Highlighter with Fine-grained Bundle
import { createHighlighterCore, HighlighterCore, LanguageRegistration } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { FormatSupported } from './constants';

// Themes and languages are loaded on first use, so opening the plugin only
// pays for the theme and language actually shown.
const THEME_LOADERS = {
  dracula: () => import('@shikijs/themes/dracula'),
  'github-dark': () => import('@shikijs/themes/github-dark'),
  'github-light': () => import('@shikijs/themes/github-light'),
  'dark-plus': () => import('@shikijs/themes/dark-plus'),
  'light-plus': () => import('@shikijs/themes/light-plus'),
  'material-theme-darker': () => import('@shikijs/themes/material-theme-darker'),
  'material-theme-ocean': () => import('@shikijs/themes/material-theme-ocean'),
  'material-theme-palenight': () => import('@shikijs/themes/material-theme-palenight'),
  monokai: () => import('@shikijs/themes/monokai'),
  nord: () => import('@shikijs/themes/nord'),
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'one-light': () => import('@shikijs/themes/one-light'),
  'solarized-dark': () => import('@shikijs/themes/solarized-dark'),
  'solarized-light': () => import('@shikijs/themes/solarized-light'),
  'min-dark': () => import('@shikijs/themes/min-dark'),
  'min-light': () => import('@shikijs/themes/min-light'),
  'catppuccin-mocha': () => import('@shikijs/themes/catppuccin-mocha'),
  'catppuccin-latte': () => import('@shikijs/themes/catppuccin-latte'),
  'vitesse-dark': () => import('@shikijs/themes/vitesse-dark'),
  'vitesse-light': () => import('@shikijs/themes/vitesse-light'),
  'tokyo-night': () => import('@shikijs/themes/tokyo-night'),
  'rose-pine': () => import('@shikijs/themes/rose-pine'),
  'ayu-dark': () => import('@shikijs/themes/ayu-dark'),
};

const LANG_LOADERS: Record<FormatSupported, () => Promise<{ default: LanguageRegistration[] }>> = {
  c: () => import('@shikijs/langs/c'),
  cpp: () => import('@shikijs/langs/cpp'),
  css: () => import('@shikijs/langs/css'),
  javascript: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  json: () => import('@shikijs/langs/json'),
  html: () => import('@shikijs/langs/html'),
  markdown: () => import('@shikijs/langs/markdown'),
  yaml: () => import('@shikijs/langs/yaml'),
  graphql: () => import('@shikijs/langs/graphql'),
  go: () => import('@shikijs/langs/go'),
  java: () => import('@shikijs/langs/java'),
  kotlin: () => import('@shikijs/langs/kotlin'),
  python: () => import('@shikijs/langs/python'),
  ruby: () => import('@shikijs/langs/ruby'),
  rust: () => import('@shikijs/langs/rust'),
  haskell: () => import('@shikijs/langs/haskell'),
  lua: () => import('@shikijs/langs/lua'),
  scss: () => import('@shikijs/langs/scss'),
  less: () => import('@shikijs/langs/less'),
};

export type ShikiTheme = keyof typeof THEME_LOADERS;

export const SHIKI_THEMES = Object.keys(THEME_LOADERS) as ShikiTheme[];

// Singleton pattern - cache the highlighter instance
let highlighterPromise: Promise<HighlighterCore> | null = null;
const loading = new Map<string, Promise<void>>();

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

// Loads once per key, even when several highlight calls race for it.
function loadOnce(key: string, load: () => Promise<void>): Promise<void> {
  let promise = loading.get(key);
  if (!promise) {
    promise = load();
    loading.set(key, promise);
    promise.catch(() => loading.delete(key));
  }
  return promise;
}

function ensureTheme(highlighter: HighlighterCore, theme: ShikiTheme): Promise<void> {
  return loadOnce(`theme:${theme}`, () => highlighter.loadTheme(THEME_LOADERS[theme]));
}

function ensureLang(highlighter: HighlighterCore, lang: FormatSupported): Promise<void> {
  // Markdown fences can hold any supported language; load them all so fenced
  // code is colored no matter which languages were used before.
  const langs = lang === FormatSupported.MARKDOWN ? Object.values(FormatSupported) : [lang];
  return Promise.all(
    langs.map((name) => loadOnce(`lang:${name}`, () => highlighter.loadLanguage(LANG_LOADERS[name])))
  ).then(() => undefined);
}

// Start creating the highlighter before any code arrives from Figma.
export function preloadHighlighter(theme: ShikiTheme): void {
  getHighlighter()
    .then((highlighter) => ensureTheme(highlighter, theme))
    .catch((e) => console.error('[Format Code Error]', e instanceof Error ? e.message : e));
}

export async function highlight(
  code: string,
  lang: FormatSupported,
  theme: ShikiTheme,
  showLineNumbers: boolean = false
): Promise<string> {
  const highlighter = await getHighlighter();
  await Promise.all([ensureTheme(highlighter, theme), ensureLang(highlighter, lang)]);
  let html = highlighter.codeToHtml(code, { lang, theme });

  // Add line numbers class to pre element if enabled
  if (showLineNumbers) {
    html = html.replace('<pre class="shiki', '<pre class="shiki with-line-numbers');
  }

  return html;
}
