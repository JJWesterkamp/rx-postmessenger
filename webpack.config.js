const { resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: "production",
    target: ['web', 'es5'],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
          include: /\.min\.js$/,
          extractComments: false,
        })]
    },
    entry: {
        "rx-postmessenger": "./src/index.ts",
        "rx-postmessenger.min": "./src/index.ts",
    },
    output: {
        path: resolve(__dirname, 'umd'),
        filename: '[name].js',
        library: {
            name: 'RxPostmessenger',
            type: 'umd',
            export: 'default',
        },
    },

    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    plugins: [
        new webpack.BannerPlugin([
            `rx-postmessenger`,
            `https://jjwesterkamp.github.io/rx-postmessenger`,
            `(c) 2021 Jeffrey Westerkamp`,
            `This software may be freely distributed under the MIT license.`,
        ].join('\n')),
    ]
};
