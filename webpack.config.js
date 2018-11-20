const { resolve } = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: "production",
    entry: {
        "rx-postmessenger": "./src/index.ts",
        "rx-postmessenger.min": "./src/index.ts",
    },
    output: {
        path: resolve(__dirname, 'umd'),
        filename: '[name].js',
        library: 'RxPostmessenger',
        libraryTarget: 'umd',
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /\.min\.js$/,
                sourceMap: true,
            }),
        ],
    },

    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ["ts-loader"],
                exclude: /node_modules/,
            }
        ],
    }
};
