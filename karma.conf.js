module.exports = function(config) {

    const karmaPlugins = [
        require('karma-chai'),
        require('karma-chrome-launcher'),
        require('karma-coverage'),
        require('karma-coveralls'),
        require('karma-mocha'),
        require('karma-mocha-reporter'),
        require('karma-remap-coverage'),
        require('karma-sinon'),
        require('karma-sourcemap-loader'),
        require('karma-webpack'),
    ];

    const options = {
        frameworks: ["mocha", "chai", "sinon"],
        files: [
            __dirname + '/test/karma-test-shim.spec.ts'
        ],
        mime: {
            'text/x-typescript': ['ts', 'tsx']
        },
        client: {
            clearContext: false // leave Spec Runner output visible in browser
        },
        autoWatch: true,
        singleRun: false,
        plugins: karmaPlugins,

        preprocessors: {
            [__dirname + '/test/karma-test-shim.spec.ts']: ['webpack', 'sourcemap'],
            [__dirname + '/src/**/*.ts']: ['coverage'],
        },

        webpack: {
            mode: 'development',
            devtool: "inline-source-map",
            resolve: {
                extensions: [".ts", ".js"]
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: "ts-loader",
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                outDir: __dirname,
                                declaration: false,
                            }
                        }
                    },
                    // instrument only testing sources with Istanbul
                    {
                        enforce: 'post',
                        test: /\.ts$/,
                        loader: 'istanbul-instrumenter-loader?embedSource=true&noAutoWrap=true',
                        exclude: /(\.(e2e|spec|mock|spec-helper)\.ts|node_modules)$/,
                    }
                ],
            }
        },

        reporters: [
            'remap-coverage',
            'coverage',
            'mocha',
        ],

        browsers: ['ChromeHeadless'],

        mochaReporter: {
            showDiff: true,
        },

        coverageReporter: {
            type: 'in-memory',
        },

        remapCoverageReporter: {
            'text-summary': null,
            lcovonly: './coverage/lcov.info',
            html: './coverage/html',
            cobertura: './coverage/cobertura.xml',
            json: './coverage/coverage.json'
        },
    };

    if (process.env.TRAVIS) {
        options.autoWatch = false;
        options.singleRun = true;
        options.concurrency = 1;
        options.reporters.push('coveralls');
    }

    config.set(options);
};
