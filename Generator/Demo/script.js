async function nextStep() {
    // Call solver with current board string
    let url = "http://localhost:3000/solver/nextStep?board=";
    let boardString = document.getElementById("board").value;
    //console.log("boardStr" + boardString);
    url += boardString;

    // Await Solvers response
    let res = await fetch(url);
    let data = await res.json();

    // Set data returned from Solver
    let board = data.board;
    console.log("Board Received by Client: " + board);
    let notes = data.notes;
    console.log("Notes Received by Client: " + notes);

    // Store board and notes in sessionStorage
    let stepNumber;
    if (sessionStorage.getItem("stepNumber") !== null) {
        stepNumber = sessionStorage.getItem("stepNumber");
    }
    else {
        // Convert board string to array
        let boardArray = new Array();
        for (let i = 0; i < 9; i++) {
            boardArray.push([]);
            for (let j = 0; j < 9; j++) {
                boardArray[i].push(boardString[(i*9)+j]);
            }
        }
        console.log(boardArray);
        sessionStorage.setItem("board0", JSON.stringify(boardArray));
        stepNumber = "1";
    }
    sessionStorage.setItem("board" + stepNumber, JSON.stringify(board));
    sessionStorage.setItem("notes" + stepNumber, JSON.stringify(notes));
    let newStepNumber = (Number(stepNumber) + 1).toString();
    sessionStorage.setItem("stepNumber", newStepNumber);

    // Get board and notes from previous step
    let prevStepNumber = (Number(stepNumber) - 1).toString();
    let oldBoard = JSON.parse(sessionStorage.getItem("board" + prevStepNumber));
    //console.log(oldBoard);
    let oldNotes = JSON.parse(sessionStorage.getItem("notes" + prevStepNumber));

    let noteIndex = 0;
    let table = document.getElementById("boardTable");
    let newBoard = "";
    let value;
    let values = "123456789";

    //console.log("Old Board: " + JSON.stringify(oldBoard));
    //console.log("New Board:" + JSON.stringify(board));

    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            value = board[row][column];
            newBoard += value;
            if (value === "0" || (value !== oldBoard[row][column])) {
                value = "";
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
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
                table.rows[row].cells[column].style.fontSize = "32px";
            }
            table.rows[row].cells[column].innerHTML = value;
            noteIndex++;
        }
    }
    document.getElementById("board").value = newBoard;
}