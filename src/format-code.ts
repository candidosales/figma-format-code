import { FormatSupported } from './constants';
import { FormatCode, FormatData } from './interface';

// Dependencies
//// Prettier - Format
import * as prettier from 'prettier/standalone';

import * as parserBabel from 'prettier/plugins/babel';
import * as parserEstree from 'prettier/plugins/estree';
import * as parserGraphQl from 'prettier/plugins/graphql';
import * as parserHtml from 'prettier/plugins/html';
import * as parserMarkdown from 'prettier/plugins/markdown';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserTypescript from 'prettier/plugins/typescript';
import * as parserYaml from 'prettier/plugins/yaml';
import type { Plugin } from 'prettier';

/*
 * formatCode - format the code
 */
export const formatCode = async (data: FormatData): Promise<FormatCode> => {
  if (!data) {
    return {
      formatCode: '',
      error: 'No data provided',
    };
  }
  
  switch (data.format) {
      case FormatSupported.C:
      case FormatSupported.CPP:
        return {
          formatCode: data.code,
          error: '',
        };
      case FormatSupported.CSS:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.CSS,
          parserPostcss
        );
      case FormatSupported.LESS:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.LESS,
          parserPostcss
        );
      case FormatSupported.SCSS:
        return getFormatCodeConfig(
          data.code,
          FormatSupported.SCSS,
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
};

const getFormatCodeConfig = async (
  code: string,
  format: FormatSupported,
  parser: Plugin
): Promise<FormatCode> => {
  try {
    return {
      formatCode: await prettier.format(code, {
        parser: format,
        // estree is the printer for the babel/typescript parsers in Prettier 3
        plugins: [parser, parserEstree],
      }),
      error: '',
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    parent.postMessage(
      {
        pluginMessage: {
          type: 'notify',
          message: errorMessage,
        },
      },
      '*'
    );
    return {
      formatCode: '',
      error: errorMessage,
    };
  }
};
