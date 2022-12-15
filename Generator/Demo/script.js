var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var NEXT_STEP_ENDPOINT = "http://localhost:3001/solver/nextStep?board=";
var CANDIDATES = "123456789";
var EMPTY_CELL = "0";
var SINGLE_NAKED_SINGLE = "439275618051896437876143592342687951185329746697451283928734165563912874714568329";
var ONLY_NAKED_SINGLES = "310084002200150006570003010423708095760030000009562030050006070007000900000001500";
/**
 * Given a board array returns the equivalent board string
 * @param boardArray - board array
 * @returns board string
 */
function getBoardString(boardArray) {
    var board = "";
    for (var row = 0; row < 9; row++) {
        for (var column = 0; column < 9; column++) {
            board += boardArray[row][column];
        }
    }
    return board;
}
/**
 * Disables previous step button if on first step, otherwise enables it
 * @param stepNumber - current step number
 */
function togglePreviousStep(stepNumber) {
    if (stepNumber === 0) {
        document.getElementById("previousStep").disabled = true;
    }
    else {
        document.getElementById("previousStep").disabled = false;
    }
    return;
}
/**
 * Disables next step button if on last step, enables it otherwise
 * @param onLastStep - true if on last step
 */
function toggleNextStep(onLastStep) {
    document.getElementById("nextStep").disabled = onLastStep;
    return;
}
/**
 * Disables play button if on last step, enables it otherwise
 * @param onLastStep - true if on last step
 */
function togglePlay(onLastStep) {
    document.getElementById("play").disabled = onLastStep;
    return;
}
/**
 * Sets hint info and action strings if non-null, otherwise clears them
 * @param info - hint info
 * @param action - hint action
 */
function setHintText(info, action) {
    if (info === null) {
        document.getElementById("info").innerText = "";
        document.getElementById("action").innerText = "";
    }
    else {
        document.getElementById("info").innerText = info;
        document.getElementById("action").innerText = action;
    }
    return;
}
/**
 * Checks if is on last step
 * @param notes - notes array
 * @returns true if on last step
 */
