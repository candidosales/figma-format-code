import { Theme } from './interface';
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 700, height: 480 });

// Monospace fonts available on Google Fonts (exact family names)
const googleMonospaceFonts = new Set([
  'Anonymous Pro',
  'Azeret Mono',
  'B612 Mono',
  'Cousine',
  'Cutive Mono',
  'DM Mono',
  'Droid Sans Mono',
  'Fira Code',
  'Fira Mono',
  'Fragment Mono',
  'Geist Mono',
  'IBM Plex Mono',
  'Inconsolata',
  'JetBrains Mono',
  'Martian Mono',
  'Nanum Gothic Coding',
  'Noto Sans Mono',
  'Nova Mono',
  'Overpass Mono',
  'Oxygen Mono',
  'PT Mono',
  'Red Hat Mono',
  'Roboto Mono',
  'Share Tech Mono',
  'Source Code Pro',
  'Space Mono',
  'Spline Sans Mono',
  'Ubuntu Mono',
  'Ubuntu Sans Mono',
  'VT323',
  'Xanh Mono',
]);

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'start') {
    // Send available fonts that exist on both Figma and Google Fonts
    const availableFonts = await figma.listAvailableFontsAsync();
    const availableFamilies = new Set(availableFonts.map(f => f.fontName.family));
    
    // Filter to only fonts available in both Figma and Google Fonts
    const fonts = [...googleMonospaceFonts]
      .filter(font => availableFamilies.has(font))
      .sort();
    
    figma.ui.postMessage({ type: 'fonts', fonts });
    
    // Send selected text
    for (const node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        figma.ui.postMessage({ type: 'text', textCode: node.characters });
      }
    }
  }

  if (msg.type === 'notify') {
    const message = msg.message;
    figma.notify(message);
  }

  if (msg.type === 'apply') {
    const theme = msg?.theme as Theme;
    if (theme) {
      await applyTheme(theme);
    }
  }
};

async function applyTheme(theme: Theme) {
  const padding = 16;
  const cornerRadius = 12;

  // Load all fonts before to create or update text nodes;
  for (const node of figma.currentPage.selection) {
    if (node.type === 'TEXT') {
      const nodeFonts = node.getRangeAllFontNames(0, node.characters.length);
      await loadFonts(nodeFonts);
    }
  }

  try {
    // Default Figma Fonts
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

    // Ensure to load font from the current theme
    await figma.loadFontAsync(theme.global.fontName);

    const nodeText = figma.createText();
    nodeText.characters = theme.contentHTML;

    nodeText.fills = [
      {
        blendMode: 'NORMAL',
        color: theme.global.color,
        opacity: 1,
        type: 'SOLID',
        visible: true,
      },
    ];

    theme.nodePaints.forEach((nodePaint) => {
      try {
        // Sometimes the content have HTML spans. It should be ignored
        if (nodePaint.content.includes('span')) {
          return;
        }

        nodeText.setRangeFills(nodePaint.range.start, nodePaint.range.end, [
          nodePaint.paint,
        ]);
        nodeText.setRangeFontName(
          nodePaint.range.start,
          nodePaint.range.end,
          nodePaint.fontName
        );
      } catch (e) {
        console.error('[Format Code Error]', e instanceof Error ? e.message : e);
      }
    });

    const nodeRectangle = figma.createRectangle();
    nodeRectangle.fills = [
      {
        blendMode: 'NORMAL',
        color: theme.global.backgroundColor,
        opacity: 1,
        type: 'SOLID',
        visible: true,
      },
    ];

    nodeRectangle.cornerRadius = cornerRadius;
    nodeRectangle.resize(
      nodeText.width + padding * 2,
      nodeText.height + padding * 2
    );

    const nodeFrame = figma.createFrame();
    nodeFrame.name = theme.format;
    nodeFrame.fills = [{
        blendMode: 'NORMAL',
        color: theme.global.backgroundColor,
        opacity: 0,
        type: 'SOLID',
        visible: true,
      }]; // Transparent background
    nodeFrame.appendChild(nodeRectangle);
    nodeFrame.appendChild(nodeText);

    // Center node text
    nodeText.x = nodeRectangle.x + padding;
    nodeText.y = nodeRectangle.y + padding;

    nodeFrame.resize(
      nodeText.width + padding * 2,
      nodeText.height + padding * 2
    );

    figma.viewport.scrollAndZoomIntoView([nodeFrame]);
  } catch (e) {
    console.error('[Format Code Error]', e instanceof Error ? e.message : e);
  }

  figma.closePlugin();
}

async function loadFonts(fonts: FontName[]): Promise<FontName[]> {
  const promises = fonts.map((font) => figma.loadFontAsync(font));
  await Promise.all(promises);
  return fonts;
}
