export interface NodePaint {
  content: string;
  range: NodePaintRange;
  paint: SolidPaint;
}

export interface NodePaintRange {
  start: number;
  end: number;
}

export interface Theme {
  nodePaints: Array<NodePaint>;
  contentHTML: string;
  global: ThemeGlobal;
}

export interface ThemeGlobal {
    color: RGB;
    backgroundColor: RGB;
}
