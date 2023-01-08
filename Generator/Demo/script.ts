interface nextStepResponse {
    board: string[][],
    notes: string[][],
    info: string,
    action: string
}

const NEXT_STEP_ENDPOINT:string = "http://localhost:3001/solver/nextStep?board=";
const NEXT_NOTES:string = "&notes=";
const NEXT_NAKED_SINGLE:string = "&nakedSingle=";
const NEXT_HIDDEN_SINGLE:string = "&hiddenSingle=";
const NEXT_NAKED_PAIR:string = "&nakedPair=";
const NEXT_NAKED_TRIPLET:string = "&nakedTriplet=";
const CANDIDATES:string = "123456789";
const EMPTY_CELL = "0";
const SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329";
const ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500";
const HIDDEN_SINGLES = "902100860075000001001080000600300048054809600108060900500401000000050002089000050";
const COLUMN_NAKED_PAIR = "030000506000098071000000490009800000002010000380400609800030960100000004560982030";
const BOX_NAKED_PAIR = "700000006000320900000000054205060070197400560060000000010000000000095401630100020";

/**
 * Given a board array returns the equivalent board string
 * @param boardArray - board array
 * @returns board string
 */
function getBoardString(boardArray: string[][]):string {
    let board:string = "";
    for (let row:number = 0; row < 9; row++) {
        for (let column:number = 0; column < 9; column++) {
            board += boardArray[row][column];
        }
    }
    return board;
}

/**
 * Disables previous step button if on first step, otherwise enables it
 * @param stepNumber - current step number
 */
function togglePreviousStep(stepNumber:number):void {
    if (stepNumber === 0) {
        (<HTMLButtonElement>document.getElementById("previousStep")).disabled = true;
    }
    else {
        (<HTMLButtonElement>document.getElementById("previousStep")).disabled = false;
    }
    return;
}

/**
 * Disables next step button if on last step, enables it otherwise
 * @param onLastStep - true if on last step
 */
function toggleNextStep(onLastStep:boolean):void {
    (<HTMLButtonElement>document.getElementById("nextStep")).disabled = onLastStep;
    return;
}

/**
 * Disables play button if on last step, enables it otherwise
 * @param onLastStep - true if on last step
 */
function togglePlay(onLastStep:boolean):void {
    (<HTMLButtonElement>document.getElementById("play")).disabled = onLastStep;
    return;
}

/**
 * Sets hint info and action strings if non-null, otherwise clears them
 * @param info - hint info
 * @param action - hint action
 */
function setHintText(info:string, action:string):void {
    if (info === null) {
        (<HTMLParagraphElement>document.getElementById("info")).innerText = "";
        (<HTMLParagraphElement>document.getElementById("action")).innerText = "";
    }
    else {
        (<HTMLParagraphElement>document.getElementById("info")).innerText = info;
        (<HTMLParagraphElement>document.getElementById("action")).innerText = action;
    }
    return;
}

/**
 * Checks if is on last step
 * @param notes - notes array
 * @returns true if on last step
 */
function isOnLastStep(notes:string[][]):boolean {
    if (notes === null) {
        return true;
    }
    return false;
}

/**
 * Updates various UI elements (nextStep/previousStep/play buttons and hint text)
 * @param stepNumber - step number
 * @param notes - notes array 
 * @param info - hint info
 * @param action - hint action
 */
function updateRelatedUI(stepNumber:number, onLastStep:boolean, info:string, action:string): void {
    // Disables previous step button if on first step, otherwise enables it
    togglePreviousStep(stepNumber);

    // Disable nextStep and play buttons if on the last step, otherwise enable them
    toggleNextStep(onLastStep);
    togglePlay(onLastStep);

    // Remove hint/info if on last step, otherwise add them
    setHintText(info, action);
}

/**
 * Surrounds given value with span to change color to green
 * @param value - value to be highlighted
 * @returns green highlighted value
 */
function getGreenHighlight(value:string):string {
    return '<span style="color:green">' + value + '</span>';
}

/**
 * Surrounds given value with span to change color to gred
 * @param value - value to be highlighted
 * @returns red highlighted value
 */
function getRedHighlight(value:string):string {
    return '<span style="color:red">' + value + '</span>';
}

/**
 * Updates table and related UI elements (nextStep/previousStep/play buttons and hint text)
 * @param board - board array
 * @param notes - notes array
 * @param info - hint info
 * @param action - hint action
 * @param stepNumber - step number
 */
