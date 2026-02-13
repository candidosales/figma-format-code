// Type declarations for prettier (v2.x)
declare module 'prettier' {
  export function format(source: string, options?: Options): string;
  export interface Options {
    parser?: string;
    plugins?: unknown[];
    [key: string]: unknown;
  }
}

declare module 'prettier/parser-babel' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-graphql' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-html' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-markdown' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-postcss' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-typescript' {
  const plugin: unknown;
  export default plugin;
}

declare module 'prettier/parser-yaml' {
  const plugin: unknown;
  export default plugin;
}
