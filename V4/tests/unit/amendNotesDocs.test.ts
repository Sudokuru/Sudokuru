import {
  basicAmendNotesHint,
  basicAmendNotesPuzzle,
  basicTargetCell,
  correctiveAmendNotesHint,
  correctiveAmendNotesPuzzle,
  correctiveTargetCell,
} from "../../docs/AMEND_NOTES_FRONTEND_DEMO";
import { getAmendNotesHint } from "../../amendNotes";
import { ADDITIONAL_TEST_BOARDS_BY_NAME } from "../utils/additionalBoards";
import { expectHintWithoutMutation } from "../utils/assertions";

const SOLUTION =
  ADDITIONAL_TEST_BOARDS_BY_NAME.ONLY_OBVIOUS_SINGLES_SOLUTION;

describe("getAmendNotesHint AMEND_NOTES.md examples", () => {
  it("matches the documented basic amend-notes example exactly", () => {
    expectHintWithoutMutation(
      getAmendNotesHint,
      basicAmendNotesPuzzle,
      SOLUTION,
      basicTargetCell,
      basicAmendNotesHint
    );
  });

  it("matches the documented filled-cell amend-notes example exactly", () => {
    expectHintWithoutMutation(
      getAmendNotesHint,
      correctiveAmendNotesPuzzle,
      SOLUTION,
      correctiveTargetCell,
      correctiveAmendNotesHint
    );
  });
});