function updateTable(board:string[][], notes:string[][], info:string, action: string, 
    stepNumber:number):void {
    // Change stepNumber if on first step so uses current board for oldBoard
    if (stepNumber === 0) {
        stepNumber = 1;
    }

    // updates related UI elements (nextStep/previousStep/play buttons and hint text)
    updateRelatedUI(stepNumber, isOnLastStep(notes), info, action);

    // Get board and notes from previous step
    let prevStepNumber = (stepNumber - 1).toString();
    let oldBoard = JSON.parse(sessionStorage.getItem("board" + prevStepNumber));
    let oldNotes = JSON.parse(sessionStorage.getItem("notes" + prevStepNumber));

    // Stores value or set of notes that get added to cells in the html Sudoku table
    let value:string;
    // index of note, used to know which to display in each cell of the table
    let noteIndex:number = 0;
    // Sudoku html table
    let table:HTMLElement = document.getElementById("boardTable");

    // updates table
    for (let row:number = 0; row < 9; row++) {
        for (let column:number = 0; column < 9; column++) {
            // Adds notes to the html table cell if cell is empty or had value placed this step
            if (board[row][column] === EMPTY_CELL || (board[row][column] !== oldBoard[row][column])) {
                // sets font size for notes
                (<HTMLTableElement>table).rows[row].cells[column].style.fontSize = "16px";
                value = "";
                // If value is placed add it to value, otherwise add notes to value
                for (let r:number = 0; r < 3; r++) {
                    for (let c:number = 0; c < 3; c++) {
                        // If this value was placed in this cell this step highlight it green
                        // If this value was removed from notes this step highlight it red
                        // Otherwise add notes normally
                        if (board[row][column] !== oldBoard[row][column] && 
                            CANDIDATES[(r*3)+c] === board[row][column]) {
                            value += getGreenHighlight(board[row][column]);
                        }
                        else {
                            if (notes[noteIndex].includes(CANDIDATES[(r*3)+c])) {
                                value += CANDIDATES[(r*3)+c];
                            }
                            else if (oldNotes[noteIndex].includes(CANDIDATES[(r*3)+c])) {
                                value += getRedHighlight(CANDIDATES[(r*3)+c]);
                            }
                            else {
                                value += "-";
                            }
                            value += "-";
                        }
                    }
                    value += "<br/>";
                }
            }
            else {
                value = board[row][column];
                // Make placed value larger
                (<HTMLTableElement>table).rows[row].cells[column].style.fontSize = "32px";
            }
            // Place contents of value in table cell
            (<HTMLTableElement>table).rows[row].cells[column].innerHTML = value;
            // Update noteIndex to keep track of next cells notes
            noteIndex++;
        }
    }
    // Update user input box with current board string
    let boardInput:HTMLInputElement = <HTMLInputElement>document.getElementById("board");
    boardInput.value = getBoardString(board);
    return;
}

/**
 * Decrements nextStep and updates table with previous board state
 */
function previousStep() {
    // Return if there is no previous step (stepNumber not intialized)
    if (sessionStorage.getItem("stepNumber") === null) {
        return;
    }
    // newStepNumber is old stepNumber decremented, stepNumber is one below that (0 indexed)
    let stepNumber:string = sessionStorage.getItem("stepNumber");
    let newStepNumber:string = (Number(stepNumber) - 1).toString();
    stepNumber = (Number(newStepNumber) - 1).toString();
    // Return if trying to go before the first step
    if (newStepNumber === "0") {
        return;
    }
    // Set new step number
    sessionStorage.setItem("stepNumber", newStepNumber);
    // Get previous board and notes from sessionStorage
    let board:string[][] = JSON.parse(sessionStorage.getItem("board" + stepNumber));
    let notes:string[][] = JSON.parse(sessionStorage.getItem("notes" + stepNumber));
    let info:string = JSON.parse(sessionStorage.getItem("info" + stepNumber));
    let action:string = JSON.parse(sessionStorage.getItem("action" + stepNumber));
    // Update Sudoku html table
    updateTable(board, notes, info, action, Number(stepNumber));
    return;
}

/**
 * Gets board input string from user input box
 * @returns board input string
 */
function getInputBoard():string {
    return (<HTMLInputElement>document.getElementById("board")).value;
}

/**
 * Gets notes last received by the Solver or undefined if none available
 * @returns notes or undefined if none available i.e. at first step
 */
function getNotes():string {
    let notes:string = NEXT_NOTES;
    let stepNumber:string = getStepNumber();
    if (stepNumber !== "0") {
        notes += sessionStorage.getItem("notes" + (Number(stepNumber) - 1).toString());
    }
    else {
        notes += "undefined";
    }
    return notes;
}

