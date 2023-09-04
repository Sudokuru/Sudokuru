import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
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
};

export default config;
