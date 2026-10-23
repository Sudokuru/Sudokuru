# Reproducing the difficulty experiments

From the repository root, run:

```sh
bun V4/research/difficulty/run.ts
```

This regenerates the report and detailed artifacts in `V4/docs/difficulty/results/`. The entire results directory, including `REPORT.md` and JSON/CSV outputs, is ignored and generated locally on demand. With repository dependencies installed, the command uses Bun, existing V4 code, `calculate-correlation`, `ml-matrix`, and Node built-ins without additional downloads. Training is offline research. Nothing is exported from the package entry point, and no production difficulty thresholds change.

## Reading the generated report

The report starts with fixed questions and computed tables, without generating an adoption recommendation:

- A compact procedure table with only two metrics: human-correlation score (higher is better) and extraction-plus-prediction p95 in milliseconds (lower is better). The summary includes procedures evaluated on all personal puzzles and a legacy reference when its coverage matches. Partial coverage remains in the appendices rather than appearing beside complete results without a coverage column.
- `humanCorrelationScore` in `statistics.ts` computes `(2 + Spearman + Pearson) / 4`, clamped to [0, 1]. This equally weights rank and linear agreement with human solve times: 0 means both perfectly reversed, 0.5 means zero average correlation, and 1 means both perfect. Both correlations must be finite and available; otherwise the score is unavailable. This is a reporting convention, not a probability, and does not change model selection.
- Initial-plus-trace versus initial-only differences, and two-feature versus one-feature family differences, using the same score and runtime metrics. Changes are first minus second. Differences require matching evaluated puzzle identities, including partial family coverage; otherwise the report displays `Different puzzle coverage` and omits the differences. These differences have no uncertainty estimates.
- Outer-fold selection frequencies (including all tied most-frequent recipes), trace-feature use, and batch-exclusion sensitivity with sample counts. These have no automatic stability classification.
- Combined feature-extraction-plus-prediction costs for the final fitted models. Each family benchmark uses its experiment's feature pipeline, even if the fitted formula does not use every extracted feature. Solution preparation is excluded and prepared solutions are assumed available.
- An evidence inventory, including timing-batch sizes, independent validation count, and availability of legacy runtime measurements. The current runner has no independent validation corpus or legacy runtime measurement; site-average proxies do not count as independent validation.

`ACCEPTANCE_CRITERIA` in `V4/research/difficulty/settings.ts` holds optional maximum ranking-correlation loss and scoring p95 budget in milliseconds. Both default to `null`, shown as `Not configured`. Configured values are displayed for reference, without automatic pass/fail or production-adoption decisions.

Appendices contain final fitted recipes separately from selection-procedure validation, coefficients, all personal feature correlations, detailed family and batch metrics, legacy comparison intervals, site/pooled diagnostics, runtime operations, and corpus corrections. Legacy intervals describe differences in Spearman, not the combined score. All Markdown tables are padded with spaces to align columns in plain text. Reproducibility metadata records the analysis Git revision, tracked working-tree changes, a SHA-256 identifier of the ordered corpus records (including timings and legacy scores), source commit, and execution settings. Git fields are unavailable in source archives. Metadata and criteria are also saved as `reportContext` in `results.json`; the historical `sourceCommit` remains the corpus source, not the analysis revision.

Use `--out /tmp/your-research-directory` for a separate output directory. `--skip-benchmarks` omits machine-dependent timing work and writes `{ "skipped": true }` to `benchmarks.json`, replacing any earlier timings. A run overwrites its named artifacts in the selected directory; use a fresh directory for an independent comparison. Unknown options and a missing `--out` directory argument are rejected.

## Recording eliminated procedures

Manual elimination decisions live in the checked-in [eliminated-procedures.json](eliminated-procedures.json), outside the ignored results directory. It starts empty; the runner never eliminates anything automatically.

First generate a complete run, then record a decision using the procedure ID from the report. For example:

```sh
bun V4/research/difficulty/run.ts
bun V4/research/difficulty/eliminate.ts initial/pair --reason "Reason for eliminating this approach"
bun V4/research/difficulty/run.ts
```

The recording command does not train models. It copies the exact human-correlation score, score definition, raw held-out statistics, p95 calculation time, final recipe ID, corpus/code/settings metadata, benchmark environment, decision reason, and recording date from the saved artifacts. Scores retain full precision. Duplicate decisions are rejected rather than overwriting historical measurements. Incomplete predictions, unavailable correlations, unknown procedure IDs, and mismatched benchmark provenance are rejected. Regenerate results created before benchmark provenance was added before recording a decision. A run with explicitly skipped benchmarks can be recorded with `null` calculation time, displayed as `n/a`.

