/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
module.exports = {
  testTimeout: 30 * 3000, // 30s
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  globalSetup: "./test/setup.ts",
  collectCoverageFrom: ["srv/**/*.ts", "!**/node_modules/**"],
  coveragePathIgnorePatterns: ["node_modules/"],
  testEnvironment: "node",
  testRegex: "/test/.*\\.test\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"]
};
