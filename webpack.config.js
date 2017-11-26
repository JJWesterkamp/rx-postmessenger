var webpack = require('webpack');
const { resolve } = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: resolve(__dirname, 'umd'),
        filename: '[name].js',
        library: 'RxPostmessenger',
        libraryTarget: 'umd',
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            sourceMap: true,
        })
    ],

    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader',
            exclude: /node_modules/,
            query: {
                declaration: false,
            }
        }],

        rules: [
            {
                test: /\.ts$/,
                loaders: ["awesome-typescript-loader"],
                exclude: /node_modules/,
            }
        ],
    }
};