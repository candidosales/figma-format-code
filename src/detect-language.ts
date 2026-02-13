import flourite from 'flourite';
import { FormatSupported } from './constants';

// Map flourite language names (with shiki: true) to FormatSupported enum
const languageMap: Record<string, FormatSupported> = {
  'css': FormatSupported.CSS,
  'go': FormatSupported.GO,
  'graphql': FormatSupported.GRAPHQL,
  'haskell': FormatSupported.HASKELL,
  'html': FormatSupported.HTML,
  'java': FormatSupported.JAVA,
  'javascript': FormatSupported.JAVASCRIPT,
  'json': FormatSupported.JSON,
  'kotlin': FormatSupported.KOTLIN,
  'lua': FormatSupported.LUA,
  'markdown': FormatSupported.MARKDOWN,
  'python': FormatSupported.PYTHON,
  'ruby': FormatSupported.RUBY,
  'rust': FormatSupported.RUST,
  'scss': FormatSupported.SCSS,
  'typescript': FormatSupported.TYPESCRIPT,
  'yaml': FormatSupported.YAML,
};

/**
 * Detect the programming language/format of code content using flourite
 */
export function detectLanguage(code: string): FormatSupported | null {
  if (!code || code.trim() === '') return null;

  const result = flourite(code, { shiki: true });
  
  const lang = result.language.toLowerCase();
  
  if (lang === 'unknown') return null;
  
  const mapped = languageMap[lang];
  
  return mapped || null;
}
