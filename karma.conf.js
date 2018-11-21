const webpackConfig = require("./webpack.config");

module.exports = function(config) {


    const options = {
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
        reporters: ["mocha"],
        browsers: ["ChromeHeadless"],
        autoWatch: true,
        singleRun: false,
    };

    if (process.env.TRAVIS) {
        options.autoWatch = false;
        options.singleRun = true;
        options.concurrency = 1;
        options.reporters = ["mocha"];
    }

    config.set(options);
};