function isOnLastStep(notes) {
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
function updateRelatedUI(stepNumber, onLastStep, info, action) {
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
function getGreenHighlight(value) {
    return '<span style="color:green">' + value + '</span>';
}
/**
 * Surrounds given value with span to change color to gred
 * @param value - value to be highlighted
 * @returns red highlighted value
 */
function getRedHighlight(value) {
    return '<span style="color:red">' + value + '</span>';
}
/**
 * Updates table and related UI elements (nextStep/previousStep/play buttons and hint text)
 * @param board - board array
 * @param notes - notes array
 * @param info - hint info
 * @param action - hint action
 * @param stepNumber - step number
 * @returns
 */
function updateTable(board, notes, info, action, stepNumber) {
    // Change stepNumber if on first step so uses current board for oldBoard
    if (stepNumber === 0) {
        stepNumber = 1;
    }
    // updates related UI elements (nextStep/previousStep/play buttons and hint text)
    updateRelatedUI(stepNumber, isOnLastStep(notes), info, action);
    // Get board and notes from previous step
    var prevStepNumber = (stepNumber - 1).toString();
    var oldBoard = JSON.parse(sessionStorage.getItem("board" + prevStepNumber));
    var oldNotes = JSON.parse(sessionStorage.getItem("notes" + prevStepNumber));
    // Stores value or set of notes that get added to cells in the html Sudoku table
    var value;
    // index of note, used to know which to display in each cell of the table
    var noteIndex = 0;
    // Sudoku html table
    var table = document.getElementById("boardTable");
    // updates table
    for (var row = 0; row < 9; row++) {
        for (var column = 0; column < 9; column++) {
            // Adds notes to the html table cell if cell is empty or had value placed this step
            if (board[row][column] === EMPTY_CELL || (board[row][column] !== oldBoard[row][column])) {
                // sets font size for notes
                table.rows[row].cells[column].style.fontSize = "16px";
                value = "";
                // If value is placed add it to value, otherwise add notes to value
                for (var r = 0; r < 3; r++) {
                    for (var c = 0; c < 3; c++) {
                        // If this value was placed in this cell this step highlight it green
                        // If this value was removed from notes this step highlight it red
                        // Otherwise add notes normally
                        if (board[row][column] !== oldBoard[row][column] &&
                            CANDIDATES[(r * 3) + c] === board[row][column]) {
                            value += getGreenHighlight(board[row][column]);
                        }
                        else {
                            if (notes[noteIndex].includes(CANDIDATES[(r * 3) + c])) {
                                value += CANDIDATES[(r * 3) + c];
                            }
                            else if (oldNotes[noteIndex].includes(CANDIDATES[(r * 3) + c])) {
                                value += getRedHighlight(CANDIDATES[(r * 3) + c]);
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
                table.rows[row].cells[column].style.fontSize = "32px";
            }
            // Place contents of value in table cell
            table.rows[row].cells[column].innerHTML = value;
            // Update noteIndex to keep track of next cells notes
            noteIndex++;
        }
    }
    // Update user input box with current board string
    var boardInput = document.getElementById("board");
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
    var stepNumber = sessionStorage.getItem("stepNumber");
    var newStepNumber = (Number(stepNumber) - 1).toString();
    stepNumber = (Number(newStepNumber) - 1).toString();
    // Return if trying to go before the first step
    if (newStepNumber === "0") {
        return;
    }
    // Set new step number
    sessionStorage.setItem("stepNumber", newStepNumber);
    // Get previous board and notes from sessionStorage
    var board = JSON.parse(sessionStorage.getItem("board" + stepNumber));
    var notes = JSON.parse(sessionStorage.getItem("notes" + stepNumber));
    var info = JSON.parse(sessionStorage.getItem("info" + stepNumber));
    var action = JSON.parse(sessionStorage.getItem("action" + stepNumber));
    // Update Sudoku html table
    updateTable(board, notes, info, action, Number(stepNumber));
    return;
}
/**
 * Gets board input string from user input box
 * @returns board input string
 */
function getInputBoard() {
    return document.getElementById("board").value;
}
/**
 * Gets next step endpoint url by combining endpoint with current board string
 * @returns next step endpoint url
 */
function getNextStepURL() {
    return NEXT_STEP_ENDPOINT + getInputBoard();
}
/**
 * Gets stepNumber from sessionStorage if available, otherwise "0"
 * @returns step number if available, otherwise "0"
 */
function getStepNumber() {
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
function setBoardState(stepNumber, board, notes, info, action) {
    sessionStorage.setItem("board" + stepNumber, JSON.stringify(board));
    sessionStorage.setItem("notes" + stepNumber, JSON.stringify(notes));
    sessionStorage.setItem("info" + stepNumber, JSON.stringify(info));
    sessionStorage.setItem("action" + stepNumber, JSON.stringify(action));
    return;
}
/**
 * Gets next step data, stores it in session storage, and updates table
 */
function nextStep() {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, data, board, notes, info, action, stepNumber, newStepNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = getNextStepURL();
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    board = data.board;
                    notes = data.notes;
                    info = data.info;
                    action = data.action;
                    stepNumber = getStepNumber();
                    // Add board, notes, and new stepNumber to sessionStorage
                    setBoardState(stepNumber, board, notes, info, action);
                    newStepNumber = (Number(stepNumber) + 1).toString();
                    sessionStorage.setItem("stepNumber", newStepNumber);
                    // Update Sudoku html table
                    // called with 0-indexed step number i.e. correlates to board/notes for curr step
                    updateTable(board, notes, info, action, Number(stepNumber));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Runs nextStep every half second until the puzzle is solved
 */
function play() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!document.getElementById("nextStep").disabled) return [3 /*break*/, 2];
                    nextStep();
                    return [4 /*yield*/, new Promise(function (f) { return setTimeout(f, 500); })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Loads puzzle chosen from puzzle bank selector element
 */
function loadPuzzle() {
    var puzzle = document.getElementById("puzzleSelect").value;
    var boardInput = document.getElementById("board");
    if (puzzle === "SINGLE_NAKED_SINGLE") {
        boardInput.value = SINGLE_NAKED_SINGLE;
    }
    else {
        boardInput.value = ONLY_NAKED_SINGLES;
    }
    sessionStorage.clear();
    nextStep();
}
