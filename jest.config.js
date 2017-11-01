module.exports = {
  collectCoverage: true,
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    'jest.config.js',
    'jest.setup.js',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFiles: ['./jest.setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
