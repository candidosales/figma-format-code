const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.ts', // The entry point for your UI code
    code: './src/code.ts', // The entry point for your plugin code
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
  },

  optimization: {
    minimizer: undefined,
    minimize: false
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { 
    extensions: ['.tsx', '.ts', '.jsx', '.js', 'json'],
  },

  module: {
    rules: [
      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {
        test: /\.(s[ac]ss)$/,
        loader: [
          // Creates `style` nodes from JS strings
          { loader: 'style-loader' },
          // Translates CSS into CommonJS
          { loader: 'css-loader' },
          // Compiles Sass to CSS
          { loader: 'sass-loader' }
        ]
      },

      // Converts TypeScript code to JavaScript
      { test: /\.(ts|tsx)?$/, use: 'ts-loader', exclude: /node_modules/ },

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      { test: /\.css$/, loader: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      { test: /\.(png|jpg|gif|webp|svg)$/, loader: [{ loader: 'url-loader' }] },
    ],
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new webpack.DefinePlugin({
      'global': {} // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
});