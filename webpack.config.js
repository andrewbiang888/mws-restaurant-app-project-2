const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = {
  entry: {
    'home': './home.js',
    'single': './single.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      loaders: [
        'style-loader',
        'css-loader'
      ]
    }]
  },
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, './sw.js'),
      minimize: true
    }),
    new HtmlWebpackPlugin({
      title: 'Custom template',
      chunks: ['home'],
      template: './index.html'
    }),
    new HtmlWebpackPlugin({  // Also generate a test.html
      chunks: ['single'],
      filename: 'restaurant.html',
      template: './restaurant.html'
    }),
    new CopyWebpackPlugin([
      {
        from: './img/**/*',
        to: './'
      },
      // {
      //   from: './sw.js',
      //   to: './'
      // },
      // {
      //   from: 'data/restaurants.json',
      //   to: './data/'
      // },
      {
        from: './manifest.json',
        to: './'
      }
    ], { debug: true })
  ]
}