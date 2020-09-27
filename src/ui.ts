import './ui.scss';

// Dependencies
//// Prettier - Format
import prettier from '../node_modules/prettier/standalone';
import parserBabel from '../node_modules/prettier/parser-babel';
import parserHtml from '../node_modules/prettier/parser-html';
import parserMarkdown from '../node_modules/prettier/parser-markdown';

////// Highlight.js - Core

import hljs from '../node_modules/highlight.js/lib/core'; // Reduce the footprint

import hljsJavascript from '../node_modules/highlight.js/lib/languages/javascript';
import hljsJson from '../node_modules/highlight.js/lib/languages/json';
import hljsXml from '../node_modules/highlight.js/lib/languages/xml';
import hljsMarkdown from '../node_modules/highlight.js/lib/languages/markdown';
import { NodePaint, Theme } from './interface';

hljs.registerLanguage('javascript', hljsJavascript);
hljs.registerLanguage('json', hljsJson);
hljs.registerLanguage('html', hljsXml);
hljs.registerLanguage('markdown', hljsMarkdown);

// Variables

const compare = document.getElementById('compare');
const originalContent = document.getElementById('original-content');
const previewContent = document.getElementById('preview-content');

const $buttonApply = document.getElementById('button-apply');
const $buttonFormat = document.getElementById('button-format');

let format = (document.getElementById('select-format') as HTMLInputElement)
  .value;
let theme = (document.getElementById('select-theme') as HTMLInputElement).value;

let appliedTheme: Theme;

// Start

hljs.initHighlightingOnLoad();

parent.postMessage(
  {
    pluginMessage: {
      type: 'start',
    },
  },
  '*'
);

formatHighlightCode();

// Listeners
$buttonApply.onclick = () => {
  console.log('$buttonApply clicked');

  parent.postMessage(
    {
      pluginMessage: {
        type: 'apply',
        theme: appliedTheme
      },
    },
    '*'
  );
};

$buttonFormat.onclick = () => {
  updateValues();
  formatHighlightCode();
};

// Messages Code -> UI
onmessage = (event) => {
  let message = event.data.pluginMessage;
  console.log('message', message);
  originalContent.innerHTML = message.textCode;
};

function formatHighlightCode() {
  let formattedCode,
    formattedCodeHighlightSintax = '';

  if (format) {
    formattedCode = formatCode({ format, code: originalContent.innerHTML });
    formattedCodeHighlightSintax = hljs.highlight(format, formattedCode).value;
    previewContent.innerHTML = formattedCodeHighlightSintax;
  }

  if (theme) {
    compare.classList.forEach((className) => {
      if (className.startsWith('theme__')) {
        compare.classList.remove(className);
      }
    });

    compare.classList.add(`theme__${theme}`);
  }

  appliedTheme = applyTheme();
}

function updateValues() {
  format = (document.getElementById('select-format') as HTMLInputElement).value;
  theme = (document.getElementById('select-theme') as HTMLInputElement).value;
}

function formatCode(data: { format: string; code: string }) {
  if (data) {
    switch (data.format) {
      case 'javascript':
      case 'json':
        try {
          return prettier.format(data.code, {
            parser: 'json',
            plugins: [parserBabel],
          });
        } catch (e) {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'notify',
                message: e.message,
              },
            },
            '*'
          );
          return '';
        }
      case 'html':
        try {
          return prettier.format(data.code, {
            parser: 'html',
            plugins: [parserHtml],
          });
        } catch (e) {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'notify',
                message: e.message,
              },
            },
            '*'
          );
          return '';
        }
      case 'markdown':
        try {
          return prettier.format(data.code, {
            parser: 'markdown',
            plugins: [parserMarkdown],
          });
        } catch (e) {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'notify',
                message: e.message,
              },
            },
            '*'
          );
          return '';
        }
      default:
        return '';
    }
  }
}

function applyTheme(): Theme {
  console.log('applyTheme');

  let contentHTML = previewContent.innerHTML;
  const allTags = previewContent.getElementsByTagName('span');

  console.log('applyTheme contentHTML', contentHTML);
  console.log('applyTheme innerText', previewContent.innerText);

  // console.log('applyTheme all', allTags);

  const nodePaints: Array<NodePaint> = [];
  for (let i = 0, max = allTags.length; i < max; i++) {
    // console.log('==================================');
    // console.log('i', i);

    const node = allTags[i];

    // Calculate the index position of the content inside the HTML
    const startIndex = contentHTML.indexOf(
      `<span class="${node.classList[0]}">`
    );
    const endIndex = startIndex + (node.innerHTML.length - 1);

    // Remove the HTML Tag
    const regexStart = /<\/?span[^>]*>/i;
    contentHTML = contentHTML.replace(regexStart, '');

    const regexEnd = /<\/span>/i;
    contentHTML = contentHTML.replace(regexEnd, '');

    // console.log('contentHTML', contentHTML);
    // console.log('applyTheme startIndex', startIndex);
    // console.log('applyTheme endIndex', endIndex);

    nodePaints.push({
      content: node.innerHTML,
      range: {
        start: startIndex,
        end: endIndex + 1, // end (exclusive) - https://www.figma.com/plugin-docs/api/TextNode/#setrangetextstyleid
      },
      paint: {
        blendMode: 'NORMAL',
        color: calculateRGB(window.getComputedStyle(node).color),
        opacity: 1,
        type: 'SOLID',
        visible: true,
      },
    });
  }

  return {
    nodePaints: nodePaints,
    contentHTML: contentHTML,
    global: {
      color: calculateRGB(window.getComputedStyle(previewContent).color),
      backgroundColor: calculateRGB(window.getComputedStyle(previewContent).backgroundColor)
    }
  };
}

function calculateRGB(color: string): RGB {
  const rgbColor = color.match(/\d+/g)
  return {
    r: parseInt(rgbColor[0])/255,
    g: parseInt(rgbColor[1])/255,
    b: parseInt(rgbColor[2])/255,
  };
}

function test() {
  const str = '  <span class="x">"abc"</span>';
  console.log('str', str.length);

  var temp = document.createElement('div');
  temp.innerHTML = str;

  let contentHTML = temp.innerHTML;

  var all = temp.getElementsByTagName('span');
  console.log('all', all.length);

  const node = all[0];
  const nodeContent = node.innerHTML;

  const startIndex = contentHTML.indexOf(`<span class="${node.classList[0]}">`);

  console.log('startIndex', startIndex);
  console.log('lastIndex', startIndex + (nodeContent.length - 1));
}
