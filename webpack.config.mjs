import autoprefixer from 'autoprefixer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import HtmlPlugin from 'html-webpack-plugin';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import ExtensionReloader from 'webpack-extension-reloader';

// Xử lý __dirname cho ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    app: path.resolve('src/index.tsx'),
    contentScript: path.resolve('./src/contentScript/autofillScript.tsx'),
    background: path.resolve('./src/background.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
            ],
          },
        },
      },
      {
        test: /\.js$/,
        include: /node_modules[\\/]@react-spring/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-optional-chaining'],
          },
        },
      },
      {
        use: 'ts-loader',
        test: /\.(tsx|ts)$/,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /\.(ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.LOGGING_ENABLED': JSON.stringify(true),
    }),
    new Dotenv(),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
        { from: 'src/assets/css/content.css', to: 'css/content.css' },
      ],
    }),
    ...getHtmlPlugins(['app', 'contentScript']),
    new ExtensionReloader({
      entries: {
        popup: 'app',
        contentScript: 'contentScript',
      },
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    hot: true,
    writeToDisk: true,
    inline: true,
    allowedHosts: ['all'],
    disableHostCheck: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks(chunk) {
        return chunk.name !== 'contentScript';
      },
    },
  },
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
        title: 'Chrome Extension with ReactJs',
        filename: `${chunk}.html`,
        chunks: [chunk],
      }),
  );
}
