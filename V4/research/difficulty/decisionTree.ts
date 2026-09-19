import type { Observation, TreeSpec, Split } from "./modelTypes";
import type { ModelInputs } from "./featureTypes";
import { mean } from "./statistics";

/** Greedily split training puzzles to reduce squared error in log-seconds. */
export function fitDecisionTree(rows: readonly Observation[], spec: TreeSpec, depth: number): Split {
  const targets = rows.map(row => Math.log(row.seconds));
  const value = mean(targets);
  // A leaf predicts its mean log-time, so its loss is squared distance from that mean.
  const loss = (sample: readonly Observation[]) => {
    const ys = sample.map(row => Math.log(row.seconds));
    const center = mean(ys);
    return ys.reduce((sum, y) => sum + (y - center) ** 2, 0);
  };
  // Stop if no decisions remain or there are too few puzzles for two valid leaves.
  if (depth === 0 || rows.length < 2 * spec.minLeaf) return { value };
  let bestLoss = loss(rows);
  let best: { feature: string; threshold: number; left: Observation[]; right: Observation[] } | undefined;
  for (const feature of spec.features) {
    const values = [...new Set(rows.map(row => row.features[feature]))].sort((a, b) => a - b);
    // Midpoints between distinct values cover every possible training partition.
    for (let i = 1; i < values.length; i++) {
      const threshold = (values[i - 1] + values[i]) / 2;
      const left = rows.filter(row => row.features[feature] <= threshold);
      const right = rows.filter(row => row.features[feature] > threshold);
      if (left.length < spec.minLeaf || right.length < spec.minLeaf) continue;
      const nextLoss = loss(left) + loss(right);
      // Require a meaningful improvement; ties keep the first split encountered.
      if (nextLoss < bestLoss - 1e-12) {
        bestLoss = nextLoss;
        best = { feature, threshold, left, right };
      }
    }
  }
  // Keeping a leaf is better than splitting when no candidate improves its loss.
  if (!best) return { value };
  return {
    feature: best.feature, threshold: best.threshold,
    left: fitDecisionTree(best.left, spec, depth - 1), right: fitDecisionTree(best.right, spec, depth - 1),
  };
}

/** Follow the threshold decisions until a leaf supplies its predicted log-time. */
export function predictDecisionTree(tree: Split, features: ModelInputs): number {
  let node = tree;
  while (!("value" in node)) {
    node = features[node.feature] <= node.threshold ? node.left : node.right;
  }
  return node.value;
}
