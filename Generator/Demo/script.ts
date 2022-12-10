interface nextStepResponse {
    board: string[][],
    notes: string[][],
    info: string,
    action: string
}

async function nextStep() {
    // Get input board from user input box and create request url
    let url:string = "http://localhost:3000/solver/nextStep?board=";
    let boardInput:HTMLInputElement = <HTMLInputElement>document.getElementById("board");
    let boardString:string = boardInput.value;
    url += boardString;

    // Call and await Solvers response
    let res:Response = await fetch(url);
    let data:nextStepResponse = await res.json();

    // Set data returned from Solver
    let board:string[][] = data.board;
    let notes:string[][] = data.notes;

    // Store board and notes in sessionStorage
    let stepNumber:string;
    if (sessionStorage.getItem("stepNumber") !== null) {
        stepNumber = sessionStorage.getItem("stepNumber");
    }
    else {
        // Convert board string to array
        let boardArray:string[][] = new Array();
        for (let i = 0; i < 9; i++) {
            boardArray.push([]);
            for (let j = 0; j < 9; j++) {
                boardArray[i].push(boardString[(i*9)+j]);
            }
        }
        sessionStorage.setItem("board0", JSON.stringify(boardArray));
        stepNumber = "1";
    }
    sessionStorage.setItem("board" + stepNumber, JSON.stringify(board));
    sessionStorage.setItem("notes" + stepNumber, JSON.stringify(notes));
    let newStepNumber:string = (Number(stepNumber) + 1).toString();
    sessionStorage.setItem("stepNumber", newStepNumber);

    // Get board and notes from previous step
    let prevStepNumber = (Number(stepNumber) - 1).toString();
    let oldBoard = JSON.parse(sessionStorage.getItem("board" + prevStepNumber));
    let oldNotes = JSON.parse(sessionStorage.getItem("notes" + prevStepNumber));

    let noteIndex:number = 0;
    let table:HTMLElement = document.getElementById("boardTable");
    let newBoard:string = "";
    let value:string;
    let values:string = "123456789";

    for (let row:number = 0; row < 9; row++) {
        for (let column:number = 0; column < 9; column++) {
            value = board[row][column];
            newBoard += value;
            if (value === "0" || (value !== oldBoard[row][column])) {
                value = "";
                for (let r:number = 0; r < 3; r++) {
                    for (let c:number = 0; c < 3; c++) {
                        if (board[row][column] === oldBoard[row][column]) {
                            if (notes[noteIndex].includes(values[(r*3)+c])) {
                                value += values[(r*3)+c];
                            }
                            else {
                                value += "-";
                            }
                            value += "-";
                        }
                        else {
                            if (values[(r*3)+c] === board[row][column]) {
                                value += '<span style="color:green">';
                                value += board[row][column];
                                value += '</span>';
                            }
                            else {
                                if (notes[noteIndex].includes(values[(r*3)+c])) {
                                    value += values[(r*3)+c];
                                }
                                else {
                                    value += "-";
                                }
                                value += "-";
                            }
                        }
                    }
                    value += "<br/>";
                }
            }
            else {
                (<HTMLTableElement>table).rows[row].cells[column].style.fontSize = "32px";
            }
            (<HTMLTableElement>table).rows[row].cells[column].innerHTML = value;
            noteIndex++;
        }
    }
    boardInput.value = newBoard;
}