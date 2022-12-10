interface nextStepResponse {
    board: string[][],
    notes: string[][],
    info: string,
    action: string
}

const NEXT_STEP_ENDPOINT:string = "http://localhost:3000/solver/nextStep?board=";
const CANDIDATES:string = "123456789";
const EMPTY_CELL = "0";

/**
 * Given a board string returns the equivalent board array
 * @param board - board string
 * @returns board array
 */
function getBoardArray(board: string):string[][] {
    let boardArray:string[][] = new Array();
    for (let i = 0; i < 9; i++) {
        boardArray.push([]);
        for (let j = 0; j < 9; j++) {
            boardArray[i].push(board[(i*9)+j]);
        }
    }
    return boardArray;
}


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

function updateTable(board:string[][], notes:string[][], stepNumber:number):void {
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
    for (let row:number = 0; row < 9; row++) {
        for (let column:number = 0; column < 9; column++) {
            // Adds notes to the html table cell if cell is empty or had value placed this step
            if (board[row][column] === EMPTY_CELL || (board[row][column] !== oldBoard[row][column])) {
                value = "";
                // If value is placed add it to value, otherwise add notes to value and if value placed this step highlights its note green
                for (let r:number = 0; r < 3; r++) {
                    for (let c:number = 0; c < 3; c++) {
                        // If this value was placed in this cell this step highlight it green, else add normally
                        if (board[row][column] !== oldBoard[row][column] && 
                            CANDIDATES[(r*3)+c] === board[row][column]) {
                            value += '<span style="color:green">';
                            value += board[row][column];
                            value += '</span>';
                        }
                        else {
                            if (notes[noteIndex].includes(CANDIDATES[(r*3)+c])) {
                                value += CANDIDATES[(r*3)+c];
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
}

async function nextStep() {
    // Get input board from user input box and create request url
    let boardInput:HTMLInputElement = <HTMLInputElement>document.getElementById("board");
    let boardInputString:string = boardInput.value;
    let url:string = NEXT_STEP_ENDPOINT + boardInputString;

    // Call and await Solvers response
    let res:Response = await fetch(url);
    let data:nextStepResponse = await res.json();

    // Set data returned from Solver
    let board:string[][] = data.board;
    let notes:string[][] = data.notes;

    // Get stepNumber if available, otherwise set stepNumber to 1 and set board0 to boardInputString
    let stepNumber:string;
    if (sessionStorage.getItem("stepNumber") !== null) {
        stepNumber = sessionStorage.getItem("stepNumber");
    }
    else {
        // Convert board string to array and add intial board state to sessionStorage
        let boardArray:string[][] = getBoardArray(boardInputString);
        sessionStorage.setItem("board0", JSON.stringify(boardArray));
        stepNumber = "1";
    }

    // Add board, notes, and new stepNumber to sessionStorage
    sessionStorage.setItem("board" + stepNumber, JSON.stringify(board));
    sessionStorage.setItem("notes" + stepNumber, JSON.stringify(notes));
    let newStepNumber:string = (Number(stepNumber) + 1).toString();
    sessionStorage.setItem("stepNumber", newStepNumber);

    // Update Sudoku html table
    updateTable(board, notes, Number(stepNumber));
    
    // Update user input box with current board string
    boardInput.value = getBoardString(board);
}