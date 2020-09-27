// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 700, height: 520 });

export interface ValidObject {
  isValid: boolean;
  message: any;
}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {

  if (msg.type === 'start') {
    for (let node of figma.currentPage.selection) {
      if (node.type === "TEXT") {
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
    const format = msg.format;
    
    for (let node of figma.currentPage.selection) {

      if (node.type === "TEXT") {
        console.log('node', node);
        console.log('node characters', node.characters);
        console.log('node effects', node.effects);
        console.log('node height', node.height);
        console.log('node width', node.width);
        console.log('node strokes', node.strokes);
        console.log('node textStyleId', node.textStyleId);
        console.log('node fills', node.fills);

        figma.ui.postMessage({ original: node.characters })
      }
    }

    figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
  }  
};
