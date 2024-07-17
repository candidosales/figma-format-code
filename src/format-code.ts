import { FormatSupported } from './constants';
import { FormatCode, FormatData } from './interface';

// Dependencies
//// Prettier - Format
import prettier from 'prettier';

import parserBabel from 'prettier/parser-babel';
import parserGraphQl from 'prettier/parser-graphql';
import parserHtml from 'prettier/parser-html';
import parserMarkdown from 'prettier/parser-markdown';
import parserPostcss from 'prettier/parser-postcss';
import parserTypescript from 'prettier/parser-typescript';
import parserYaml from 'prettier/parser-yaml';

/*
 * formatCode - format the code
 */
export const formatCode = (data: FormatData): FormatCode => {
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
      case FormatSupported.HTML:
        return getFormatCodeConfig(data.code, FormatSupported.HTML, parserHtml);
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
      case FormatSupported.GRAPHQL:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.GRAPHQL,
          parserGraphQl
        );
      default:
        return {
          formatCode: data.code,
          error: '',
        };
    }
  }
};

const getFormatCodeConfig = (
  code: string,
  format: FormatSupported,
  parser: unknown
): FormatCode => {
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
};
