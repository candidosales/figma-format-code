import './ui.scss';

// Dependencies
//// Prettier - Format
import prettier from 'prettier';

import parserBabel from 'prettier/parser-babel';
import parserPostcss from 'prettier/parser-postcss';
// import parserHtml from '../node_modules/prettier/parser-html';  // TODO - Add HTML support
import parserMarkdown from 'prettier/parser-markdown';
import parserTypescript from 'prettier/parser-typescript';
import parserYaml from 'prettier/parser-yaml';

////// Highlight.js - Core

import hljs from '../node_modules/highlight.js/lib/core'; // Reduce the footprint

import hljsCSS from '../node_modules/highlight.js/lib/languages/css';
import hljsJavascript from '../node_modules/highlight.js/lib/languages/javascript';
import hljsJSON from '../node_modules/highlight.js/lib/languages/json';
import hljsMarkdown from '../node_modules/highlight.js/lib/languages/markdown';
import hljsLess from '../node_modules/highlight.js/lib/languages/less';
import hljsSCSS from '../node_modules/highlight.js/lib/languages/scss';
import hljsTypescript from '../node_modules/highlight.js/lib/languages/typescript';
import hljsKotlin from '../node_modules/highlight.js/lib/languages/kotlin';
import hljsJava from '../node_modules/highlight.js/lib/languages/java';
import hljsGo from '../node_modules/highlight.js/lib/languages/go';
import hljsPython from '../node_modules/highlight.js/lib/languages/python';
import hljsRuby from '../node_modules/highlight.js/lib/languages/ruby';
// import hljsXML from '../node_modules/highlight.js/lib/languages/xml';  // TODO - Add HTML support
import hljsYAML from '../node_modules/highlight.js/lib/languages/yaml';
import hljsRust from '../node_modules/highlight.js/lib/languages/rust';

import { NodePaint, Theme, FormatCode, FormatData } from './interface';
import { FormatSupported } from './constants';

const $compare = document.getElementById('compare');
const $originalContent = document.getElementById('original-content');
const $originalError = document.getElementById('original-error');
const $previewContent = document.getElementById('preview-content');

const $buttonApply = document.getElementById('button-apply');
const $buttonPreview = document.getElementById('button-preview');
const $selectFormat = document.getElementById('select-format');
const $selectTheme = document.getElementById('select-theme');

let format = ($selectFormat as HTMLInputElement).value as FormatSupported;
let theme = ($selectTheme as HTMLInputElement).value;

let appliedTheme: Theme;

// Start

// Common
hljs.registerLanguage(FormatSupported.JSON, hljsJSON);
hljs.registerLanguage(FormatSupported.MARKDOWN, hljsMarkdown);
// hljs.registerLanguage(FORMAT_SUPPORTED.HTML, hljsXML);  // TODO - Add HTML support
hljs.registerLanguage(FormatSupported.YAML, hljsYAML);

// CSS
hljs.registerLanguage(FormatSupported.CSS, hljsCSS);
hljs.registerLanguage(FormatSupported.LESS, hljsLess);
hljs.registerLanguage(FormatSupported.SCSS, hljsSCSS);

// Scripting
hljs.registerLanguage(FormatSupported.GO, hljsGo);
hljs.registerLanguage(FormatSupported.JAVA, hljsJava);
hljs.registerLanguage(FormatSupported.JAVASCRIPT, hljsJavascript);
hljs.registerLanguage(FormatSupported.TYPESCRIPT, hljsTypescript);
hljs.registerLanguage(FormatSupported.KOTLIN, hljsKotlin);
hljs.registerLanguage(FormatSupported.PYTHON, hljsPython);
hljs.registerLanguage(FormatSupported.RUBY, hljsRuby);
hljs.registerLanguage(FormatSupported.RUST, hljsRust);

hljs.highlightAll();

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

    if (result.error !== '') {
      showParserError(result.error);
    }

    if (result.formatCode !== '') {
      formattedCodeHighlightSintax = hljs.highlight(result.formatCode, {
        language: format,
      }).value;
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
  format = (document.getElementById('select-format') as HTMLInputElement)
    .value as FormatSupported;
  theme = (document.getElementById('select-theme') as HTMLInputElement).value;
}

/*
 * formatCode - format the code
 *
 */
function formatCode(data: FormatData): FormatCode {
  if (data) {
    switch (data.format) {
      case FormatSupported.CSS:
      case FormatSupported.LESS:
      case FormatSupported.SCSS:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.CSS,
          parserPostcss
        );
      case FormatSupported.JSON:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.JSON,
          parserBabel
        );
      // case FORMAT_SUPPORTED.HTML:  // TODO - Add HTML support
      //   return getFormatCodeConfig(data.code, FormatSupported.HTML, parserHtml);
      case FormatSupported.MARKDOWN:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.MARKDOWN,
          parserMarkdown
        );
      case FormatSupported.JAVASCRIPT:
      case FormatSupported.TYPESCRIPT:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.TYPESCRIPT,
          parserTypescript
        );
      case FormatSupported.YAML:
        return getFormatCodeConfig(data.code, FormatSupported.YAML, parserYaml);
      default:
        return {
          formatCode: data.code,
          error: '',
        };
    }
  }
}

function getFormatCodeConfig(
  code: string,
  format: FormatSupported,
  parser: any
): FormatCode {
  try {
    return {
      formatCode: prettier.format(code, {
        parser: format,
        plugins: [parser],
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

  // HTML handle
  // if (format === FORMAT_SUPPORTED.HTML) {
  //   contentHTML = contentHTML.replace(/&lt;/gi, '<');
  //   contentHTML = contentHTML.replace(/&gt;/gi, '>');
  //   contentHTML = contentHTML.replace(/&amp;/gi, '&');
  // }

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
  }
  return 'Regular';
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
