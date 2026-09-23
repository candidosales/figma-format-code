// Twinkleplop - fast syntax highlighter (https://twinkleplop.pngwn.at)
// Used for the language/theme pairs it supports; everything else falls back to Shiki.
import { tokenize as tokenizeCss } from '@twinkleplop/css';
import { tokenize as tokenizeGo } from '@twinkleplop/go';
import { tokenize as tokenizeHtml } from '@twinkleplop/html';
import { tokenize as tokenizeJavascript } from '@twinkleplop/javascript';
import { tokenize as tokenizeJson } from '@twinkleplop/json';
import { tokenize as tokenizeMarkdown } from '@twinkleplop/markdown';
import { tokenize as tokenizePython } from '@twinkleplop/python';
import { tokenize as tokenizeRust } from '@twinkleplop/rust';
import { tokenize as tokenizeTypescript } from '@twinkleplop/typescript';
import { tokenize as tokenizeYaml } from '@twinkleplop/yaml';

import * as ayu from '@twinkleplop/theme-ayu/tokens';
import * as catppuccin from '@twinkleplop/theme-catppuccin/tokens';
import * as github from '@twinkleplop/theme-github/tokens';
import * as rosePine from '@twinkleplop/theme-rose-pine/tokens';
import * as solarized from '@twinkleplop/theme-solarized/tokens';

import { escapeHtml } from './utils';

type Palette = Record<string, string> & { background_color: string };
type FontStyle = 'italic' | 'bold' | 'underline' | 'strikethrough';
type Styles = Partial<Record<string, readonly FontStyle[]>>;
type Tokenizer = (code: string) => { tokens: Uint32Array; token_types: string[] };

interface TwinkleplopTheme {
  palette: Palette;
  styles: Styles;
}

const LANGUAGES: Record<string, () => Tokenizer> = {
  css: tokenizeCss,
  go: tokenizeGo,
  html: tokenizeHtml,
  javascript: tokenizeJavascript,
  json: tokenizeJson,
  markdown: tokenizeMarkdown,
  python: tokenizePython,
  rust: tokenizeRust,
  typescript: tokenizeTypescript,
  yaml: tokenizeYaml,
};

// Keys are the Shiki theme ids used in the theme <select>
const THEMES: Record<string, TwinkleplopTheme> = {
  'ayu-dark': { palette: ayu.dark, styles: ayu.dark_styles },
  'catppuccin-latte': { palette: catppuccin.light, styles: catppuccin.light_styles },
  'catppuccin-mocha': { palette: catppuccin.dark, styles: catppuccin.dark_styles },
  'github-dark': { palette: github.dark, styles: github.dark_styles },
  'github-light': { palette: github.light, styles: github.light_styles },
  'rose-pine': { palette: rosePine.dark, styles: rosePine.dark_styles },
  'solarized-dark': { palette: solarized.dark, styles: solarized.dark_styles },
  'solarized-light': { palette: solarized.light, styles: solarized.light_styles },
};

// Cache tokenizers - creating one compiles the language pipeline
const tokenizers = new Map<string, Tokenizer>();

function getTokenizer(lang: string): Tokenizer {
  let tokenizer = tokenizers.get(lang);
  if (!tokenizer) {
    tokenizer = LANGUAGES[lang]();
    tokenizers.set(lang, tokenizer);
  }
  return tokenizer;
}

export function supportsTwinkleplop(lang: string, theme: string): boolean {
  return lang in LANGUAGES && theme in THEMES;
}

function tokenStyle(type: string, theme: TwinkleplopTheme): string {
  const color = theme.palette[type] ?? theme.palette.identifier;
  let style = `color:${color}`;
  for (const fontStyle of theme.styles[type] ?? []) {
    if (fontStyle === 'bold') style += ';font-weight:700';
    if (fontStyle === 'italic') style += ';font-style:italic';
    if (fontStyle === 'underline') style += ';text-decoration:underline';
    if (fontStyle === 'strikethrough') style += ';text-decoration:line-through';
  }
  return style;
}

// Emits the same markup shape as Shiki's codeToHtml so the preview styles
// and the span walker in ui.ts work for both highlighters.
export function highlightWithTwinkleplop(
  code: string,
  lang: string,
  themeName: string,
  showLineNumbers: boolean = false
): string {
  const theme = THEMES[themeName];
  const { tokens, token_types } = getTokenizer(lang)(code);
  const foreground = theme.palette.identifier;

  const lines: string[] = [];
  let line = '';
  const pushText = (text: string, style?: string) => {
    // Split on newlines so every span stays inside a single .line
    const parts = text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) {
        lines.push(line);
        line = '';
      }
      if (part === '') return;
      line += style ? `<span style="${style}">${escapeHtml(part)}</span>` : escapeHtml(part);
    });
  };

  let cursor = 0;
  for (let i = 0; i < tokens.length; i += 3) {
    const start = tokens[i + 1];
    const end = tokens[i + 2];
    if (start > cursor) pushText(code.slice(cursor, start));
    pushText(code.slice(start, end), tokenStyle(token_types[tokens[i]], theme));
    cursor = end;
  }
  if (cursor < code.length) pushText(code.slice(cursor));
  lines.push(line);

  const preClass = `shiki${showLineNumbers ? ' with-line-numbers' : ''} ${themeName}`;
  const preStyle = `background-color:${theme.palette.background_color};color:${foreground}`;
  const body = lines.map((l) => `<span class="line">${l}</span>`).join('\n');

  return `<pre class="${preClass}" style="${preStyle}" tabindex="0" data-highlighter="twinkleplop"><code>${body}</code></pre>`;
}
