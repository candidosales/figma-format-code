export const escapeHtml = (unsafeHtml: string): string => {
  return unsafeHtml
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

export const revertEscapeHtml = (safeHtml: string): string => {
  return safeHtml
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'");
};

export const calculateRGB = (color: string): RGB => {
  const rgbColor = color.match(/\d+/g);
  return {
    r: parseInt(rgbColor[0]) / 255,
    g: parseInt(rgbColor[1]) / 255,
    b: parseInt(rgbColor[2]) / 255,
  };
};

export const getFontWeight = (fontWeight: string): string => {
  if (fontWeight) {
    switch (fontWeight) {
      case '400':
        return 'Regular';
      case '700':
        return 'Bold';
      default:
        return 'Regular';
    }
  }
  return 'Regular';
};
