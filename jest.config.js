module.exports = {
  collectCoverage: true,
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/coverage/',
    '/dist/',
    '/node_modules/',
    'jest.config.js',
    'jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFiles: ['./jest.setup.js'],
};
