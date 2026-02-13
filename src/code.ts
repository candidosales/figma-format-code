import { Theme } from './interface';
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 700, height: 480 });

// Common monospace font families (case-insensitive partial matches)
const monospaceFamilies = [
  'mono', 'code', 'consol', 'courier', 'menlo', 'fira', 'jetbrains',
  'source code', 'roboto mono', 'ubuntu mono', 'ibm plex mono', 'space mono',
  'inconsolata', 'hack', 'droid sans mono', 'dejavu sans mono', 'anonymous',
  'cascadia', 'sf mono', 'monaco', 'cousine', 'overpass mono', 'noto sans mono'
];

function isMonospaceFont(fontFamily: string): boolean {
  const lower = fontFamily.toLowerCase();
  return monospaceFamilies.some(pattern => lower.includes(pattern));
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'start') {
    // Send available monospace fonts
    const availableFonts = await figma.listAvailableFontsAsync();
    const monospaceFonts = [...new Set(
      availableFonts
        .filter(f => isMonospaceFont(f.fontName.family))
        .map(f => f.fontName.family)
    )].sort();
    
    figma.ui.postMessage({ type: 'fonts', fonts: monospaceFonts });
    
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
  const cornerRadius = 5;

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
