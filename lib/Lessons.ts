/**
 * Functions to handle requesting lessons
 */
export class Lessons{
    public static strategies:string[] = ["AMEND_NOTES", "NAKED_SINGLE", "NAKED_SET", "HIDDEN_SINGLE", "HIDDEN_SET"];

    public static getSteps(strategy: string):string[][] {
        if (strategy === "AMEND_NOTES") {
            return [
                ["Welcome to Sudokuru! As your Sudoku Guru I will teach you how to solve Sudoku puzzles. Shown above is a Sudoku puzzle. Puzzles are composed of 81 cells divided into 9 rows, 9 columns, and 9 boxes (3x3 groups of cells). Every row, column, and box must contain the numbers 1-9 exactly once.", "https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES_STEP_1.png"],
                ["To begin solving a puzzle you will start filling in notes for each of the cells. Notes are the list of remaining possibilities for a cell. We will start by adding notes to the cell in the top left.", "https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES_STEP_1.png"],
                ["We will amend the notes in the top left cell by adding every number between 1 and 9 that hasn't already been placed in the cell's row, column or box. The small black numbers in the cell are the numbers that should be added as notes. The small red numbers are the numbers that shouldn't be added because they are already in the row, column, or box as shown in the gold highlighted cells.", "https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES_STEP_2.png"],
                ["We've now finished entering all of the valid notes to the top left cell.", "https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES_STEP_3.png"],
                ["You have now learned how to amend notes! If you ever make a mistake in a cell you can always erase the notes from it and amend again.", "https://sudokuru.s3.amazonaws.com/Lessons/AMEND_NOTES_STEP_4.png"]
            ];
        }
        else if (strategy == "NAKED_SINGLE"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_1.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_3.png"]
            ];
        }
        else if (strategy === "SIMPLIFY_NOTES") {
            return [
                ["Here is an example of the simplify notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample2-V2.png"]
            ];
        }
        else if (strategy == "NAKED_SET"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy == "HIDDEN_SINGLE"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else if (strategy == "HIDDEN_SET"){
            return [
                ["Here is an example of the amend notes strategy", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"],
                ["Here is more insight into that example", "https://sudokuru.s3.amazonaws.com/hintExample1-V2.png"]
            ];
        }
        else {
            return null;
        }
    }
}