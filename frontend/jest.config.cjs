/** @type {import('jest').Config} */
module.exports = {
  // jsdom gives us localStorage, window, etc.
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  // Allow .ts extensions to be resolved without explicit extension in imports
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Run before each test file – sets up the import.meta.env stub
  setupFiles: ['<rootDir>/jest.setup.cjs'],

  testMatch: ['**/__tests__/**/*.test.ts'],
};
