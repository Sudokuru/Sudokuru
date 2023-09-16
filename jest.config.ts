import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
  reporters: [
    "default",
    "github-actions",
    [
      "jest-junit",
      {
        suiteNameTemplate: "{filename}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  collectCoverage: true,
  coverageDirectory: "jest-coverage",
  coverageReporters: ["clover", "json", "lcov", ["text", {file: 'coverage-final.txt'}], "text"],
  modulePathIgnorePatterns: ['stryker-tmp']
};

export default config;

// ! Current test execution time is 84 - 104 seconds