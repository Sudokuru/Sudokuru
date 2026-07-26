import {
  obviousSingleHint,
  obviousSingleNoteCell,
  obviousSinglePuzzle,
  simplifyingObviousSingleHint,
  simplifyingObviousSingleNoteCell,
  simplifyingObviousSinglePuzzle,
} from "../../docs/OBVIOUS_SINGLE_FRONTEND_DEMO";
import { getObviousSingleHint } from "../../obviousSingle";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import { expectHintWithoutMutation } from "../utils/assertions";

describe("getObviousSingleHint OBVIOUS_SINGLE.md examples", () => {
  it("matches the documented placement-only example exactly", () => {
    expectHintWithoutMutation(
      getObviousSingleHint,
      obviousSinglePuzzle,
      ADDITIONAL_TEST_BOARDS_BY_NAME.SINGLE_OBVIOUS_SINGLE_SOLUTION,
      obviousSingleNoteCell,
      obviousSingleHint
    );
  });

  it("matches the documented placement-with-note-simplification example exactly", () => {
    expectHintWithoutMutation(
      getObviousSingleHint,
      simplifyingObviousSinglePuzzle,
      ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION,
      simplifyingObviousSingleNoteCell,
      simplifyingObviousSingleHint
    );
  });
});
