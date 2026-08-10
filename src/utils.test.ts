import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  revertEscapeHtml,
  calculateRGB,
  getFontWeight,
} from './utils';

describe('escapeHtml', () => {
  it('escapes all special characters', () => {
    expect(escapeHtml(`<div class="a" id='b'>A & B</div>`)).toBe(
      '&lt;div class=&quot;a&quot; id=&#039;b&#039;&gt;A &amp; B&lt;/div&gt;'
    );
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('revertEscapeHtml', () => {
  it('reverts all escaped entities', () => {
    expect(
      revertEscapeHtml(
        '&lt;div class=&quot;a&quot; id=&#039;b&#039;&gt;A &amp; B&lt;/div&gt;'
      )
    ).toBe(`<div class="a" id='b'>A & B</div>`);
  });

  it('round-trips with escapeHtml', () => {
    const original = `<script>alert("x" + 'y' + a & b)</script>`;
    expect(revertEscapeHtml(escapeHtml(original))).toBe(original);
  });
});

describe('calculateRGB', () => {
  it('parses an rgb() string into normalized 0-1 components', () => {
    expect(calculateRGB('rgb(255, 0, 128)')).toEqual({
      r: 1,
      g: 0,
      b: 128 / 255,
    });
  });

  it('returns black when the string has no numbers', () => {
    expect(calculateRGB('not-a-color')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('returns black when fewer than 3 numbers are present', () => {
    expect(calculateRGB('rgb(255, 0)')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('getFontWeight', () => {
  it('maps 400 to Regular', () => {
    expect(getFontWeight('400')).toBe('Regular');
  });

  it('maps 700 to Bold', () => {
    expect(getFontWeight('700')).toBe('Bold');
  });

  it('defaults unknown weights to Regular', () => {
    expect(getFontWeight('900')).toBe('Regular');
  });

  it('defaults empty string to Regular', () => {
    expect(getFontWeight('')).toBe('Regular');
  });
});
