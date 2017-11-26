var webpack = require('webpack');
const { resolve } = require('path');



module.exports = (env) => ({
    entry: {
        "rx-postmessenger": "./src/index.ts",
        "rx-postmessenger.min": "./src/index.ts"
    },
    output: {
        path: resolve(__dirname, `dist`),
        filename: "[name].js",
        libraryTarget: "umd",
        publicPath: "/dist/",
        library: "RxPostMessenger",
        umdNamedDefine: true
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ],

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ["babel-loader", "awesome-typescript-loader"],
                exclude: /node_modules\/(?!rxjs)/
            }
        ],
    }
});