IDs are `<experiment>/<family>`, currently `initial` or `initial+trace` combined with `selected`, `single`, `pair`, `quadratic`, or `ridge`. Historical `tree` IDs remain supported by the registry reader and snapshot command, but tree generation, fitting, prediction, and settings have been removed after eliminating both tree procedures. Eliminating a model family removes its candidates from every future selection/fitting fold for that experiment, including the aggregate `selected` procedure. Thus active aggregate results may change after eliminating a family. Eliminating `selected` stops its summary, benchmark, and batch-sensitivity evaluation while family evaluation continues; the shared model-selection machinery still derives an internal aggregate winner. If all five active procedures in an experiment are eliminated, the experiment is skipped entirely.

Subsequent reports include frozen rows labeled `(eliminated)` in the main two-metric table and list reasons and provenance under **Elimination decisions**. These measurements are not recomputed, even if the corpus, machine, or scoring convention changes. They are historical comparisons, not fresh validation. A stale live row with the same ID cannot replace an archived row. `results.json` also includes the registry snapshot used by the run, and its settings identify the registry by SHA-256.

Use `eliminate.ts ... --results /path/to/results` to capture another output directory. Both commands accept `--registry /path/to/registry.json` for an isolated version-1 registry. To resume a procedure whose implementation is still available, remove its entry from the checked-in JSON and regenerate; Git retains the prior decision. Resuming trees would also require restoring their implementation from Git. Commit registry changes alongside the research work so decisions and scores survive deleting generated results.

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
- A quadratic formula for each single feature, using the raw terms `x` and `x^2`.
- An all-feature ridge formula for each penalty in `RIDGE_PENALTIES`: 0.01, 0.1, 1, 10, 100.

### Why these two additional approaches?

The branch previously considered candidate counts and ratios, obvious-single progress and early availability, exhaustive one/two-feature log-time formulas, and small trees. The local paper summary motivates availability as a dependency measurement and more expensive refutation simulations; the V4 plan prioritizes hint reuse and fast scoring. Both tree procedures were eliminated and their measurements archived.

Quadratic formulas test a different calibration curve using the existing inexpensive features. The previous one-feature model constrains log-time to a straight line; adding `x^2` permits curvature with only two coefficients. The feature is chosen inside the inner folds. This is exploratory and does not impose monotonicity, so extrapolation beyond the observed feature range may be poor.

Ridge formulas test whether combining the existing correlated signals is useful when coefficients are penalized, rather than searching only feature subsets or fitting an unregularized wide model to 22 observations. All features in the experiment are included, and only the penalty is selected in inner folds. The objective is mean squared log-time error plus `penalty * sum(weights^2)` on standardized inputs; the intercept is not penalized. Positive penalties support redundant/constant inputs and more features than training observations.

Both approaches reuse the existing initial/trace extraction and add no solving strategies, refutation search, or dependencies. They appear as four new report rows (`initial/quadratic`, `initial/ridge`, `initial+trace/quadratic`, `initial+trace/ridge`), each with the same human-correlation score and calculation-time metric. They can be eliminated independently using the existing command. Adding candidates changes what the aggregate `selected` procedure is allowed to choose; the `single` and `pair` procedures keep their original search spaces. No new approach is automatically promoted or eliminated based on these exploratory results.

Tree procedures are historical only: their saved scores and timings are read from `eliminated-procedures.json`. No trees are generated, fitted, selected, or benchmarked, including when using an empty custom registry.

All fits predict natural-log seconds. Formula terms are centered and scaled using only their training observations. For quadratics, `x` and `x^2` have separate training means and scales. Singular value decomposition (SVD) from `ml-matrix` fits weights directly from the feature matrix, avoiding normal equations; unregularized fits without independently identifiable weights are omitted. Ridge augments the standardized matrix with `sqrt(trainingCount * penalty) * I` and the centered target with zeros, leaving the intercept unpenalized. These augmented rows never contribute to evaluation metrics. Fitting and prediction use the same raw terms; a quadratic whose squared inputs overflow is omitted. The repository's data-structure check found `data-structure-typed` unavailable in this checkout; this work retains the existing `ml-matrix` matrix/SVD implementation and adds no collection implementation or dependency.

For exported linear models:

```text
logSeconds = intercept + Σ coefficients[i] × (feature[i] − means[i]) / scales[i]
predictedSeconds = exp(logSeconds)
```

For a quadratic, the two `feature[i]` terms above are `x` and `x^2`. Raw coefficient exports name the squared term `coefficient.<feature>^2`; centering/scaling is absorbed into the exported intercept and both weights. Ridge uses the same raw-feature export as ordinary linear fits. `models.json` stores the fitted model kind, term scaling, and selected penalty for future prediction.

There is no retransformation bias correction; the target is ranking, and seconds errors are secondary diagnostics. Prediction needs only the saved formula and extracted heuristics, not the training libraries.

