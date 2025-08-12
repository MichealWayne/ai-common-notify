// Mock console.error and console.log to reduce noise in tests
global.console = {
  ...global.console,
  error: jest.fn(),
  log: jest.fn(),
};