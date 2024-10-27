import { Cell } from "../Cell";
import { SudokuEnum, TupleEnum, getEmptyCellBoard } from "../Sudoku";
import { Group } from "../Group";

// code taken from here: //https://stackoverflow.com/questions/46042613/how-to-test-the-type-of-a-thrown-exception-in-jest#:~:text=In%20Jest%20you%20have%20to%20pass%20a%20function,you%20also%20want%20to%20check%20for%20error%20message%3A
class NoErrorThrownError extends Error {};
export const getError = async <TError>(call: () => unknown): Promise<TError> => {
    try {
        await call();
        throw new NoErrorThrownError();
    } catch (error: unknown) {
        return error as TError;
    }
};

export enum TestBoards {
    SINGLE_OBVIOUS_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329",
    SINGLE_OBVIOUS_SINGLE_SOLUTION = "439275618251896437876143592342687951185329746697451283928734165563912874714568329",
    ONLY_OBVIOUS_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500",
    ONLY_OBVIOUS_SINGLES_SOLUTION = "316984752298157346574623819423718695765439128189562437851396274637245981942871563",
    ROW_HIDDEN_SINGLES = "603002001500000020901730006810400090060000000000690040350000004002070005000500108",
    ROW_HIDDEN_SINGLES_SOLUTION = "683942751574816329921735486817453692469287513235691847358169274142378965796524138",
    ROW_COLUMN_BOX_HIDDEN_SINGLES = "902100860075000001001080000600300048054809600108060900500401000000050002089000050",
    ROW_COLUMN_BOX_HIDDEN_SINGLES_SOLUTION = "942137865875946231361285479697312548254879613138564927523491786416758392789623154",
    ROW_OBVIOUS_SOLUTION = "249871000387625419165493827936584271718362900452917386870206190520109008691748502",
    ROW_OBVIOUS_PAIR_SOLUTION = "249871653387625419165493827936584271718362945452917386873256194524139768691748532",
    COLUMN_OBVIOUS_PAIR = "030000506000098071000000490009800000002010000380400609800030960100000004560982030",
    COLUMN_OBVIOUS_PAIR_SOLUTION = "938741526456298371271365498619853742742619853385427619827134965193576284564982137",
    BOX_OBVIOUS_PAIR = "700000006000320900000000054205060070197400560060000000010000000000095401630100020",
    BOX_OBVIOUS_PAIR_SOLUTION = "783549216451326987926817354245961873197438562368752149514273698872695431639184725",
    OBVIOUS_TRIPLET = "070408029002000004854020007008374200020000000003261700000093612200000403130642070",
    OBVIOUS_TRIPLET_SOLUTION = "671438529392715864854926137518374296726859341943261785487593612269187453135642978",
    OBVIOUS_OCTUPLET = "390000500000050832008316970080030000639702010007000009070045098000690040000000000",
    OBVIOUS_OCTUPLET_SOLUTION = "394827561761459832528316974485931726639782415217564389173245698852693147946178253",
    POINTING_PAIR = "009070000080400000003000028100000670020013040040007800600030000010000000000000284",
    MULTIPLE_SOLUTIONS = "023070000056002301089000000000007080517000006000400000271009005095000000000020000"
}

/**
 * Creates a 2d Cell array with a subarray for each row in Sudoku and an empty Cell for each column in each row
 * @returns blank cell board
 */
export function getBlankCellBoard():Cell[][] {
    let board: Cell[][] = getEmptyCellBoard();
    for (let row:number = 0; row < SudokuEnum.COLUMN_LENGTH; row++) {
        for (let column:number = 0; column < SudokuEnum.ROW_LENGTH; column++) {
            board[row].push(new Cell(row, column));
        }
    }
    return board;
}

/**
 * Given a tuple and a board returns the a 2d cell array containing the first tuple cells from the first row of the board
 * @param tuple - number of cells being returned
 * @param board - 2d cell array board
 * @returns 2d cell array containing the first tuple cells from the first row
 */
export function getRowTuplet(tuple: TupleEnum, board: Cell[][]):Cell[][] {
    let cells:Cell[][] = new Array();
    cells.push(new Array());
    for (let i:number = 0; i < tuple; i++) {
        cells[0].push(board[0][i]);
    }
    return cells;
}

/**
 * Returns the first tuple notes from the given notes Group
 * @param tuple - number of notes being removed
 * @param notes - Group containing notes
 */
export function removeTupleNotes(tuple: TupleEnum, notes: Group):void {
    for (let note:number = 0; note < tuple; note++) {
        notes.remove(note);
    }
    return;
}

/**
 * Removes notes from each of the cells in cells first row
 * @param notes - notes to remove from each cell in cells first row
 * @param cells - cells to remove notes from
 */
export function removeNotesFromEach(notes: Group, cells: Cell[][]):void {
    for (let i:number = 0; i < cells[0].length; i++) {
        cells[0][i].removeNotes(notes);
    }
    return;
}