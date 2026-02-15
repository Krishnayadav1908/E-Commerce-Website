module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testEnvironmentOptions: {
    localStorage: '/tmp/jest-localstorage'
  }
};
