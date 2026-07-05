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
  // Only authService.ts has a test file so far (the one requested) — the 80%
  // bar is enforced there, not repo-wide, until the other files get their own tests.
  coverageThreshold: {
    "**/authService.ts": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
