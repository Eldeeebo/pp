// jest.config.js
export default {
  // Indicates that the project uses ES modules.
  // Not strictly necessary if Node version supports it and package.json has "type": "module",
  // but good for clarity with Babel.
  // transform: {}, // Let Babel handle transforms

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel", // or 'v8'

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: -10,
  //   },
  // },

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // The default timeout of a test in milliseconds
  testTimeout: 5000,

  // Test environment
  testEnvironment: "jest-environment-jsdom", // Or "node" if no DOM interactions are tested directly

  // Module file extensions for importing
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "ts", "tsx", "json", "node"],
  
  // Transform files with babel-jest
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  // Support for ES Modules, ensure your .babelrc is set up for @babel/preset-env
};
