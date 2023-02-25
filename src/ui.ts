import './ui.scss';

import { NodePaint, Theme } from './interface';
import { FormatSupported } from './constants';
import { formatCode } from './format-code';
import { highlight } from './highlight';
import {
  calculateRGB,
  escapeHtml,
  getFontWeight,
  revertEscapeHtml,
} from './utils';

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
  $originalContent.innerHTML = escapeHtml(message.textCode);
};

function formatHighlightCode(): void {
  let formattedCodeHighlightSintax = '';

  if (format) {
    const result = formatCode({ format, code: $originalContent.textContent });

    if (result.error !== '') {
      showParserError(result.error);
    }

    if (result.formatCode !== '') {
      formattedCodeHighlightSintax = highlight.highlight(result.formatCode, {
        language: format,
      }).value;
      $previewContent.innerHTML = formattedCodeHighlightSintax;
      hideParserError();
    }
  }

  updateTheme();
  appliedTheme = applyTheme();
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
  let contentHTML = revertEscapeHtml($previewContent.innerHTML);

  const allTags = $previewContent.getElementsByTagName('span');

  // console.log('previewContent contentHTML', contentHTML);
  // console.log('applyTheme innerText', previewContent.innerText);
  // console.log('applyTheme all', allTags);

  const nodePaints: Array<NodePaint> = [];
  for (let i = 0, max = allTags.length; i < max; i++) {
    // console.log('==================================');
    // console.log('i', i);

    const node = allTags[i];
    const selector = `<span class="${node.classList.value}">`;

    // TODO - Issue: Span Nested
    // TODO - Verify if exist span nested, if yes, jump for the next item

    // Calculate the index position of the content inside the HTML
    const startIndex = contentHTML.indexOf(selector);
    const endIndex = startIndex + (node.innerHTML.length - 1);

    // Remove the highlight JS HTML Tag
    const regexStart = /<\/?span[^>]*>/i;
    contentHTML = contentHTML.replace(regexStart, '');

    const regexEnd = /<\/span>/i;
    contentHTML = contentHTML.replace(regexEnd, '');

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
        style: getFontWeight(window.getComputedStyle(node).fontWeight),
      },
    });
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

// função recursiva que remove as tags span dos elementos
function removeTagsSpan(elem) {
  // verifica se o elemento é uma tag span
  if (elem && elem.tagName === 'SPAN') {
    // percorre todos os elementos filhos
    for (let i = 0; i < elem.childNodes.length; i++) {
      let child = elem.childNodes[i];
      // se o elemento filho também for uma tag span, remova suas tags span primeiro
      if (child.tagName === 'SPAN') {
        removeTagsSpan(child);
      }
    }
    // agora remova a tag span deste elemento
    let parent = elem.parentNode;

    while (elem.firstChild) {
      parent.insertBefore(elem.firstChild, elem);
    }
    parent.removeChild(elem);
  } else {
    // se não for uma tag span, percorra todos os elementos filhos e remova suas tags span
    for (let i = 0; i < elem.childNodes.length; i++) {
      removeTagsSpan(elem.childNodes[i]);
    }
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
