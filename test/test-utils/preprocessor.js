const tsc = require('typescript');
const tsConfig = require('../tsconfig.json');

module.exports = {
  process(src, path) {
    return { code: tsc.transpile(src, tsConfig.compilerOptions, path, []) };
  }
};
