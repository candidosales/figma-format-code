import { FormatSupported } from './constants';

export interface NodePaint {
  content: string;
  range: NodePaintRange;
  paint: SolidPaint;
  fontName: FontName;
}

export interface NodePaintRange {
  start: number;
  end: number;
}

export interface Theme {
  format: string;
  nodePaints: Array<NodePaint>;
  contentHTML: string;
  showLineNumbers: boolean;
  lineNumberColor?: RGB;
  global: ThemeGlobal;
}

export interface ThemeGlobal {
  color: RGB;
  backgroundColor: RGB;
  fontName: FontName;
}

export interface FormatData {
  format: FormatSupported;
  code: string;
}

export interface FormatCode {
  formatCode: string;
  error: string;
}
