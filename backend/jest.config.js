/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverageFrom: [
    "**/*.ts",
    "!tests/**",
    "!server.ts",
  ],
  coverageDirectory: "../coverage",
  clearMocks: true,
  // Only the files with actual test files get the 80% bar enforced —
  // not repo-wide, until every module has its own tests.
  coverageThreshold: {
    "**/authService.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "**/userService.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "**/userRepository.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "**/userController.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
