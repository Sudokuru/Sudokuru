// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  checkers: ["typescript"],
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "jest",
  mutate: ['Generator/**.ts', '!Generator/tests/**.ts', '!Generator/Demo/**'],
  disableTypeChecks: 'Generator/**.ts',
  ignorePatterns: [".github/**", ".husky/**", ".idea/**", "dist/**", "jest-coverage/**", "Generator/tests/unit/Board.test.ts"],
  tsconfigFile: 'tsconfig.json',
  concurrency: 4,
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.ts',
    enableFindRelatedTests: true
  },
  dryRunTimeoutMinutes: 30,
  coverageAnalysis: "perTest",
  ignoreStatic: true, // This ignores static mutants
  tempDirName: 'stryker-tmp',
  cleanTempDir: 'always'
};
export default config;

// performance information here: https://github.com/stryker-mutator/stryker-js/issues/3123
// more ways to optimize performance: https://github.com/stryker-mutator/stryker-js/issues/4142#event-9136562433
