import { describe, it, expect, beforeAll } from 'vitest';
import { formatCode } from './format-code';
import { FormatSupported } from './constants';

// formatCode posts a message to `parent` on prettier errors, which only
// exists in a browser context. Stub it for the Node test environment.
beforeAll(() => {
  (globalThis as { parent?: { postMessage: (...args: unknown[]) => void } }).parent = {
    postMessage: () => {},
  };
});

describe('formatCode', () => {
  it('returns an error when no data is provided', async () => {
    const result = await formatCode(
      undefined as unknown as Parameters<typeof formatCode>[0]
    );
    expect(result).toEqual({ formatCode: '', error: 'No data provided' });
  });

  it('passes C code through unchanged', async () => {
    const code = 'int main(){return 0;}';
    const result = await formatCode({ format: FormatSupported.C, code });
    expect(result).toEqual({ formatCode: code, error: '' });
  });

  it('passes an unsupported format through unchanged', async () => {
    const code = 'print("hi")';
    const result = await formatCode({
      format: 'python' as FormatSupported,
      code,
    });
    expect(result).toEqual({ formatCode: code, error: '' });
  });

  it('formats CSS with prettier', async () => {
    const result = await formatCode({
      format: FormatSupported.CSS,
      code: '.a{color:red;}',
    });
    expect(result.error).toBe('');
    expect(result.formatCode).toBe('.a {\n  color: red;\n}\n');
  });

  it('formats JSON with prettier', async () => {
    const result = await formatCode({
      format: FormatSupported.JSON,
      code: '{"a":1,"b":2}',
    });
    expect(result.error).toBe('');
    expect(result.formatCode).toBe('{ "a": 1, "b": 2 }\n');
  });

  it('formats TypeScript with prettier', async () => {
    const result = await formatCode({
      format: FormatSupported.TYPESCRIPT,
      code: 'const x=1',
    });
    expect(result.error).toBe('');
    expect(result.formatCode).toBe('const x = 1;\n');
  });

  it('formats YAML with prettier', async () => {
    const result = await formatCode({
      format: FormatSupported.YAML,
      code: 'a:   1\nb:   2',
    });
    expect(result.error).toBe('');
    expect(result.formatCode).toBe('a: 1\nb: 2\n');
  });

  it('returns an error for invalid code prettier cannot parse', async () => {
    const result = await formatCode({
      format: FormatSupported.JSON,
      code: '{ this is not json ',
    });
    expect(result.formatCode).toBe('');
    expect(result.error).not.toBe('');
  });
});