/**
 * Gets order of strategy from user input boxes
 * @returns strategy order string
 */
function getStrategyOrder():string {
    let algorithm:string = "";

    algorithm += NEXT_NAKED_SINGLE;
    algorithm += (<HTMLInputElement>document.getElementById("nakedSingle")).value;

    algorithm += NEXT_HIDDEN_SINGLE;
    algorithm += (<HTMLInputElement>document.getElementById("hiddenSingle")).value;

    algorithm += NEXT_NAKED_PAIR;
    algorithm += (<HTMLInputElement>document.getElementById("nakedPair")).value;

    algorithm += NEXT_NAKED_TRIPLET;
    algorithm += (<HTMLInputElement>document.getElementById("nakedTriplet")).value;

    return algorithm;
}

/**
 * Gets next step endpoint url by combining endpoint with current board string and order of strategies
 * @returns next step endpoint url
 */
function getNextStepURL():string {
    return NEXT_STEP_ENDPOINT + getInputBoard() + getNotes() + getStrategyOrder();
}

/**
 * Gets stepNumber from sessionStorage if available, otherwise "0"
 * @returns step number if available, otherwise "0"
 */
function getStepNumber():string {
    if (sessionStorage.getItem("stepNumber") !== null) {
        return sessionStorage.getItem("stepNumber");
    }
    else {
        return "0";
    }
}

/**
 * Sets board state in sessionStorage for given stepNumber
 * @param stepNumber 
 * @param board 
 * @param notes 
 * @param info 
 * @param action 
 */
function setBoardState(stepNumber:string, board:string[][], notes:string[][], info:string, action:string):void {
    sessionStorage.setItem("board" + stepNumber, JSON.stringify(board));
    sessionStorage.setItem("notes" + stepNumber, JSON.stringify(notes));
    sessionStorage.setItem("info" + stepNumber, JSON.stringify(info));
    sessionStorage.setItem("action" + stepNumber, JSON.stringify(action));
    return;
}

/**
 * Gets next step data, stores it in session storage, and updates table
 */
async function nextStep():Promise<void> {
    // Get input board from user input box and create request url
    let url:string = getNextStepURL();

    // Call and await Solvers response
    let res:Response = await fetch(url);
    let data:nextStepResponse = await res.json();

    // Set data returned from Solver
    let board:string[][] = data.board;
    let notes:string[][] = data.notes;
    let info:string = data.info;
    let action:string = data.action;

    // Get stepNumber if available, otherwise set stepNumber to 0
    let stepNumber:string = getStepNumber();
    
    // Add board, notes, and new stepNumber to sessionStorage
    setBoardState(stepNumber, board, notes, info, action);

    // stepNumber is set to the number of steps taken, board and notes above 0 indexed
    // so board0 set when stepNumber = 1 (first step), board1 when stepNumber = 2, ...
    let newStepNumber:string = (Number(stepNumber) + 1).toString();
    sessionStorage.setItem("stepNumber", newStepNumber);

    // Update Sudoku html table
    // called with 0-indexed step number i.e. correlates to board/notes for curr step
    updateTable(board, notes, info, action, Number(stepNumber));
    return;
}

/**
 * Runs nextStep every half second until the puzzle is solved
 */
async function play():Promise<void> {
    while (!(<HTMLButtonElement>document.getElementById("nextStep")).disabled) {
        nextStep();
        await new Promise(f => setTimeout(f, 500));
    }
}

/**
 * Loads puzzle chosen from puzzle bank selector element
 */
function loadPuzzle():void {
    let puzzle:string = (<HTMLSelectElement>document.getElementById("puzzleSelect")).value;
    let boardInput:HTMLInputElement = <HTMLInputElement>document.getElementById("board");
    if (puzzle === "SINGLE_NAKED_SINGLE") {
        boardInput.value = SINGLE_NAKED_SINGLE;
    }
    else if (puzzle === "ONLY_NAKED_SINGLES") {
        boardInput.value = ONLY_NAKED_SINGLES;
    }
    else if (puzzle === "HIDDEN_SINGLES") {
        boardInput.value = HIDDEN_SINGLES;
    }
    else if (puzzle === "COLUMN_NAKED_PAIR") {
        boardInput.value = COLUMN_NAKED_PAIR;
    }
    else {
        boardInput.value = BOX_NAKED_PAIR;
    }
    sessionStorage.clear();
    nextStep();
}