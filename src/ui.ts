import "./ui.scss";

// Dependencies
//// Prettier - Format
import prettier from '../node_modules/prettier/standalone'
import parserBabel from '../node_modules/prettier/parser-babel'
import parserHtml from '../node_modules/prettier/parser-html'
import parserMarkdown from '../node_modules/prettier/parser-markdown'

//// Highlight.js - Theme
////// Highlight.js - CSS
import "../node_modules/highlight.js/styles/default.css";
import "../node_modules/highlight.js/styles/dracula.css";
import "../node_modules/highlight.js/styles/atom-one-dark.css";

////// Highlight.js - Core

import hljs from '../node_modules/highlight.js/lib/core'; // Reduce the footprint

import hljsJavascript from '../node_modules/highlight.js/lib/languages/javascript';
import hljsJson from '../node_modules/highlight.js/lib/languages/json';
import hljsXml from '../node_modules/highlight.js/lib/languages/xml';
import hljsMarkdown from '../node_modules/highlight.js/lib/languages/markdown';

hljs.registerLanguage('javascript', hljsJavascript);
hljs.registerLanguage('json', hljsJson);
hljs.registerLanguage('html', hljsXml);
hljs.registerLanguage('markdown', hljsMarkdown);


// Variables 

const originalContent = document.getElementById("original-content");
const previewContent = document.getElementById("preview-content");
let format, theme = '';


// Start

hljs.initHighlightingOnLoad();

parent.postMessage(
  {
    pluginMessage: {
      type: "start",
    },
  },
  "*"
);

// Listeners
document.getElementById("button-apply").onclick = () => {
  parent.postMessage(
    {
      pluginMessage: {
        type: "apply",
      },
    },
    "*"
  );
};

document.getElementById("button-format").onclick = () => {
  format = (document.getElementById("select-format") as HTMLInputElement).value;
  parent.postMessage(
    {
      pluginMessage: {
        type: "validate-code",
        format: format,
      },
    },
    "*"
  );
};

// Messages Code -> UI
onmessage = event => {
  let message = event.data.pluginMessage;

  originalContent.innerHTML = message.original;

  if (format) {
    const codeFormated = formatCode({ format, code: message.original });
    previewContent.innerHTML = hljs.highlight(format, codeFormated).value;
  }
}

function formatCode(data: {format: string, code: string}) {
  console.log('formatCode data', data);

  if (data) {
    switch (data.format) {
      case 'javascript':
      case 'json':
        try {
          return prettier.format(data.code, {
            parser: "json",
            plugins: [parserBabel],
          });
        } catch(e) {
          parent.postMessage(
            {
              pluginMessage: {
                type: "notify",
                message: e.message,
              },
            },
            "*"
          );
          return '';
        }
      case 'html':
        try {
          return prettier.format(data.code, {
            parser: "html",
            plugins: [parserHtml],
          });
        } catch(e) {
          parent.postMessage(
            {
              pluginMessage: {
                type: "notify",
                message: e.message,
              },
            },
            "*"
          );
          return '';
        }
        case 'markdown':
          try {
            return prettier.format(data.code, {
              parser: "markdown",
              plugins: [parserMarkdown],
            });
          } catch(e) {
            parent.postMessage(
              {
                pluginMessage: {
                  type: "notify",
                  message: e.message,
                },
              },
              "*"
            );
            return '';
          }
      default:
        return '';
    }
  }
}