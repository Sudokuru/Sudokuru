This is an excerpt from a report generated on the gttravis/V4-difficulty-coefs branch that ran the V4 difficulty calculations against a larger dataset alongside V3 legacy and some experimental approaches. The results overwhelmingly support V4 as the best human correlation scoring approach and it runs in less than 10 milliseconds the vast majority of the time.

# V4 difficulty research results

Two metrics summarize each procedure: human-correlation score (higher is better) and scoring p95 in milliseconds (lower is better). The score is (2 + Spearman + Pearson) / 4, equally weighting ordering and linear agreement with human solve times: 0 means perfectly reversed, 0.5 means zero average correlation, and 1 means perfect agreement. It is not a probability. Missing correlations produce n/a. Raw statistics are retained in the appendices; model selection is unchanged.

## How do approaches compare with legacy?

Cloud Sudoku results evaluate personal-trained models and fixed V4 raw difficulty scores against puzzle-level mean solve times, with each puzzle weighted equally regardless of completion count. The historical v4/refutation procedure retains its original 30-run implementation. The five v4/difficulty procedures combine the newer refutation and dependency scores; their parameters were frozen before this larger-corpus evaluation. All use prepared solutions. Legacy combined scores are a checked-in V3 snapshot originally calculated with a reset random seed per puzzle. Scoring p95 is measured separately on the original 44-puzzle corpus; it excludes training and solution preparation. Legacy runtime was not measured.

Active results are sorted by human-correlation score, highest first. Equal scores sort by procedure name; unavailable scores appear last.

Procedure                  | Human-correlation score ↑ | Scoring p95 ms ↓
-------------------------- | ------------------------- | ----------------
v4/difficulty-runs10-cap48 | 0.755                     | 19.967
v4/difficulty-runs10-cap32 | 0.754                     | 19.959
v4/difficulty-runs5-cap48  | 0.754                     | 12.990
v4/difficulty-recommended  | 0.750                     | 9.810
v4/difficulty-runs3-cap32  | 0.749                     | 10.095
legacy (V3)                | 0.614                     | n/a
v4/refutation              | 0.599                     | 5.614
initial/single             | 0.597                     | 0.594
initial/direct             | 0.597                     | 0.603
initial/power              | 0.597                     | 0.611

## Top three strategies versus legacy on Cloud Sudoku

Ranked by the Cloud human-correlation score. Legacy and the V4 raw-score procedures produce difficulty scores rather than predicted seconds, so their time errors are unavailable; Pearson compares raw scores with seconds. Timings use the original benchmark corpus. These comparisons use the same validation puzzles; choosing winners here makes subsequent use of this set exploratory.

### v4/difficulty-runs10-cap48 versus legacy

Metric                    | v4/difficulty-runs10-cap48 | Legacy (V3)
------------------------- | -------------------------- | -----------
Puzzles                   | 1533                       | 1533
Human-correlation score ↑ | 0.755                      | 0.614
Spearman ↑                | 0.618                      | 0.299
Pearson ↑                 | 0.401                      | 0.156
Log RMSE ↓                | n/a                        | n/a
MAE seconds ↓             | n/a                        | n/a
Scoring p95 ms ↓          | 19.967                     | n/a

### v4/difficulty-runs10-cap32 versus legacy

Metric                    | v4/difficulty-runs10-cap32 | Legacy (V3)
------------------------- | -------------------------- | -----------
Puzzles                   | 1533                       | 1533
Human-correlation score ↑ | 0.754                      | 0.614
Spearman ↑                | 0.617                      | 0.299
Pearson ↑                 | 0.398                      | 0.156
Log RMSE ↓                | n/a                        | n/a
MAE seconds ↓             | n/a                        | n/a
Scoring p95 ms ↓          | 19.959                     | n/a

### v4/difficulty-runs5-cap48 versus legacy

Metric                    | v4/difficulty-runs5-cap48 | Legacy (V3)
------------------------- | ------------------------- | -----------
Puzzles                   | 1533                      | 1533
Human-correlation score ↑ | 0.754                     | 0.614
Spearman ↑                | 0.615                     | 0.299
Pearson ↑                 | 0.399                     | 0.156
Log RMSE ↓                | n/a                       | n/a
MAE seconds ↓             | n/a                       | n/a
Scoring p95 ms ↓          | 12.990                    | n/a
