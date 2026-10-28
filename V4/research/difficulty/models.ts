import { Matrix, SingularValueDecomposition } from "ml-matrix";
import type { ModelInputs } from "./featureTypes";
import type { Observation, ModelSpec, FittedModel } from "./modelTypes";
import { mean } from "./statistics";
import { RIDGE_PENALTIES } from "./settings";
import type { ExperimentSpec } from "./experimentTypes";

/** Raw formula terms; quadratic coefficients multiply x and x², respectively. */
export function modelTerms(spec: ModelSpec): readonly string[] {
  if (spec.kind === "reduction" || spec.kind === "bottleneck" || spec.kind === "cascade") return [`log1p(${spec.features[0]})`, spec.features[1]];
  if (spec.kind === "power") return [`log1p(${spec.features[0]})`];
  return spec.kind === "quadratic" ? [spec.features[0], `${spec.features[0]}^2`] : spec.features;
}

function featureValues(spec: ModelSpec, features: ModelInputs): number[] {
  const values = spec.features.map(feature => features[feature]);
  if (spec.kind === "reduction" || spec.kind === "bottleneck" || spec.kind === "cascade") return [values[0] < 0 ? NaN : Math.log1p(values[0]), values[1]];
  if (spec.kind === "power") return [values[0] < 0 ? NaN : Math.log1p(values[0])];
  return spec.kind === "quadratic" ? [values[0], values[0] ** 2] : values;
}

/**
 * Enumerate a fixed search space: a constant baseline, each single heuristic,
 * each distinct pair, a quadratic per feature, and regularized all-feature fits.
 * Nothing is fitted here;
 * cross-validation chooses among these recipes using training puzzles only.
 */
export function candidateSpecs(features: readonly string[]): ModelSpec[] {
  const specs: ModelSpec[] = [{ id: "constant", kind: "constant", features: [] }];
  for (let i = 0; i < features.length; i++) {
    specs.push({ id: `linear:${features[i]}`, kind: "linear", features: [features[i]] });
    for (let j = i + 1; j < features.length; j++) {
      specs.push({ id: `linear:${features[i]}+${features[j]}`, kind: "linear", features: [features[i], features[j]] });
    }
  }
  for (const feature of features) {
    specs.push({ id: `quadratic:${feature}`, kind: "quadratic", features: [feature] });
  }
  if (features.length) {
    for (const penalty of RIDGE_PENALTIES) {
      specs.push({ id: `ridge:${penalty}`, kind: "ridge", features, penalty });
    }
  }
  return specs;
}

/** Fixed experiments add only declared recipes and a constant baseline. */
export function experimentCandidates(experiment: ExperimentSpec): ModelSpec[] {
  if (experiment.additionalModels?.some(spec => spec.features.some(feature => !experiment.features.includes(feature)))) {
    throw new Error("Additional model inputs must belong to the experiment feature set.");
  }
  const generic = candidateSpecs(experiment.fixedModelsOnly ? [] : experiment.features);
  return [...generic, ...(experiment.additionalModels ?? [])];
}

/**
 * Fit exclusively from the supplied training rows, including feature scaling.
 * Direct models fit seconds; other models fit log-seconds. predict() always
 * returns log-seconds for shared evaluation. Unsolvable fits return null.
 */
export function fitModel(rows: readonly Observation[], spec: ModelSpec): FittedModel | null {
  if (!rows.length) throw new Error("Model training requires observations.");
  if (rows.some(row => !Number.isFinite(row.seconds) || row.seconds <= 0 ||
    spec.features.some(feature => !Number.isFinite(row.features[feature])))) {
    throw new Error("Training values must be finite and times positive.");
  }
  if (spec.kind === "direct" && (!Number.isFinite(spec.minimumSeconds) || spec.minimumSeconds <= 0)) {
    throw new Error("Direct-time models require a positive finite minimumSeconds.");
  }
  const target = rows.map(row => spec.kind === "direct" ? row.seconds : Math.log(row.seconds));
  const intercept = mean(target);
  if (spec.kind === "constant") return { kind: "constant", spec, target: "logSeconds", intercept };
  if (spec.kind === "ridge" && (!Number.isFinite(spec.penalty) || spec.penalty <= 0 || !spec.features.length)) {
    throw new Error("Ridge requires a positive finite penalty and at least one feature.");
  }
  const values = rows.map(row => featureValues(spec, row.features));
  if (values.some(row => row.some(value => !Number.isFinite(value)))) return null;
  const terms = modelTerms(spec);
  // Center and scale each feature using training statistics, saved for prediction.
  // A constant term gets scale 1 to avoid division by zero. It makes an
  // unregularized fit singular; ridge's augmented penalty keeps it identifiable.
  const means = terms.map((_, i) => mean(values.map(row => row[i])));
  const scales = terms.map((_, i) =>
    Math.sqrt(mean(values.map(row => (row[i] - means[i]) ** 2))) || 1);
  const x = values.map(row => row.map((value, i) => (value - means[i]) / scales[i]));
  const centeredTarget = target.map(value => value - intercept);
  // Augment the feature matrix rather than forming XᵀX. The intercept is
  // unpenalized; sqrt(n * penalty) makes the objective use mean squared error.
  if (spec.kind === "ridge") {
    const weight = Math.sqrt(rows.length * spec.penalty);
    for (let i = 0; i < terms.length; i++) {
      x.push(terms.map((_, j) => i === j ? weight : 0));
      centeredTarget.push(0);
    }
  }
  // Fit weights directly from the feature rows, avoiding the numerical error
  // amplification of normal equations (XᵀX). SVD handles the numerical details.
  const fit = new SingularValueDecomposition(new Matrix(x), { autoTranspose: true });
  // Keep skipping fits without independently identifiable weights. The library
  // determines numerical rank rather than relying on our own fixed tolerance.
  if (fit.rank < terms.length) return null;
  // Centered features let the intercept stay at the mean training log-time.
  const coefficients = fit.solve(Matrix.columnVector(centeredTarget)).to1DArray();
  if (!coefficients.every(Number.isFinite)) return null;
  const parameters = { target: "logSeconds" as const, intercept, coefficients, means, scales };
  if (spec.kind === "direct") return { kind: "direct", spec, ...parameters, target: "seconds" };
  if (spec.kind === "scarcity") return { kind: "scarcity", spec, ...parameters };
  if (spec.kind === "power") return { kind: "power", spec, ...parameters };
  if (spec.kind === "reduction" || spec.kind === "bottleneck" || spec.kind === "cascade") return { kind: spec.kind, spec, ...parameters };
  if (spec.kind === "quadratic") return { kind: "quadratic", spec, ...parameters };
  if (spec.kind === "ridge") return { kind: "ridge", spec, ...parameters };
  return { kind: "linear", spec, ...parameters };
}

/**
 * Predict natural-log seconds; use Math.exp on the result to recover seconds.
 * Uses already-extracted features and saved training state, with no fitting.
 * Feature extraction is timed separately in the research benchmarks.
 */
export function predict(model: FittedModel, features: ModelInputs): number {
  if (model.kind === "constant") return model.intercept;
  const values = featureValues(model.spec, features);
  // Reuse the means/scales learned from training, not from the prediction input.
  const prediction = model.intercept + model.coefficients.reduce((sum, coefficient, i) =>
    sum + coefficient * (values[i] - model.means[i]) / model.scales[i], 0);
  return model.kind === "direct" ? Math.log(Math.max(model.spec.minimumSeconds, prediction)) : prediction;
}
