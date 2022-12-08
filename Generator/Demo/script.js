async function nextStep() {
    let url = "http://localhost:3000/solver/nextStep?board=";
    url += document.getElementById("board").value;
    let res = await fetch(url);
    let data = await res.json();
    let board = data.board;
    let b = document.getElementById("boardTable");
    let newBoard = "";
    b.rows[0].cells[0].innerHTML = "testing";
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            b.rows[row].cells[col].innerHTML = board[row][col];
            newBoard += board[row][col];
        }
    }
    document.getElementById("board").value = newBoard;
}