async function nextStep() {
    let url = "http://localhost:3000/solver/nextStep?board=";
    url += document.getElementById("board").value;
    let res = await fetch(url);
    let data = await res.json();
    let board = data.board;
    let notes = data.notes;
    let noteIndex = 0;
    let table = document.getElementById("boardTable");
    let newBoard = "";
    let value;
    let values = "123456789";
    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            value = board[row][column];
            newBoard += value;
            if (value === "0") {
                value = "";
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        if (notes[noteIndex].includes(values[(r*3)+c])) {
                            value += values[(r*3)+c];
                        }
                        else {
                            value += "-";
                        }
                        value += "-";
                    }
                    value += "<br/>";
                }
                noteIndex++;
            }
            else {
                table.rows[row].cells[column].style.fontSize = "32px";
            }
            table.rows[row].cells[column].innerHTML = value;
            console.log(value);
        }
    }
    document.getElementById("board").value = newBoard;
}