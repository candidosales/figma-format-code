import { describe, it, expect } from 'vitest';
import { highlight, SHIKI_THEMES } from './highlight';
import { FormatSupported } from './constants';

describe('highlight', () => {
  it('renders code to highlighted HTML', async () => {
    const html = await highlight('const a = 1;', FormatSupported.JAVASCRIPT, 'github-dark');
    expect(html).toContain('<pre class="shiki');
    expect(html).toContain('const');
  });

  it('adds a line-numbers class when requested', async () => {
    const html = await highlight('const a = 1;', FormatSupported.JAVASCRIPT, 'github-dark', true);
    expect(html).toContain('<pre class="shiki with-line-numbers');
  });

  it('omits the line-numbers class by default', async () => {
    const html = await highlight('const a = 1;', FormatSupported.JAVASCRIPT, 'github-dark');
    expect(html).not.toContain('with-line-numbers');
  });

  it('exposes every declared theme as usable', async () => {
    for (const theme of SHIKI_THEMES) {
      const html = await highlight('x', FormatSupported.JAVASCRIPT, theme);
      expect(html).toContain('<pre');
    }
  });
});
