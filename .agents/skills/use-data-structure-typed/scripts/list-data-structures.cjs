#!/usr/bin/env node

const structures = require("data-structure-typed");
const packageMetadata = require("data-structure-typed/package.json");

const exportedTypes = Object.entries(structures)
  .filter(
    ([name, value]) =>
      /^[A-Z]/.test(name) &&
      (typeof value === "function" ||
        (typeof value === "object" && value !== null))
  )
  .map(([name]) => name)
  .sort((first, second) => first.localeCompare(second));

console.log(`data-structure-typed ${packageMetadata.version}`);
console.log(exportedTypes.join("\n"));
