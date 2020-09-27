// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 700, height: 600 });
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    // if (msg.type === 'create-rectangles') {
    //   console.log('create-rectangles', msg);
    //   const nodes: SceneNode[] = [];
    //   for (let i = 0; i < msg.count; i++) {
    //     const rect = figma.createRectangle();
    //     rect.x = i * 150;
    //     rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
    //     figma.currentPage.appendChild(rect);
    //     nodes.push(rect);
    //   }
    //   figma.currentPage.selection = nodes;
    //   figma.viewport.scrollAndZoomIntoView(nodes);
    // }
    if (msg.type === 'format-code') {
        console.log('format-code', msg);
        const format = msg.format;
        for (let node of figma.currentPage.selection) {
            if (node.type === "TEXT") {
                console.log('node', node);
                console.log('node characters', node.characters);
                const validFormat = isValidFormat({ format: format, code: node.characters });
                if (validFormat.isValid) {
                    formatCode();
                    addTheme();
                }
                else {
                    figma.notify(validFormat.message);
                }
                node.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
            }
        }
        figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
    }
    function formatCode() {
        console.log('format');
    }
    function addTheme() {
        console.log('addTheme');
    }
    function isValidFormat(data) {
        if (data) {
            switch (data.format) {
                case 'json':
                    return isJson(data.code);
                case 'html':
                    return isHTML(data.code);
                default:
                    return { isValid: false, message: `Sorry, the ${data.format} format isn't available.` };
            }
        }
        return { isValid: false, message: `` };
    }
    function isJson(code) {
        try {
            JSON.parse(code);
        }
        catch (e) {
            console.log('isJson e', e);
            return { isValid: false, message: `the text isn't JSON. Try replace all single quotes to double-quotes. Error: ${e.message}` };
        }
        return { isValid: true, message: "" };
    }
    function isHTML(code) {
        try {
            var a = document.createElement('div');
            a.innerHTML = code;
            for (var c = a.childNodes, i = c.length; i--;) {
                if (c[i].nodeType == 1)
                    return { isValid: true, message: "" };
            }
        }
        catch (e) {
            return { isValid: false, message: `the text isn't HTML. Error: ${e.message}` };
        }
        return { isValid: false, message: "the text isn't HTML" };
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
};
