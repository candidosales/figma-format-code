import './ui.scss';

// Dependencies
//// Prettier - Format
import prettier from '../node_modules/prettier/standalone';
import parserBabel from '../node_modules/prettier/parser-babel';
import parserPostcss from '../node_modules/prettier/parser-postcss';
import parserHtml from '../node_modules/prettier/parser-html';
import parserMarkdown from '../node_modules/prettier/parser-markdown';
import parserTypescript from '../node_modules/prettier/parser-typescript';
import parserYaml from '../node_modules/prettier/parser-yaml';

////// Highlight.js - Core

import hljs from '../node_modules/highlight.js/lib/core'; // Reduce the footprint

import hljsCSS from '../node_modules/highlight.js/lib/languages/css';
import hljsJavascript from '../node_modules/highlight.js/lib/languages/javascript';
import hljsJSON from '../node_modules/highlight.js/lib/languages/json';
import hljsMarkdown from '../node_modules/highlight.js/lib/languages/markdown';
import hljsLess from '../node_modules/highlight.js/lib/languages/less';
import hljsSCSS from '../node_modules/highlight.js/lib/languages/scss';
import hljsTypescript from '../node_modules/highlight.js/lib/languages/typescript';
import hljsXML from '../node_modules/highlight.js/lib/languages/xml';
import hljsYAML from '../node_modules/highlight.js/lib/languages/yaml';

import { NodePaint, Theme, FormatCode } from './interface';

// Variables
const formatSupported = {
  CSS: 'css',
  JAVASCRIPT: 'javascript',
  JSON: 'json',
  HTML: 'html',
  LESS: 'less',
  MARKDOWN: 'markdown',
  SCSS: 'scss',
  TYPESCRIPT: 'typescript',
  YAML: 'yaml',
};

const $compare = document.getElementById('compare');
const $originalContent = document.getElementById('original-content');
const $originalError = document.getElementById('original-error');
const $previewContent = document.getElementById('preview-content');

const $buttonApply = document.getElementById('button-apply');
const $buttonPreview = document.getElementById('button-preview');
const $selectFormat = document.getElementById('select-format');
const $selectTheme = document.getElementById('select-theme');

let format = ($selectFormat as HTMLInputElement).value;
let theme = ($selectTheme as HTMLInputElement).value;

let appliedTheme: Theme;

// Start

// Common
hljs.registerLanguage(formatSupported.JSON, hljsJSON);
hljs.registerLanguage(formatSupported.MARKDOWN, hljsMarkdown);
hljs.registerLanguage(formatSupported.HTML, hljsXML);
hljs.registerLanguage(formatSupported.YAML, hljsYAML);

// CSS
hljs.registerLanguage(formatSupported.CSS, hljsCSS);
hljs.registerLanguage(formatSupported.LESS, hljsLess);
hljs.registerLanguage(formatSupported.SCSS, hljsSCSS);

// Scripting
hljs.registerLanguage(formatSupported.JAVASCRIPT, hljsJavascript);
hljs.registerLanguage(formatSupported.TYPESCRIPT, hljsTypescript);

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
  parent.postMessage(
    {
      pluginMessage: {
        type: 'apply',
        theme: appliedTheme,
      },
    },
    '*'
  );
};

$buttonPreview.onclick = () => {
  updateValues();
  formatHighlightCode();
};

$selectTheme.onchange = () => {
  updateValues();
  updateTheme();
  formatHighlightCode();
};

// Messages Code -> UI
onmessage = (event) => {
  let message = event.data.pluginMessage;
  $originalContent.innerHTML = message.textCode;
};

function formatHighlightCode() {
  let formattedCodeHighlightSintax = '';

  if (format) {
    const result = formatCode({ format, code: $originalContent.textContent });
    console.log('result', result);

    if (result.error !== '') {
      showParserError(result.error);
    }

    if (result.formatCode !== '') {
      formattedCodeHighlightSintax = hljs.highlight(format, result.formatCode)
        .value;
      $previewContent.innerHTML = formattedCodeHighlightSintax;
      hideParserError();
    }
  }

  updateTheme();

  appliedTheme = applyTheme();
  // console.log('appliedTheme', appliedTheme);
}

function updateTheme() {
  if (theme) {
    $compare.classList.forEach((className) => {
      if (className.startsWith('theme__')) {
        $compare.classList.remove(className);
      }
    });

    $compare.classList.add(`theme__${theme}`);
  }
}

function updateValues() {
  format = (document.getElementById('select-format') as HTMLInputElement).value;
  theme = (document.getElementById('select-theme') as HTMLInputElement).value;
}

