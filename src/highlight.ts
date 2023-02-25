////// Highlight.js - Core

import hljs from 'highlight.js/lib/core'; // Reduce the footprint

import hljsCSS from 'highlight.js/lib/languages/css';
import hljsJavascript from 'highlight.js/lib/languages/javascript';
import hljsJSON from 'highlight.js/lib/languages/json';
import hljsMarkdown from 'highlight.js/lib/languages/markdown';
import hljsLess from 'highlight.js/lib/languages/less';
import hljsSCSS from 'highlight.js/lib/languages/scss';
import hljsTypescript from 'highlight.js/lib/languages/typescript';
import hljsKotlin from 'highlight.js/lib/languages/kotlin';
import hljsJava from 'highlight.js/lib/languages/java';
import hljsGo from 'highlight.js/lib/languages/go';
import hljsPython from 'highlight.js/lib/languages/python';
import hljsRuby from 'highlight.js/lib/languages/ruby';
import hljsXML from 'highlight.js/lib/languages/xml';
import hljsYAML from 'highlight.js/lib/languages/yaml';
import hljsRust from 'highlight.js/lib/languages/rust';
import { FormatSupported } from './constants';

// Common
hljs.registerLanguage(FormatSupported.JSON, hljsJSON);
hljs.registerLanguage(FormatSupported.MARKDOWN, hljsMarkdown);
hljs.registerLanguage(FormatSupported.HTML, hljsXML);
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

export const highlight = hljs;
