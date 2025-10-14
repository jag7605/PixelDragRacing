export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleNameMapper: {
      '^phaser$': '<rootDir>/node_modules/phaser/dist/phaser.js'
    },
    transformIgnorePatterns: [
      '/node_modules/(?!phaser)/'
    ],
    verbose: true
  };