function formatCode(data: { format: string; code: string }): FormatCode {
  console.log('formatCode data', data);

  if (data) {
    switch (data.format) {
      case formatSupported.CSS:
      case formatSupported.LESS:
      case formatSupported.SCSS:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.CSS,
              plugins: [parserPostcss],
            }),
            error: '',
          };
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
          return {
            formatCode: '',
            error: e.message,
          };
        }
      case formatSupported.JAVASCRIPT:
      case formatSupported.JSON:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.JSON,
              plugins: [parserBabel],
            }),
            error: '',
          };
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
          return {
            formatCode: '',
            error: e.message,
          };
        }
      case formatSupported.HTML:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.HTML,
              plugins: [parserHtml],
            }),
            error: '',
          };
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
          return {
            formatCode: '',
            error: e.message,
          };
        }
      case formatSupported.MARKDOWN:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.MARKDOWN,
              plugins: [parserMarkdown],
            }),
            error: '',
          };
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
          return {
            formatCode: '',
            error: e.message,
          };
        }
      case formatSupported.TYPESCRIPT:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.TYPESCRIPT,
              plugins: [parserTypescript],
            }),
            error: '',
          };
        } catch (e) {
          console.warn('format', data.format, 'error', e.message);
          parent.postMessage(
            {
              pluginMessage: {
                type: 'notify',
                message: e.message,
              },
            },
            '*'
          );
          return {
            formatCode: '',
            error: e.message,
          };
        }
      case formatSupported.YAML:
        try {
          return {
            formatCode: prettier.format(data.code, {
              parser: formatSupported.YAML,
              plugins: [parserYaml],
            }),
            error: '',
          };
        } catch (e) {
          console.warn('format', data.format, 'error', e.message);
          parent.postMessage(
            {
              pluginMessage: {
                type: 'notify',
                message: e.message,
              },
            },
            '*'
          );
          return {
            formatCode: '',
            error: e.message,
          };
        }
      default:
        return {
          formatCode: '',
          error: '',
        };
    }
  }
}

function showParserError(errorMessage: string): void {
  const code = $originalError.getElementsByTagName('code');
  code[0].innerHTML = errorMessage;
  code[0].classList.remove('hljs');

  $originalError.classList.add('show-error');
}

function hideParserError(): void {
  const code = $originalError.getElementsByTagName('code');
  code[0].innerHTML = '';
  $originalError.classList.remove('show-error');
}

function applyTheme(): Theme {
  // console.log('$previewContent.innerHTML', $previewContent.innerHTML);
  // console.log('$previewContent.textContent', $previewContent.textContent);

  let contentHTML = $previewContent.innerHTML;
  const allTags = $previewContent.getElementsByTagName('span');

  // console.log('previewContent contentHTML', contentHTML);
  // console.log('applyTheme innerText', previewContent.innerText);

  // console.log('applyTheme all', allTags);

  const nodePaints: Array<NodePaint> = [];
  for (let i = 0, max = allTags.length; i < max; i++) {
    // console.log('==================================');
    // console.log('i', i);

    const node = allTags[i];
    const selector = `<span class="${node.classList[0]}">`;
    // console.log('selector', selector);

    // TODO - Issue: Span Nested
    // TODO - Verify if exist span nested, if yes, jump for the next item

    // Calculate the index position of the content inside the HTML
    const startIndex = contentHTML.indexOf(selector);
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
      fontName: {
        family: 'Roboto',
        style: getFontStyle(window.getComputedStyle(node).fontWeight),
      },
    });
  }

  // console.log('contentHTML', contentHTML);

  if (format === formatSupported.HTML) {
    contentHTML = contentHTML.replace(/&lt;/gi, '<');
    contentHTML = contentHTML.replace(/&gt;/gi, '>');
    contentHTML = contentHTML.replace(/&amp;/gi, '&');
  }

  return {
    format,
    nodePaints: nodePaints,
    contentHTML: contentHTML,
    global: {
      color: calculateRGB(window.getComputedStyle($previewContent).color),
      backgroundColor: calculateRGB(
        window.getComputedStyle($previewContent).backgroundColor
      ),
      fontName: {
        family: 'Roboto',
        style: 'Regular',
      },
    },
  };
}

function calculateRGB(color: string): RGB {
  const rgbColor = color.match(/\d+/g);
  return {
    r: parseInt(rgbColor[0]) / 255,
    g: parseInt(rgbColor[1]) / 255,
    b: parseInt(rgbColor[2]) / 255,
  };
}

function getFontStyle(fontWeight: string): string {
  if (fontWeight) {
    switch (fontWeight) {
      case '400':
        return 'Regular';
      case '700':
        return 'Bold';
      default:
        return 'Regular';
    }
    return 'Regular';
  }
}

// function test() {
//   const str = '  <span class="x">"abc"</span>';
//   console.log('str', str.length);

//   var temp = document.createElement('div');
//   temp.innerHTML = str;

//   let contentHTML = temp.innerHTML;

//   var all = temp.getElementsByTagName('span');
//   console.log('all', all.length);

//   const node = all[0];
//   const nodeContent = node.innerHTML;

//   const startIndex = contentHTML.indexOf(`<span class="${node.classList[0]}">`);

//   console.log('startIndex', startIndex);
//   console.log('lastIndex', startIndex + (nodeContent.length - 1));
// }
