module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/cli/**/*.ts'
  ],
  testMatch: [
    '**/test/**/*.test.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.ts'
  ]
};