const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => ({
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.ts', // The entry point for your UI code
    code: './src/code.ts', // The entry point for your plugin code
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    environment: {
      // The environment supports arrow functions ('() => { ... }').
      arrowFunction: true,
    },
  },

  target: 'web',

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', 'json'],
  },

  module: {
    rules: [
      {
        test: /\.(s[ac]ss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },

      {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',

      //   inject: 'body', // incluir o código gerado no corpo do arquivo HTML
      //   inlineSource: '.(js|css)$', // habilitar a inclusão do código inline
      chunks: ['ui'],
    }),
    // new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]), // incluir o código runtime inline
  ],

  optimization: {
    minimize: true,
  },
});
