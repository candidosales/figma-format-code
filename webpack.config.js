const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('@effortlessmotion/html-webpack-inline-source-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
    publicPath: '',
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    environment: {
      // The environment supports arrow functions ('() => { ... }').
      arrowFunction: true,
    },
  },

  devServer: {
    static: path.resolve(__dirname, 'src'),
    open: true,
    hot: true,
  },

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

      // https://webpack.js.org/guides/asset-modules/
      {
        test: /\.(png|jpg|gif|webp|svg)$/,
        type: 'asset/inline',
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js|css)$',
      chunks: ['ui'],
      inject: 'body',
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],

  optimization: {
    minimize: true,
  },
});
