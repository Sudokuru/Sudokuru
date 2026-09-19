import { Matrix, SingularValueDecomposition } from "ml-matrix";
import type { ModelInputs } from "./featureTypes";
import type { Observation, ModelSpec, FittedModel } from "./modelTypes";
import { fitDecisionTree, predictDecisionTree } from "./decisionTree";
import { mean } from "./statistics";
import { TREE_DEPTHS, TREE_MIN_LEAVES } from "./settings";

/**
 * Enumerate a fixed search space: a constant baseline, each single heuristic,
 * each distinct pair, and the configured shallow-tree settings. Nothing is fitted here;
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
  for (const depth of TREE_DEPTHS) {
    for (const minLeaf of TREE_MIN_LEAVES) {
      specs.push({ id: `tree:${depth}:${minLeaf}`, kind: "tree", features, depth, minLeaf });
    }
  }
  return specs;
}

/**
 * Fit exclusively from the supplied training rows, including feature scaling.
 * All models predict natural-log solve time, so errors reflect relative changes
 * in time. Invalid inputs throw; an unsolvable linear fit returns null.
 */
export function fitModel(rows: readonly Observation[], spec: ModelSpec): FittedModel | null {
  if (!rows.length) throw new Error("Model training requires observations.");
  if (rows.some(row => !Number.isFinite(row.seconds) || row.seconds <= 0 ||
    spec.features.some(feature => !Number.isFinite(row.features[feature])))) {
    throw new Error("Training values must be finite and times positive.");
  }
  const target = rows.map(row => Math.log(row.seconds));
  const intercept = mean(target);
  if (spec.kind === "constant") return { kind: "constant", spec, target: "logSeconds", intercept };
  if (spec.kind === "tree") {
    return { kind: "tree", spec, target: "logSeconds", tree: fitDecisionTree(rows, spec, spec.depth) };
  }
  // Center and scale each feature using training statistics, saved for prediction.
  // A constant feature gets scale 1 to avoid division by zero, but still makes
  // the linear system singular and therefore causes this candidate to be omitted.
  const means = spec.features.map(feature => mean(rows.map(row => row.features[feature])));
  const scales = spec.features.map((feature, i) =>
    Math.sqrt(mean(rows.map(row => (row.features[feature] - means[i]) ** 2))) || 1);
  const x = rows.map(row => spec.features.map((feature, i) => (row.features[feature] - means[i]) / scales[i]));
  // Fit weights directly from the feature rows, avoiding the numerical error
  // amplification of normal equations (XᵀX). SVD handles the numerical details.
  const fit = new SingularValueDecomposition(new Matrix(x), { autoTranspose: true });
  // Keep skipping fits without independently identifiable weights. The library
  // determines numerical rank rather than relying on our own fixed tolerance.
  if (fit.rank < spec.features.length) return null;
  // Centered features let the intercept stay at the mean training log-time.
  const coefficients = fit.solve(Matrix.columnVector(target.map(value => value - intercept))).to1DArray();
  if (!coefficients.every(Number.isFinite)) return null;
  return { kind: "linear", spec, target: "logSeconds", intercept, coefficients, means, scales };
}

/**
 * Predict natural-log seconds; use Math.exp on the result to recover seconds.
 * Uses already-extracted features and saved training state, with no fitting.
 * Feature extraction is timed separately in the research benchmarks.
 */
export function predict(model: FittedModel, features: ModelInputs): number {
  if (model.kind === "tree") return predictDecisionTree(model.tree, features);
  if (model.kind === "constant") return model.intercept;
  // Reuse the means/scales learned from training, not from the prediction input.
  return model.intercept + model.coefficients.reduce((sum, coefficient, i) =>
    sum + coefficient * (features[model.spec.features[i]] - model.means[i]) / model.scales[i], 0);
}
