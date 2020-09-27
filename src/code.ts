import { Theme } from './interface';
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 700, height: 480 });

figma.ui.onmessage = (msg) => {
  console.log('msg', msg);

  if (msg.type === 'start') {
    for (let node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        figma.ui.postMessage({ textCode: node.characters });
      }
    }
  }

  if (msg.type === 'notify') {
    const message = msg.message;
    figma.notify(message);
  }

  if (msg.type === 'apply') {
    console.log('apply-theme');

    const theme = msg?.theme as Theme;
    console.log('theme', theme);

    if (theme) {
      applyTheme(theme);
    }
  }

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
};

async function applyTheme(theme: Theme) {
  const padding = 16;
  const cornerRadius = 5;

  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });

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
    nodeText.setRangeFills(nodePaint.range.start, nodePaint.range.end, [
      nodePaint.paint,
    ]);
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
  nodeFrame.appendChild(nodeRectangle);
  nodeFrame.appendChild(nodeText);

  // Center node text
  nodeText.x = nodeRectangle.x + padding;
  nodeText.y = nodeRectangle.y + padding;

  nodeFrame.resize(nodeText.width + padding * 2, nodeText.height + padding * 2);

  figma.closePlugin();
}
