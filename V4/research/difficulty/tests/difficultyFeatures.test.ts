import { initialFeatures } from "../features";
import { singleTrace } from "../singleTrace";
import { getPuzzleString } from "../../../validate";
import { SOLVED_TEST_BOARDS } from "../../../tests/utils/testBoards";

describe("difficulty features and deterministic singles", () => {
  const solution = SOLVED_TEST_BOARDS[9];
  const twoEmpty = "003456789456789123789123456891234567234567891567891234678912345912345678345678912";

  test("counts candidates and ratios on two independent obvious singles", () => {
    const result = initialFeatures(twoEmpty);
    expect(result.features).toEqual({
      empty: 2, notes: 2, meanNotes: 1,
      singles: 2, singleFraction: 1, singlesPerCandidate: 1,
      pairs: 0, pairFraction: 0, triples: 0, tripleFraction: 0, many: 0, manyFraction: 0,
      candidateVariance: 0, emptyPerSingle: 2 / 3, notesPerSingle: 2 / 3,
    });
    const before = JSON.stringify(result.board);
    const trace = singleTrace(result.board, solution);
    expect(trace.placements).toEqual([{ r: 0, c: 0, value: 1 }, { r: 0, c: 1, value: 2 }]);
    expect(trace.availability).toEqual([2, 1]);
    expect(trace.features).toEqual({ tracePlacements: 2, traceFilledFraction: 1, traceRemaining: 0, traceSolved: 1,
      availabilityCount10: 2, availabilityMean10: 1.5, availabilityMin10: 1,
      availabilityCount25: 2, availabilityMean25: 1.5, availabilityMin25: 1 });
    expect(trace.status).toBe("solved");
    expect(singleTrace(result.board, solution)).toEqual(trace);
    expect(JSON.stringify(result.board)).toBe(before);
  });

  test("immediate stalls do not use the supplied solution to make progress", () => {
    const result = initialFeatures("0".repeat(81));
    expect(result.features).toMatchObject({ empty: 81, notes: 729, meanNotes: 9,
      singles: 0, many: 81, manyFraction: 1 });
    const trace = singleTrace(result.board, solution);
    expect(trace.status).toBe("stalled");
    expect(trace.placements).toEqual([]);
    expect(trace.availability).toEqual([]);
    expect(trace.features).toMatchObject({ traceRemaining: 81, traceFilledFraction: 0,
      availabilityCount10: 0, availabilityMean10: 0, availabilityMin10: 0 });
  });

  test("measures two- and three-candidate cells without conflating note counts with techniques", () => {
    const pairs = initialFeatures("123456700" + "0".repeat(72)).features;
    expect(pairs).toMatchObject({ empty: 74, notes: 568, singles: 0,
      pairs: 2, pairFraction: 1 / 37, triples: 0, many: 72 });
    expect(pairs.candidateVariance).toBeCloseTo(4484 / 74 - (568 / 74) ** 2);
    const triples = initialFeatures("123456000" + "0".repeat(72)).features;
    expect(triples).toMatchObject({ empty: 75, notes: 585, meanNotes: 7.8,
      singles: 0, pairs: 0, triples: 3, tripleFraction: 0.04, many: 72 });
    expect(triples.candidateVariance).toBeCloseTo(1.92);
  });

  test("completed boards have finite zero ratios and no trace observations", () => {
    const result = initialFeatures(getPuzzleString(solution));
    expect(result.features).toMatchObject({ empty: 0, notes: 0,
      meanNotes: 0, singleFraction: 0 });
    expect(Object.values(result.features).every(Number.isFinite)).toBe(true);
    expect(singleTrace(result.board, solution)).toMatchObject({ status: "solved", placements: [],
      features: { traceSolved: 1, traceFilledFraction: 0, availabilityCount25: 0 } });
  });

});
