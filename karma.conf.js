const webpackConfig = require("./webpack.config");

module.exports = function(config) {


    const options = {
        frameworks: ["mocha", "chai", "sinon"],
        files: [
            'test/**/*.spec.ts'
        ],
        preprocessors: {
            "test/**/*.spec.ts": ["webpack"],
            "src/**/*.ts": ["coverage"],
        },
        webpack: {
            mode: webpackConfig.mode,
            module: webpackConfig.module,
            resolve: webpackConfig.resolve
        },

        reporters: ["mocha", "coverage"],
        browsers: ["ChromeHeadless"],

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
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
