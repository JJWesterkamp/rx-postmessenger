module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        './src/**/*.ts'
    ],
    coverageDirectory: 'coverage',
};
