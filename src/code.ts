// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 700, height: 480 });

export interface ValidObject {
  isValid: boolean;
  message: any;
}

figma.ui.onmessage = (msg) => {
  if (msg.type === 'start') {
    for (let node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        figma.ui.postMessage({ original: node.characters });
      }
    }
  }

  if (msg.type === 'apply') {
    figma.closePlugin();
  }

  if (msg.type === 'notify') {
    const message = msg.message;
    figma.notify(message);
  }

  if (msg.type === 'validate-code') {
    for (let node of figma.currentPage.selection) {
      if (node.type === 'TEXT') {
        console.log('node characters length', node.characters.length);
        console.log('node height', node.height);
        console.log('node width', node.width);
        console.log('node fills', node.fills);
        console.log('node node.getRangeFills(3,5)', node.getRangeFills(3, 5));
        console.log('node node.getRangeFills(8,11)', node.getRangeFills(8, 11));

        console.log(
          'node node.getRangeFontName(3,5)',
          node.getRangeFontName(3, 5)
        );
        console.log(
          'node node.getRangeFontName(8,11)',
          node.getRangeFontName(8, 11)
        );

        console.log(
          'node node.getRangeFontSize(3,5)',
          node.getRangeFontSize(3, 5)
        );
        console.log(
          'node node.getRangeFontSize(8,11)',
          node.getRangeFontSize(8, 11)
        );

        figma.ui.postMessage({ original: node.characters });
      }
    }

    figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
  }
};
