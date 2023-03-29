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
                ["To solve a Sudoku puzzle you have to correctly fill in all of the empty cells. You can do this by utilizing the naked single strategy. To use the naked single strategy you first have to find a cell with only one note left.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_1.png"],
                ["The highlighted cell in the top middle of the above puzzle is an example of a naked single. Since it only have an 8 left as a note you can fill the cell in with the value 8.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_2.png"],
                ["You have now finished the first half of the naked single strategy by placing the 8.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_3.png"],
                ["The second half of the naked single strategy is using the placed value to simplify the notes of other cells. That is to say you can remove the placed value from the notes of any cell that contains it that shares a row, column, and/or box with the given cell.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_4.png"],
                ["You can now remove the 8 as a note from the cell directly to the left of the recently placed 8 because they share a row (and box).", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_5.png"],
                ["Since that is the only cell with a shared row, column, or box that also has an 8 you are now done with this naked single.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_6.png"],
                ["You have now learned how to use the naked single strategy to solve Sudoku puzzles! Part of what makes naked singles so effective is that they can have a domino effect. For instance, the cell we just removed an 8 from is now its own naked single.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SINGLE_STEP_7.png"]
            ];
        }
        else if (strategy == "NAKED_SET"){
            return [
                ["Naked singles rely on the fact that if a cell has only one possible value, then that must be its value. This then leads to the elimination of the note from other cells in the row, column, and box due to the rule of Sudoku stating that each row, column, and box can only have a number occur once. This idea can be generalized to any set size. For instance, you can have naked pairs, triplets, or even quadruplets (can go even further but they become more rare). While only naked singles involve directly placing a value they all hinge on the fact that there are only x notes that can be placed in x cells leading to each of them having to be placed in one of them eventually resulting in notes being removed from other cells.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SET_STEP_1.png"],
                ["In the above puzzle we have highlighted a naked pair made up of the numbers 2 and 9 in gold. They constitute a naked pair because they are two cells that can only be filled with a combined two numbers. Therefore, one of them will eventually be filled with a 2 while the other will be filled with a 9. This lets you remove both a 2 and a 9 from every cell in the column and box that the two cells share.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SET_STEP_2.png"],
                ["We've now finished removing all of the notes from applying the naked pair.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SET_STEP_3.png"],
                ["You've now learned how to use the naked set strategies! While you can't directly place values with naked sets other than singles you can remove lots of notes which lead to placing values like in the case of the 6 naked single revealed in the leftmost column by the naked pair we just applied.", "https://sudokuru.s3.amazonaws.com/Lessons/NAKED_SET_STEP_4.png"]
            ];
        }
        else if (strategy == "HIDDEN_SINGLE"){
            return [
                ["Hidden singles are when a single note is only left in a single cell in a row, column, or box. When you find a hidden single you can remove all of the notes other than the hidden single itself from the cell.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SINGLE_STEP_1.png"],
                ["In the highlighted column above the number 9 is absent from all of the gold highlighted cells appearing only in one cell. Since only one cell in the column has a nine left you can remove all of the other notes from it as shown highlighted red.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SINGLE_STEP_2.png"],
                ["We've now finished removing all of the excess notes from the hidden single cell.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SINGLE_STEP_3.png"],
                ["You've now learned how to use the hidden single strategy! Hidden singles are particularly useful because they always result in naked singles which can be used to place the value.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SINGLE_STEP_4.png"]
            ];
        }
        else if (strategy == "HIDDEN_SET"){
            return [
                ["Hidden singles are based on the fact that if a row, column, or box only has a single location to place a value than it must be placed there. This idea can be generalized to any set size. For instance, you can have hidden pairs, triplets, or even quadruplets (can go even further but they become more rare). All hidden sets rely on the fact that there are only x places that x values can be placed in a given row, column, or box leading to each of them having to be placed in one of them eventually resulting in all other notes being removed from them.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SET_STEP_1.png"],
                ["In the above puzzle we have highlighted a hidden triplet made up of the numbers 1, 5, and 9. They constitute a hidden triplet because they are three cells containing a combined three numbers that are absent from every other cell in their shared column (the other cells are highlighted in gold). Therefore, each of them will eventually be filled with one of those three numbers. This lets you remove both every other number from their notes as highlighted in red.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SET_STEP_2.png"],
                ["We've now finished removing all of the notes from applying the hidden triplet.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SET_STEP_3.png"],
                ["You've now learned how to use the hidden set strategies! While you can't directly place values with hidden sets you can remove lots of notes which lead to placing values like in the case of the 1 naked single revealed in the column by the hidden triplet we just applied.", "https://sudokuru.s3.amazonaws.com/Lessons/HIDDEN_SET_STEP_4.png"]
            ];
        }
        else {
            return null;
        }
    }
}