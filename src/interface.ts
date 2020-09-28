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
  global: ThemeGlobal;
}

export interface ThemeGlobal {
  color: RGB;
  backgroundColor: RGB;
  fontName: FontName;
}
