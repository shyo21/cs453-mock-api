/* eslint-disable */
export default {
  displayName: 'api',
  preset: './jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './reports/coverage',
  testMatch: [
//    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
//    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '<rootDir>/src/tests/routes/article_test.modified.test.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/tests/routes/article.test.ts',
    '/src/tests/services/auth.service.test.ts',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports/jest-html',
        filename: 'report.html',
        includeFailureMsg: true,
        expand: true,
      },
    ],
  ],
};
