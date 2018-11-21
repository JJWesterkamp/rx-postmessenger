const webpackConfig = require("./webpack.config");

module.exports = function(config) {
    config.set({
        frameworks: ["mocha", "chai", "sinon"],
        files: [
            'test/**/*.spec.ts'
        ],
        preprocessors: {
            "test/**/*.spec.ts": ["webpack"],
        },
        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        },
        reporters: ["progress", "mocha"],
        browsers: ["ChromeHeadless"],
        singleRun: true,

    });
};
