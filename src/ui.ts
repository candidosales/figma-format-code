import './ui.scss';

import { NodePaint, Theme } from './interface';
import { FormatSupported } from './constants';
import { formatCode } from './format-code';
import { highlight, ShikiTheme } from './highlight';
import { detectLanguage } from './detect-language';
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
const $selectFont = document.getElementById('select-font') as HTMLSelectElement;
const $checkboxLineNumbers = document.getElementById('checkbox-line-numbers') as HTMLInputElement;

let format = ($selectFormat as HTMLInputElement).value as FormatSupported;
let theme = ($selectTheme as HTMLInputElement).value as ShikiTheme;
let fontFamily = $selectFont.value;
let showLineNumbers = $checkboxLineNumbers.checked;
let appliedTheme: Theme;

// Track loaded fonts to avoid duplicate loading
const loadedFonts = new Set<string>();

// Load font from Google Fonts
async function loadGoogleFont(fontName: string): Promise<void> {
  if (loadedFonts.has(fontName)) return;
  
  // Convert font name to Google Fonts URL format
  const fontParam = fontName.replace(/ /g, '+');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;700&display=swap`;
  
  return new Promise((resolve, reject) => {
    link.onload = () => {
      loadedFonts.add(fontName);
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load font: ${fontName}`));
    document.head.appendChild(link);
  });
}

// Start

parent.postMessage(
  {
    pluginMessage: {
      type: 'start',
    },
  },
  '*'
);

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

$selectFont.onchange = async () => {
  updateValues();
  await loadGoogleFont(fontFamily);
  formatHighlightCode();
};

$checkboxLineNumbers.onchange = () => {
  updateValues();
  formatHighlightCode();
};

function updatePreviewFont() {
  const pre = $previewContent.querySelector('pre');
  const code = $previewContent.querySelector('code');
  const fontStyle = `"${fontFamily}", monospace`;
  
  if (pre) pre.style.fontFamily = fontStyle;
  if (code) code.style.fontFamily = fontStyle;
}

// Messages Code -> UI
onmessage = async (event) => {
  const message = event.data.pluginMessage;
  
  if (message.type === 'text') {
    const textCode = message.textCode;
    $originalContent.innerHTML = escapeHtml(textCode);
    
    // Auto-detect language and update select
    const detectedFormat = detectLanguage(textCode);
    console.log('[Format Code] Detected format:', detectedFormat);
    if (detectedFormat) {
      const selectEl = $selectFormat as HTMLSelectElement;
      selectEl.value = detectedFormat;
      format = detectedFormat;
      console.log('[Format Code] Selected value:', selectEl.value);
    }
    
    // Load font and trigger preview
    if (fontFamily) {
      await loadGoogleFont(fontFamily);
    }
    formatHighlightCode();
  }
  
  if (message.type === 'fonts') {
    populateFontSelect(message.fonts);
  }
};

async function populateFontSelect(fonts: string[]) {
  $selectFont.innerHTML = '';
  fonts.forEach((font) => {
    const option = document.createElement('option');
    option.value = font;
    option.textContent = font;
    $selectFont.appendChild(option);
  });
  
  // Set default and update variable
  if (fonts.length > 0) {
    fontFamily = fonts[0];
    await loadGoogleFont(fontFamily);
    // Re-render if text is already loaded
    if ($originalContent.textContent) {
      formatHighlightCode();
    }
  }
}

async function formatHighlightCode(): Promise<void> {
  if (format) {
    const result = formatCode({ format, code: $originalContent.textContent });

    if (result.error !== '') {
      showParserError(result.error);
    }

    if (result.formatCode !== '') {
      try {
        const highlightedHtml = await highlight(result.formatCode, format, theme, showLineNumbers);
        $previewContent.innerHTML = highlightedHtml;
        updatePreviewFont();
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
  fontFamily = (document.getElementById('select-font') as HTMLInputElement).value;
  showLineNumbers = (document.getElementById('checkbox-line-numbers') as HTMLInputElement).checked;
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
      showLineNumbers: false,
      global: {
        color: { r: 0, g: 0, b: 0 },
        backgroundColor: { r: 1, g: 1, b: 1 },
        fontName: { family: fontFamily, style: 'Regular' },
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
        family: fontFamily,
        style: getFontWeight(computedStyle.fontWeight),
      },
    });
  }

  // Get default text color from code element
  const codeStyle = window.getComputedStyle(shikiCode);

  // Calculate line number color (muted version of text color)
  const textColor = calculateRGB(codeStyle.color);
  const lineNumberColor = {
    r: textColor.r * 0.5,
    g: textColor.g * 0.5,
    b: textColor.b * 0.5,
  };

  return {
    format,
    nodePaints: nodePaints,
    contentHTML: contentHTML,
    showLineNumbers: showLineNumbers,
    lineNumberColor: lineNumberColor,
    global: {
      color: calculateRGB(codeStyle.color),
      backgroundColor: backgroundColor,
      fontName: {
        family: fontFamily,
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
