// Shiki - Syntax Highlighter with Fine-grained Bundle
import { createHighlighterCore, HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Themes - Fine-grained imports (no WASM, smaller bundle)
import themeDracula from '@shikijs/themes/dracula';
import themeGithubDark from '@shikijs/themes/github-dark';
import themeGithubLight from '@shikijs/themes/github-light';
import themeDarkPlus from '@shikijs/themes/dark-plus';
import themeLightPlus from '@shikijs/themes/light-plus';
import themeMaterialDarker from '@shikijs/themes/material-theme-darker';
import themeMaterialOcean from '@shikijs/themes/material-theme-ocean';
import themeMaterialPalenight from '@shikijs/themes/material-theme-palenight';
import themeMonokai from '@shikijs/themes/monokai';
import themeNord from '@shikijs/themes/nord';
import themeOneDarkPro from '@shikijs/themes/one-dark-pro';
import themeOneLight from '@shikijs/themes/one-light';
import themeSolarizedDark from '@shikijs/themes/solarized-dark';
import themeSolarizedLight from '@shikijs/themes/solarized-light';
import themeMinDark from '@shikijs/themes/min-dark';
import themeMinLight from '@shikijs/themes/min-light';
import themeCatppuccinMocha from '@shikijs/themes/catppuccin-mocha';
import themeCatppuccinLatte from '@shikijs/themes/catppuccin-latte';
import themeVitesseDark from '@shikijs/themes/vitesse-dark';
import themeVitesseLight from '@shikijs/themes/vitesse-light';
import themeTokyoNight from '@shikijs/themes/tokyo-night';
import themeRosePine from '@shikijs/themes/rose-pine';
import themeAyuDark from '@shikijs/themes/ayu-dark';

// Languages - Fine-grained imports
import langCss from '@shikijs/langs/css';
import langJavascript from '@shikijs/langs/javascript';
import langTypescript from '@shikijs/langs/typescript';
import langJson from '@shikijs/langs/json';
import langHtml from '@shikijs/langs/html';
import langMarkdown from '@shikijs/langs/markdown';
import langYaml from '@shikijs/langs/yaml';
import langGraphql from '@shikijs/langs/graphql';
import langGo from '@shikijs/langs/go';
import langJava from '@shikijs/langs/java';
import langKotlin from '@shikijs/langs/kotlin';
import langPython from '@shikijs/langs/python';
import langRuby from '@shikijs/langs/ruby';
import langRust from '@shikijs/langs/rust';
import langHaskell from '@shikijs/langs/haskell';
import langLua from '@shikijs/langs/lua';
import langScss from '@shikijs/langs/scss';
import langLess from '@shikijs/langs/less';

// Singleton pattern - cache the highlighter instance
let highlighterPromise: Promise<HighlighterCore> | null = null;

export const SHIKI_THEMES = [
  'dracula',
  'github-dark',
  'github-light',
  'dark-plus',
  'light-plus',
  'material-theme-darker',
  'material-theme-ocean',
  'material-theme-palenight',
  'monokai',
  'nord',
  'one-dark-pro',
  'one-light',
  'solarized-dark',
  'solarized-light',
  'min-dark',
  'min-light',
  'catppuccin-mocha',
  'catppuccin-latte',
  'vitesse-dark',
  'vitesse-light',
  'tokyo-night',
  'rose-pine',
  'ayu-dark',
] as const;

export type ShikiTheme = (typeof SHIKI_THEMES)[number];

async function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [
        themeDracula,
        themeGithubDark,
        themeGithubLight,
        themeDarkPlus,
        themeLightPlus,
        themeMaterialDarker,
        themeMaterialOcean,
        themeMaterialPalenight,
        themeMonokai,
        themeNord,
        themeOneDarkPro,
        themeOneLight,
        themeSolarizedDark,
        themeSolarizedLight,
        themeMinDark,
        themeMinLight,
        themeCatppuccinMocha,
        themeCatppuccinLatte,
        themeVitesseDark,
        themeVitesseLight,
        themeTokyoNight,
        themeRosePine,
        themeAyuDark,
      ],
      langs: [
        langCss,
        langJavascript,
        langTypescript,
        langJson,
        langHtml,
        langMarkdown,
        langYaml,
        langGraphql,
        langGo,
        langJava,
        langKotlin,
        langPython,
        langRuby,
        langRust,
        langHaskell,
        langLua,
        langScss,
        langLess,
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

export async function highlight(
  code: string,
  lang: string,
  theme: ShikiTheme,
  showLineNumbers: boolean = false
): Promise<string> {
  const highlighter = await getHighlighter();
  let html = highlighter.codeToHtml(code, { lang, theme });
  
  // Add line numbers class to pre element if enabled
  if (showLineNumbers) {
    html = html.replace('<pre class="shiki', '<pre class="shiki with-line-numbers');
  }
  
  return html;
}
