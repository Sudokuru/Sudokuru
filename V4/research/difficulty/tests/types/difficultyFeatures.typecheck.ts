// Compile-time checks: run npx --no-install tsc --noEmit. Bun does not check types.
// This is deliberately not a .test.ts file, which the root tsconfig excludes.
import type { Features, HistoricalScores } from "../../featureTypes";

const feature: keyof Features = "meanNotes";
const historical: HistoricalScores = { "legacy.combined": 3 };
// @ts-expect-error Historical score columns are not V4 feature names.
const wrongFeature: keyof Features = "legacy.combined";
// @ts-expect-error V4 features cannot be incomplete numeric dictionaries.
const missingFeatures: Features = { meanNotes: 2 };
// @ts-expect-error The historical combined score is required.
const missingScore: HistoricalScores = {};
// @ts-expect-error Historical scores do not accept heuristic fields.
const wrongScore: HistoricalScores = { "legacy.combined": 3, singles: 2 };
