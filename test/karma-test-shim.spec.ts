const tests = require.context("./", true, /\.spec\.ts$/);
tests.keys().forEach(tests);

const SUT = require.context("../src/", true, /\.ts$/);
SUT.keys().forEach(SUT);
