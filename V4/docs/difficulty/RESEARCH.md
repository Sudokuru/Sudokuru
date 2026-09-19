# Reproducing the difficulty experiments

From the repository root, run:

```sh
bun V4/research/difficulty/run.ts
```

This regenerates the report and detailed artifacts in `V4/docs/difficulty/results/`. Only `REPORT.md` is intended for version control; the larger JSON/CSV outputs are ignored and generated locally on demand. With repository dependencies installed, the command uses Bun, existing V4 code, `calculate-correlation`, `ml-matrix`, and Node built-ins without additional downloads. Training is offline research. Nothing is exported from the package entry point, and no production difficulty thresholds change.

Use `--out /tmp/your-research-directory` for a separate output directory. `--skip-benchmarks` omits machine-dependent timing work and writes `{ "skipped": true }` to `benchmarks.json`, replacing any earlier timings. A run overwrites its named artifacts in the selected directory; use a fresh directory for an independent comparison. Unknown options and a missing `--out` directory argument are rejected.

## Corpus and provenance

`V4/research/difficulty/data.ts` contains 44 flat, readonly puzzle records imported from commit `d770c39eeda6fba8ef08c33d302b49cc4c41fe3d`. Each keeps its puzzle, timing batch and seconds, individual attempts when available, and legacy scores. Solutions are computed during preparation. Batch definitions identify personal versus site-average timings once for the whole corpus. Untimed records omit timing fields.

- The CSV contributes 14 personally timed puzzles, including both attempts, exact mean seconds, and recorded legacy score.
- The benchmark text contributes eight personally timed puzzles with rounded averages and eight puzzles with site-level averages. Site times repeat four level averages across two puzzle sets; they are proxies, not individual puzzle measurements.
- The report contains 18 puzzles: four overlap the benchmark and 14 have no human times. The overlapping scores match, so each puzzle keeps just one legacy score. Coach labels, website descriptions, and other historical metadata remain in the original documents rather than being duplicated in the research records.

V4 validates uniqueness and computes solutions for all 44 puzzles during preparation. Tests cross-check the computed solutions against the original CSV. Solutions are validation inputs for hint guards, never prediction features or a source of solve steps. Validation and solution derivation are outside performance measurements.

The CSV column named `Not Givens` contains **givens**, including 60 for a puzzle with 21 empty cells. Its seconds-per-cell column divides by givens. Those fields remain in the original CSV; preparation computes actual givens/empty counts and corrected seconds per empty cell. Model targets are total average seconds, not the erroneous per-cell numbers. Source-comparison tests verify the original counts directly.

The main legacy baseline uses each timed puzzle's CSV or benchmark combined score. Report-only puzzles use their report score. Other legacy metrics are evaluated only where recorded. Randomized legacy scoring is not rerun. No human timings or derived feature measurements are imputed for untimed puzzles.

## Feature definitions

The feature input is a 9×9 puzzle string. After parsing, existing V4 `getAmendNotesHint` and `applyHint` initialize each empty cell with every digit absent from its row, column, and box. Player notes do not affect the result. Obvious singles mean cells with exactly one legal candidate, not hidden singles. Here, “pairs” and “triples” count cells with two or three candidates; they do not detect pair/triple solving strategies.

Let `E` be empty cells, `N` total legal candidates, `S` single-candidate cells, and `P`, `T`, `M` counts of cells with two, three, and at least four candidates.

| Feature group | Definition |
| --- | --- |
| Size | empty `E` (givens remain dataset metadata) |
| Notes | total `N`, mean `N/E` |
| Candidate distribution | `S`, `P`, `T`, `M`, each divided by `E`, and population variance of candidate counts |
| Singles ratio | `S/N` |
| Explicit combinations | `E/(S+1)`, `N/(S+1)` |
| Trace progress | placements, placements/original `E`, remaining empty cells, solved indicator |
| Trace availability | count, mean, and minimum of available-single counts before the first 10 and 25 placements |

Traces use `getObviousSingleHint` and `applyHint`, select the first single in row-major order, and terminate on completion or a stall, with at most 81 placements. They do not implement harder strategies or guessing. A terminal stall is not an additional placement observation. Short windows average only observed placements; observation counts expose truncation. Ratios with a zero denominator and empty-window summaries are zero. A completed board has a solved indicator of one.

Every feature receives descriptive Pearson and Spearman correlations against seconds and log-seconds. Pearson uses `calculate-correlation` with 15 decimal places instead of its default nine. Spearman uses average ranks for ties and the same Pearson wrapper. Constants, insufficient samples, and unavailable legacy metrics produce null/blank coefficients, never fabricated zeros. Signs are preserved: negative correlations can be useful predictors.

The feature set omits scaled or shifted duplicates. Total notes, mean notes, and empty count remain because their relationship is a product, so they can contribute differently to a linear model. Singular linear fits are omitted.

## Models and evaluation

Two feature sets are evaluated: initial board only, and initial board plus trace. Each compares:

- A constant mean-log-time baseline.
- Every one-feature and two-feature linear fit over the declared feature set.
- Squared-error regression trees with maximum depth 1–3 and minimum leaf sizes 3 or 5.

