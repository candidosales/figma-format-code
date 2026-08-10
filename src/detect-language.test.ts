import { describe, it, expect } from 'vitest';
import { detectLanguage } from './detect-language';
import { FormatSupported } from './constants';

describe('detectLanguage', () => {
  it('returns null for empty/whitespace input', () => {
    expect(detectLanguage('')).toBeNull();
    expect(detectLanguage('   \n  ')).toBeNull();
  });

  it('detects JSON', () => {
    const json =
      '{\n  "name": "test",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}';
    expect(detectLanguage(json)).toBe(FormatSupported.JSON);
  });

  it('detects CSS', () => {
    expect(detectLanguage('.foo { color: red; margin: 0 auto; }')).toBe(
      FormatSupported.CSS
    );
  });

  it('detects Python', () => {
    expect(
      detectLanguage('def add(a, b):\n    return a + b\n\nprint(add(1, 2))')
    ).toBe(FormatSupported.PYTHON);
  });

  it('detects HTML', () => {
    expect(
      detectLanguage('<html><body><h1>Hi</h1></body></html>')
    ).toBe(FormatSupported.HTML);
  });

  it('returns null for a language flourite cannot classify', () => {
    expect(detectLanguage('asdf qwer zxcv')).toBeNull();
  });
});
