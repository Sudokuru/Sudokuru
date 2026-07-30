import { applyHint } from "../../applyHint";
import type { CellProps, Hint } from "../../Types";
import { clonePuzzle } from "../utils/clonePuzzle";

const BASE_PUZZLE: CellProps[][] = [
  [
    { type: "note", notes: [1, 2, 3] },
    { type: "value", value: 2 },
  ],
  [
    { type: "given", value: 2 },
    { type: "note", notes: [1] },
  ],
];

describe("applyHint", () => {
  describe("individual action types", () => {
    it.each<{
      description: string;
      hint: Hint;
      expected: CellProps[][];
    }>([
      {
        description: "removes a user value into an empty note cell",
        hint: {
          strategy: "WRONG_VALUE",
          stages: [
            {
              removeValues: [{ r: 0, c: 1, type: "value", value: 2 }],
            },
          ],
        },
        expected: [
          [
            { type: "note", notes: [1, 2, 3] },
            { type: "note", notes: [] },
          ],
          [
            { type: "given", value: 2 },
            { type: "note", notes: [1] },
          ],
        ],
      },
      {
        description: "removes only the listed notes",
        hint: {
          strategy: "OBVIOUS_SINGLE",
          stages: [
            {
              removeNotes: [
                { r: 0, c: 0, type: "note", notes: [2, 4] },
              ],
            },
          ],
        },
        expected: [
          [
            { type: "note", notes: [1, 3] },
            { type: "value", value: 2 },
          ],
          [
            { type: "given", value: 2 },
            { type: "note", notes: [1] },
          ],
        ],
      },
      {
        description: "places a user value into a note cell",
        hint: {
          strategy: "OBVIOUS_SINGLE",
          stages: [
            {
              placeValues: [{ r: 0, c: 0, type: "value", value: 1 }],
            },
          ],
        },
        expected: [
          [
            { type: "value", value: 1 },
            { type: "value", value: 2 },
          ],
          [
            { type: "given", value: 2 },
            { type: "note", notes: [1] },
          ],
        ],
      },
      {
        description: "adds notes without discarding existing notes",
        hint: {
          strategy: "AMEND_NOTES",
          stages: [
            {
              placeNotes: [
                { r: 1, c: 1, type: "note", notes: [2, 3] },
              ],
            },
          ],
        },
        expected: [
          [
            { type: "note", notes: [1, 2, 3] },
            { type: "value", value: 2 },
          ],
          [
            { type: "given", value: 2 },
            { type: "note", notes: [1, 2, 3] },
          ],
        ],
      },
    ])("$description", ({ hint, expected }) => {
      expect(applyHint(clonePuzzle(BASE_PUZZLE), hint)).toEqual(expected);
    });
  });

  it("applies every action entry in a stage", () => {
    const hint: Hint = {
      strategy: "WRONG_VALUE",
      stages: [
        {
          removeValues: [{ r: 0, c: 1, type: "value", value: 2 }],
          removeNotes: [
            { r: 0, c: 0, type: "note", notes: [1] },
            { r: 1, c: 1, type: "note", notes: [1] },
          ],
        },
      ],
    };
    const expected: CellProps[][] = [
      [
        { type: "note", notes: [2, 3] },
        { type: "note", notes: [] },
      ],
      [
        { type: "given", value: 2 },
        { type: "note", notes: [] },
      ],
    ];

    expect(applyHint(clonePuzzle(BASE_PUZZLE), hint)).toEqual(expected);
  });

  it("applies stages in order when several actions target the same cells", () => {
    const hint: Hint = {
      strategy: "AMEND_NOTES",
      stages: [
        {
          removeValues: [{ r: 0, c: 1, type: "value", value: 2 }],
        },
        {
          placeNotes: [{ r: 0, c: 1, type: "note", notes: [1, 2] }],
        },
        {
          removeNotes: [{ r: 0, c: 1, type: "note", notes: [2] }],
        },
        {
          placeValues: [{ r: 0, c: 0, type: "value", value: 1 }],
        },
      ],
    };
    const expected: CellProps[][] = [
      [
        { type: "value", value: 1 },
        { type: "note", notes: [1] },
      ],
      [
        { type: "given", value: 2 },
        { type: "note", notes: [1] },
      ],
    ];

    expect(applyHint(clonePuzzle(BASE_PUZZLE), hint)).toEqual(expected);
  });

  it("ignores text and highlighting fields", () => {
    const hint: Hint = {
      strategy: "OBVIOUS_SINGLE",
      stages: [
        {
          highlightCells: [
            { location: { r: 0, c: 0 }, highlightType: "focus" },
          ],
          highlightValues: [
            { location: { r: 0, c: 1 }, highlightType: "basis" },
          ],
          highlightNotes: [
            {
              location: { r: 1, c: 1 },
              value: 1,
              highlightType: "removal",
            },
          ],
          text: "Presentation only.",
        },
      ],
    };

    expect(applyHint(clonePuzzle(BASE_PUZZLE), hint)).toEqual(BASE_PUZZLE);
  });

  it("returns a new puzzle when the hint has no stages", () => {
    const puzzle = clonePuzzle(BASE_PUZZLE);
    const result = applyHint(puzzle, {
      strategy: "OBVIOUS_SINGLE",
      stages: [],
    });

    expect(result).toEqual(BASE_PUZZLE);
    expect(result).not.toBe(puzzle);
  });

  it("does not mutate the puzzle or hint", () => {
    const puzzle = clonePuzzle(BASE_PUZZLE);
    const hint: Hint = {
      strategy: "AMEND_NOTES",
      stages: [
        {
          placeNotes: [{ r: 1, c: 1, type: "note", notes: [2] }],
        },
        {
          removeNotes: [{ r: 0, c: 0, type: "note", notes: [3] }],
        },
      ],
    };
    const puzzleBefore = clonePuzzle(puzzle);
    const hintBefore = structuredClone(hint);

    applyHint(puzzle, hint);

    expect(puzzle).toEqual(puzzleBefore);
    expect(hint).toEqual(hintBefore);
  });
});
