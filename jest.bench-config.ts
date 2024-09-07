import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jest-bench/environment",
  testTimeout: 200000,
  reporters: [
    "default",
    "jest-bench/reporter"
  ],
  "testRegex": "(/__benchmarks__/.*|\\.bench)\\.(ts|tsx|js)$",
};

export default config;
