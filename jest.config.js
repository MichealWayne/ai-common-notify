module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/test/unit/**/*.test.js'],
  collectCoverageFrom: ['dist/**/*.js', '!dist/**/*.d.ts', '!dist/index.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