All fits predict natural-log seconds. Linear inputs are centered and scaled using only their training observations. Singular value decomposition (SVD) from `ml-matrix` fits weights directly from the feature matrix, avoiding normal equations; fits without independently identifiable weights are omitted. Trees evaluate midpoint thresholds between distinct observed feature values, require both child groups to meet the minimum size, and split only when squared error decreases by more than `1e-12`. Equal-quality splits retain feature/threshold iteration order. Leaves predict their mean log-time.

For exported linear models:

```text
logSeconds = intercept + Σ coefficients[i] × (feature[i] − means[i]) / scales[i]
predictedSeconds = exp(logSeconds)
```

There is no retransformation bias correction; the target is ranking, and seconds errors are secondary diagnostics. Tree training and prediction live in `decisionTree.ts`, without a tree-library dependency. Tree artifacts are plain split records, traversed with `feature <= threshold`; prediction needs only the saved model and extracted heuristics, not the training libraries.

Model selection uses only the 22 personally timed puzzles. Outer leave-one-puzzle-out predictions evaluate the procedure. Each outer training set runs its own inner leave-one-puzzle-out search; preprocessing, feature selection, and hyperparameter selection never see the outer label. Candidates sort by highest Spearman, lowest log RMSE, lowest complexity (coefficient count; trees after formulas), then stable ID. Non-finite or singular fits cannot win. Individual timing attempts are averaged into one puzzle observation and cannot cross folds.

The report also provides separately selected family results, training fit, full-personal-data fitted parameters, and leave-one-personal-batch-out sensitivity checks. A final fit is selected by cross-validation on all personal observations for research export and site transfer. Its training score is not its validation score.

With fewer than three personal puzzles, an experiment warns and returns no result. Batch sensitivity needs at least two training puzzles after excluding a batch; historical-score comparisons need at least two eligible puzzles. Unavailable diagnostics and model families are reported explicitly, with prediction coverage counts rather than invented scores. These are computational minimums, not sufficient sample sizes for reliable conclusions.

The constant baseline's leave-one-out predictions can be **negatively** correlated with the held-out labels: removing a large observation lowers the remaining training mean. This is an artifact of leave-one-out ranking for a constant predictor, not useful reverse-ranking skill. Its training prediction has undefined correlation.

Personal batch, site-average, and pooled results remain separate. Pooled model evaluation combines personal out-of-fold predictions and site transfer predictions; it is not a single homogeneous validation sample. Each legacy comparison uses identical puzzle subsets. Fixed-seed paired bootstrap intervals use 2,000 puzzle resamples of the existing predictions; these descriptive intervals do not refit models or account for model selection, solver-population variation, or dependence among site-level labels.

With 22 personal puzzles, a wide choice of heuristics can still produce unstable winners despite nesting. Model-family comparisons are exploratory, not a license to choose the best outer result and claim a fresh unbiased estimate. Collect more timing data before production adoption.

## Outputs and performance

| Artifact | Contents |
| --- | --- |
| `REPORT.md` | Main findings, correlations, family comparisons, batch sensitivity, and runtime |
| `dataset-audit.json` | Validated/derived solutions, provenance, corrected counts, and exact singles traces |
| `features.csv` | One row per unique puzzle, including untimed runtime examples |
| `correlations.csv` | Feature/legacy coefficients by target and cohort, with sample sizes |
| `predictions.csv` | Outer-held-out personal predictions for each family and selected procedure; site transfer predictions |
| `models.json` | Final fitted coefficients, scaling, and tree split records |
| `coefficients.csv` | Full-personal-data raw-feature weights and intercepts for all eligible formula candidates; inner-CV scores are selection diagnostics |
| `results.json` | Settings, full candidate CV tables, selected folds, comparison intervals, and sensitivity results |
| `benchmarks.json` | Runtime/hardware, preparation time, warmed timing samples summarized by operation |

Benchmarks run five warmup passes and 20 measured passes over all 44 puzzles. Initial extraction includes parsing and candidate construction; trace extraction starts with initialized notes and a prepared solution. End-to-end feature-plus-prediction timings include required parsing, initialization, and trace work. Prediction-only measurements batch 1,000 calls to amortize clock overhead; their percentiles are batch averages rather than individual-call tail latency. An exposed checksum consumes results to discourage elimination of unused work. An empty corpus warns and skips measurements.

No latency cutoff is imposed. Compare feature extraction costs as well as tiny inference costs; prepared solutions are an explicit prerequisite for the trace experiment. Hardware-dependent timings and report timing sections will vary between runs. All other generated artifacts are deterministic for the same corpus, code, and runtime.

## Verification

Research tests live in `V4/research/difficulty/tests/`, separate from core V4 unit tests. The five suites cover corpus provenance, features/single traces, statistics, models/evaluation, and experiments/reporting/benchmarks.

```sh
bun test V4/research/difficulty/tests
bun test V4/tests/unit
npx --no-install tsc --noEmit
git diff --check
```

Compile-time feature and historical-score checks live in `V4/research/difficulty/tests/types/difficultyFeatures.typecheck.ts`. Bun executes tests but does not type-check them; the root TypeScript configuration excludes `*.test.ts`, so these checks deliberately use a different suffix and run with `tsc --noEmit`.

CI runs core V4 tests, research tests, and TypeScript checks separately. Jest excludes V4 and remains responsible for the legacy tests. Benchmark tests check output structure and valid timing summaries, not machine-dependent speed thresholds.
