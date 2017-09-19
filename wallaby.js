module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js?(x)',
      'src/**/*.json',
      'src/**/*.snap',
      'test/**/*.js',
      '!src/**/*.spec.js?(x)',
      '!test/**/*.spec.js?(x)'
    ],
    tests: ['/**/*.spec.js?(x)'],

    env: {
      type: 'node',
      runner: 'node'
    },

    compilers: {
      '**/*.js?(x)': wallaby.compilers.babel()
    },

    testFramework: 'jest',

    debug: true
  }
}