Model selection uses only the 22 personally timed puzzles. Outer leave-one-puzzle-out predictions evaluate the procedure. Each outer training set runs its own inner leave-one-puzzle-out search; preprocessing, feature selection, and hyperparameter selection never see the outer label. Candidates sort by highest Spearman, lowest log RMSE, lowest complexity (coefficient count), then stable ID. Non-finite or singular fits cannot win. Individual timing attempts are averaged into one puzzle observation and cannot cross folds.

The report also provides separately selected family results, training fit, full-personal-data fitted parameters, and leave-one-personal-batch-out sensitivity checks. Quadratic feature selection and ridge penalty selection participate in the same nested folds; complexity tie-breaking counts expanded coefficients (two for a quadratic). A final fit is selected by cross-validation on all personal observations for research export and site transfer. Its training score is not its validation score.

With fewer than three personal puzzles, an experiment warns and returns no result. Batch sensitivity needs at least two training puzzles after excluding a batch; historical-score comparisons need at least two eligible puzzles. Unavailable diagnostics and model families are reported explicitly, with prediction coverage counts rather than invented scores. These are computational minimums, not sufficient sample sizes for reliable conclusions.

The constant baseline's leave-one-out predictions can be **negatively** correlated with the held-out labels: removing a large observation lowers the remaining training mean. This is an artifact of leave-one-out ranking for a constant predictor, not useful reverse-ranking skill. Its training prediction has undefined correlation.

Personal batch, site-average, and pooled results remain separate. Pooled model evaluation combines personal out-of-fold predictions and site transfer predictions; it is not a single homogeneous validation sample. Each legacy comparison uses identical puzzle subsets. Fixed-seed paired bootstrap intervals use 2,000 puzzle resamples of the existing predictions; these descriptive intervals do not refit models or account for model selection, solver-population variation, or dependence among site-level labels.

With 22 personal puzzles, a wide choice of heuristics can still produce unstable winners despite nesting. Model-family comparisons are exploratory, not a license to choose the best outer result and claim a fresh unbiased estimate. Collect more timing data before production adoption.

## Outputs and performance

| Artifact | Contents |
| --- | --- |
| `REPORT.md` | Procedure comparisons, explicit differences, selection frequencies, batch sensitivity, scoring cost, and evidence inventory; technical appendices |
| `dataset-audit.json` | Validated/derived solutions, provenance, corrected counts, and exact singles traces |
| `features.csv` | One row per unique puzzle, including untimed runtime examples |
| `correlations.csv` | Feature/legacy coefficients by target and cohort, with sample sizes |
| `predictions.csv` | Outer-held-out personal predictions for each family and selected procedure; site transfer predictions |
| `models.json` | Final fitted coefficients and scaling |
| `coefficients.csv` | Full-personal-data raw-feature weights and intercepts for all eligible formula candidates; inner-CV scores are selection diagnostics |
| `results.json` | Settings, report metadata/criteria, full candidate CV tables, selected folds and their feature lists, comparison intervals, and sensitivity results |
| `benchmarks.json` | Runtime/hardware, preparation time, warmed timing samples summarized by operation |

`benchmarks.json` also carries the same `reportContext` as `results.json` for measured runs, allowing elimination snapshots to reject timings from a different run configuration. Skipped runs retain the `{ "skipped": true }` format.

Benchmarks run five warmup passes and 20 measured passes over all 44 puzzles. Initial extraction includes parsing and candidate construction; trace extraction starts with initialized notes and a prepared solution. Combined feature-plus-prediction timings are measured for every available final family model and the selected procedure, including parsing, initialization, and any experiment trace work. Prediction-only measurements batch 1,000 calls to amortize clock overhead; their percentiles are batch averages rather than individual-call tail latency. An exposed checksum consumes results to discourage elimination of unused work. An empty corpus warns and skips measurements.

No latency cutoff is imposed. Compare feature extraction costs as well as tiny inference costs; prepared solutions are an explicit prerequisite for the trace experiment. Hardware-dependent timings and report timing sections will vary between runs. Other generated results are deterministic for the same corpus, code, runtime, execution settings, and recorded Git metadata.

## Verification

Research tests live in `V4/research/difficulty/tests/`, separate from core V4 unit tests. The suites cover corpus provenance, features/single traces, statistics, models/evaluation, experiments/benchmarks, report comparisons and evidence, and elimination snapshots, validation, candidate exclusion, frozen report rows, and the recording CLI.

```sh
bun test V4/research/difficulty/tests
bun test V4/tests/unit
npx --no-install tsc --noEmit
git diff --check
```

Compile-time feature and historical-score checks live in `V4/research/difficulty/tests/types/difficultyFeatures.typecheck.ts`. Bun executes tests but does not type-check them; the root TypeScript configuration excludes `*.test.ts`, so these checks deliberately use a different suffix and run with `tsc --noEmit`.

CI runs core V4 tests, research tests, and TypeScript checks separately. Jest excludes V4 and remains responsible for the legacy tests. Benchmark tests check output structure and valid timing summaries, not machine-dependent speed thresholds.
