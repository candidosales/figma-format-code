import { describe, it, expect } from 'vitest';
import { highlight } from './highlight';
import { highlightWithTwinkleplop, supportsTwinkleplop } from './twinkleplop';
import { revertEscapeHtml } from './utils';

// Mirrors what ui.ts reads: the textContent of pre > code
const textContent = (html: string): string =>
  revertEscapeHtml(html.replace(/^[\s\S]*?<code>/, '').replace(/<\/code>[\s\S]*$/, '').replace(/<[^>]+>/g, ''));

describe('twinkleplop', () => {
  it('supports only mapped language/theme pairs', () => {
    expect(supportsTwinkleplop('typescript', 'github-dark')).toBe(true);
    expect(supportsTwinkleplop('kotlin', 'github-dark')).toBe(false);
    expect(supportsTwinkleplop('typescript', 'dracula')).toBe(false);
  });

  it('preserves the source text exactly', () => {
    const code = 'const a = "<b>" & 1;\n/* multi\nline */\nfunction f() {\n  return a;\n}\n';
    const html = highlightWithTwinkleplop(code, 'typescript', 'github-dark');
    expect(textContent(html)).toBe(code);
  });

  it('emits Shiki-compatible markup with inline colours', () => {
    const html = highlightWithTwinkleplop('const a = 1;', 'javascript', 'github-dark');
    expect(html).toContain('<pre class="shiki github-dark"');
    expect(html).toContain('background-color:#');
    expect(html).toMatch(/<span class="line"><span style="color:#[0-9a-f]{6}">const<\/span>/i);
  });

  it('keeps every span on a single line', () => {
    const html = highlightWithTwinkleplop('/* a\nb */\nx', 'javascript', 'github-dark');
    const lines = html.match(/<span class="line">/g) ?? [];
    expect(lines).toHaveLength(3);
  });

  it('adds the line-numbers class when requested', () => {
    const html = highlightWithTwinkleplop('x', 'python', 'rose-pine', true);
    expect(html).toContain('<pre class="shiki with-line-numbers rose-pine"');
  });

  it('is used by highlight() for supported pairs only', async () => {
    expect(await highlight('x = 1', 'python', 'solarized-dark')).toContain('data-highlighter="twinkleplop"');
    expect(await highlight('val x = 1', 'kotlin', 'solarized-dark')).not.toContain('data-highlighter');
    expect(await highlight('x = 1', 'python', 'dracula')).not.toContain('data-highlighter');
  });
});
