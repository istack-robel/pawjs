const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const _ = require("lodash");

let serverRule = require("../inc/babel-server-rule");
serverRule.use.options.plugins = require("../inc/babel-plugins")({noChunk: true});

let cssUseRules = [].concat(require("../inc/babel-css-rule").use);
cssUseRules.shift();

const directories = require("../utils/directories");
const pawConfig = require("../../config").env("development");

let configEnvVars = {};
_.each(pawConfig, (value, key) => {
  configEnvVars[`__config_${key}`] = value;
});

module.exports = {
  mode: "development",
  entry: path.resolve(process.env.__lib_root,"./src/server/common.js"),
  module: {
    rules: [
      serverRule,
      {
        test: /\.(sass|scss|css)$/,
        use: ExtractTextPlugin.extract({
          use: cssUseRules
        })
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,

        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: false,
              outputPath: "build/images/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
        ]
      },
      // Manage images
      {
        test: /\.(jpe?g|png|svg|gif|webp)$/i,
        // match one of the loader's main parameters (sizes and placeholder)
        resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/i,
        use: "pwa-srcset-loader",
      },
      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        // match one of the loader's main parameters (sizes and placeholder)
        use: [
          {
            loader: "file-loader",
            options: {
              emitFile: false,
              outputPath: "build/images/",
              name: "[hash].[ext]",
              context: directories.src,
            }
          },
        ]
      },
    ]
  },
  context: directories.root,
  externals: {
    express: "express"
  },
  target: "node",
  devServer: {
    port: pawConfig.port,
    host: pawConfig.host,
    serverSideRender: pawConfig.serverSideRender,
  },
  optimization: {
    splitChunks: false
  },
  output: {
    filename: "server.js",
    publicPath: "/",
    path: directories.dist,
    library: "dev-server",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.EnvironmentPlugin(Object.assign({}, {
      "__project_root": process.env.__project_root,
      "__lib_root": process.env.__lib_root,
    }, configEnvVars)),

    new ExtractTextPlugin({
      filename: "server.css",
      allChunks: true
    })
  ]
};