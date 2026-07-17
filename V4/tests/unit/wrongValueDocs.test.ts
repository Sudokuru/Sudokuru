import {
  directConflictWrongValue,
  directConflictWrongValueHint,
  directConflictWrongValuePuzzle,
  noDirectConflictWrongValue,
  noDirectConflictWrongValueHint,
  noDirectConflictWrongValuePuzzle,
  wrongValuePuzzleSolution,
} from "../../docs/WRONG_VALUE_FRONTEND_DEMO";
import { getWrongValueHint } from "../../wrongValue";
import { expectHintWithoutMutation } from "../utils/assertions";

describe("getWrongValueHint WRONG_VALUE.md examples", () => {
  it("matches the documented direct row conflict exactly", () => {
    expectHintWithoutMutation(
      getWrongValueHint,
      directConflictWrongValuePuzzle,
      wrongValuePuzzleSolution,
      directConflictWrongValue,
      directConflictWrongValueHint
    );
  });

  it("matches the documented no-direct-conflict example exactly", () => {
    expectHintWithoutMutation(
      getWrongValueHint,
      noDirectConflictWrongValuePuzzle,
      wrongValuePuzzleSolution,
      noDirectConflictWrongValue,
      noDirectConflictWrongValueHint
    );
  });
});
