import './ui.scss';

import { NodePaint, Theme } from './interface';
import { FormatSupported } from './constants';
import { formatCode } from './format-code';
import { highlight, ShikiTheme } from './highlight';
import {
  calculateRGB,
  escapeHtml,
  getFontWeight,
  revertEscapeHtml,
} from './utils';

const $originalContent = document.getElementById('original-content')!;
const $originalError = document.getElementById('original-error')!;
const $previewContent = document.getElementById('preview-content')!;

const $buttonApply = document.getElementById('button-apply')!;
const $buttonPreview = document.getElementById('button-preview')!;
const $selectFormat = document.getElementById('select-format')!;
const $selectTheme = document.getElementById('select-theme')!;

let format = ($selectFormat as HTMLInputElement).value as FormatSupported;
let theme = ($selectTheme as HTMLInputElement).value as ShikiTheme;
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
  formatHighlightCode();
};

// Messages Code -> UI
onmessage = (event) => {
  const message = event.data.pluginMessage;
  $originalContent.innerHTML = escapeHtml(message.textCode);
};

async function formatHighlightCode(): Promise<void> {
  if (format) {
    const result = formatCode({ format, code: $originalContent.textContent });

    if (result.error !== '') {
      showParserError(result.error);
    }

    if (result.formatCode !== '') {
      try {
        const highlightedHtml = await highlight(result.formatCode, format, theme);
        $previewContent.innerHTML = highlightedHtml;
        hideParserError();
      } catch (e) {
        console.error('[Format Code Error]', e instanceof Error ? e.message : e);
      }
    }
  }

  appliedTheme = applyTheme();
}

function updateValues() {
  format = (document.getElementById('select-format') as HTMLInputElement)
    .value as FormatSupported;
  theme = (document.getElementById('select-theme') as HTMLInputElement).value as ShikiTheme;
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
  // Get the shiki pre > code element
  const shikiPre = $previewContent.querySelector('pre.shiki');
  const shikiCode = shikiPre?.querySelector('code');
  
  if (!shikiCode) {
    return {
      format,
      nodePaints: [],
      contentHTML: '',
      global: {
        color: { r: 0, g: 0, b: 0 },
        backgroundColor: { r: 1, g: 1, b: 1 },
        fontName: { family: 'Roboto', style: 'Regular' },
      },
    };
  }

  // Get background color from shiki pre element
  const preStyle = shikiPre ? window.getComputedStyle(shikiPre) : null;
  const backgroundColor = preStyle 
    ? calculateRGB(preStyle.backgroundColor) 
    : { r: 1, g: 1, b: 1 };
  
  // Get the text content
  const contentHTML = revertEscapeHtml(shikiCode.textContent || '');

  const allTags = shikiCode.getElementsByTagName('span');

  const nodePaints: Array<NodePaint> = [];
  let currentIndex = 0;
  
  for (let i = 0, max = allTags.length; i < max; i++) {
    const node = allTags[i];
    const nodeText = node.textContent || '';
    
    // Skip if this span contains other spans (nested)
    if (node.querySelector('span')) {
      continue;
    }

    // Find the position in the plain text content
    const startIndex = contentHTML.indexOf(nodeText, currentIndex);
    if (startIndex === -1) continue;
    
    const endIndex = startIndex + nodeText.length;
    currentIndex = endIndex;

    // Get color from computed style (works with inline styles)
    const computedStyle = window.getComputedStyle(node);
    
    nodePaints.push({
      content: nodeText,
      range: {
        start: startIndex,
        end: endIndex, // end (exclusive)
      },
      paint: {
        blendMode: 'NORMAL',
        color: calculateRGB(computedStyle.color),
        opacity: 1,
        type: 'SOLID',
        visible: true,
      },
      fontName: {
        family: 'Roboto',
        style: getFontWeight(computedStyle.fontWeight),
      },
    });
  }

  // Get default text color from code element
  const codeStyle = window.getComputedStyle(shikiCode);

  return {
    format,
    nodePaints: nodePaints,
    contentHTML: contentHTML,
    global: {
      color: calculateRGB(codeStyle.color),
      backgroundColor: backgroundColor,
      fontName: {
        family: 'Roboto',
        style: 'Regular',
      },
    },
  };
}

// função recursiva que remove as tags span dos elementos
// function removeTagsSpan(elem) {
//   // verifica se o elemento é uma tag span
//   if (elem && elem.tagName === 'SPAN') {
//     // percorre todos os elementos filhos
//     for (let i = 0; i < elem.childNodes.length; i++) {
//       let child = elem.childNodes[i];
//       // se o elemento filho também for uma tag span, remova suas tags span primeiro
//       if (child.tagName === 'SPAN') {
//         removeTagsSpan(child);
//       }
//     }
//     // agora remova a tag span deste elemento
//     let parent = elem.parentNode;

//     while (elem.firstChild) {
//       parent.insertBefore(elem.firstChild, elem);
//     }
//     parent.removeChild(elem);
//   } else {
//     // se não for uma tag span, percorra todos os elementos filhos e remova suas tags span
//     for (let i = 0; i < elem.childNodes.length; i++) {
//       removeTagsSpan(elem.childNodes[i]);
//     }
//   }
// }

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
