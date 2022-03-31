module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^src(.*)$': '<rootDir>/src/$1',
    '\\.svg': '<rootDir>/src/__tests__/svgrMock.js',
    '\\.(jpg|png|webp)': '<rootDir>/src/__tests__/staticImageMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/config/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/'],
  transform: {
    '^.+.(j|t)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        module: { type: 'commonjs' },
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
}
