var t={707:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Board=e.getMaxGameDifficulty=void 0;const r=n(95),o=n(777),i=n(677),u=n(777),s=n(826),l=n(398),E=n(207),a=100,h=.02;function N(t){return t*(1+a*h)}e.getMaxGameDifficulty=N;const T=N(E.MAX_DIFFICULTY);e.Board=class{board;solution;solutionString;strategies;drills;difficulty;solver;constructor(t,e){this.validatePuzzle(t),this.board=(0,o.getBoardArray)(t),this.strategies=new Array(u.StrategyEnum.COUNT).fill(!1),this.drills=new Array(u.StrategyEnum.COUNT).fill(!1),this.difficulty=0,this.solver=void 0===e?new i.Solver(this.board):new i.Solver(this.board,e),this.setDrills(),this.solve()}getBoard(){return this.board}getSolution(){return this.solution}getSolutionString(){return this.solutionString}getStrategies(){return this.strategies}getDifficulty(){return this.difficulty}getDrills(){return this.drills}setDrills(){let t=new Array;t.push(u.StrategyEnum.SIMPLIFY_NOTES);for(let e=u.StrategyEnum.INVALID+1;e<u.StrategyEnum.COUNT;e++)e!==u.StrategyEnum.SIMPLIFY_NOTES&&t.push(e);let e=new i.Solver(this.board,t),n=e.getAllHints();for(;e.nextStep().getStrategyType()===u.StrategyEnum.SIMPLIFY_NOTES;)n=e.getAllHints();this.drills=new Array(u.StrategyEnum.COUNT).fill(!1);for(let t=0;t<n.length;t++)this.drills[n[t].getStrategyType()]=!0;for(let t=0;t<this.drills.length;t++)if(this.drills[t]){let e=this.getPrereqs(t);for(let t=0;t<e.length;t++)this.drills[e[t]]=!1}this.drills[u.StrategyEnum.SIMPLIFY_NOTES]=!0}getPrereqs(t){let e=new Array;return t===u.StrategyEnum.NAKED_OCTUPLET&&(e.push(u.StrategyEnum.NAKED_SEPTUPLET),t=u.StrategyEnum.NAKED_SEPTUPLET),t===u.StrategyEnum.NAKED_SEPTUPLET&&(e.push(u.StrategyEnum.NAKED_SEXTUPLET),t=u.StrategyEnum.NAKED_SEXTUPLET),t===u.StrategyEnum.NAKED_SEXTUPLET&&(e.push(u.StrategyEnum.NAKED_QUINTUPLET),t=u.StrategyEnum.NAKED_QUINTUPLET),t===u.StrategyEnum.NAKED_QUINTUPLET&&(e.push(u.StrategyEnum.NAKED_QUADRUPLET),t=u.StrategyEnum.NAKED_QUADRUPLET),t===u.StrategyEnum.NAKED_QUADRUPLET&&(e.push(u.StrategyEnum.NAKED_TRIPLET),t=u.StrategyEnum.NAKED_TRIPLET),t===u.StrategyEnum.NAKED_TRIPLET&&(e.push(u.StrategyEnum.NAKED_PAIR),t=u.StrategyEnum.NAKED_PAIR),t!==u.StrategyEnum.NAKED_PAIR&&t!==u.StrategyEnum.HIDDEN_SINGLE||e.push(u.StrategyEnum.NAKED_SINGLE),e}solve(){let t=this.solver.nextStep(),e=0;for(;null!==t;)this.strategies[t.getStrategyType()]=!0,this.difficulty+=t.getDifficulty(),e++,t=this.solver.nextStep();this.solution=this.solver.getSolution(),this.setSolutionString();for(let t=0;t<u.StrategyEnum.COUNT;t++)if(this.strategies[t]){let e=this.getPrereqs(u.StrategyEnum[u.StrategyEnum[t]]);for(let t=0;t<e.length;t++)this.strategies[e[t]]=!0}this.difficulty/=e,this.difficulty=Math.ceil(this.difficulty*(1+Math.min(e,a)*h)),this.difficulty=Math.ceil(this.difficulty/T*1e3)}setSolutionString(){this.solutionString="";for(let t=0;t<this.solution.length;t++)for(let e=0;e<this.solution[t].length;e++)this.solutionString+=this.solution[t][e]}validatePuzzle(t){let e=o.SudokuEnum.EMPTY_CELL+o.SudokuEnum.CANDIDATES;if(e="^["+e+"]*$",t.length!==o.SudokuEnum.BOARD_LENGTH)throw new r.CustomError(r.CustomErrorEnum.INVALID_BOARD_LENGTH);if(!new RegExp(e).test(t))throw new r.CustomError(r.CustomErrorEnum.INVALID_BOARD_CHARACTERS);if(!t.includes(o.SudokuEnum.EMPTY_CELL))throw new r.CustomError(r.CustomErrorEnum.BOARD_ALREADY_SOLVED);var n=(0,o.getBoardArray)(t);for(let t=0;t<o.SudokuEnum.COLUMN_LENGTH;t++){let e=new l.Group(!1);for(let i=0;i<o.SudokuEnum.ROW_LENGTH;i++)if(n[t][i]!==o.SudokuEnum.EMPTY_CELL&&!e.insert(n[t][i]))throw new r.CustomError(r.CustomErrorEnum.DUPLICATE_VALUE_IN_ROW)}for(let t=0;t<o.SudokuEnum.ROW_LENGTH;t++){let e=new l.Group(!1);for(let i=0;i<o.SudokuEnum.COLUMN_LENGTH;i++)if(n[i][t]!==o.SudokuEnum.EMPTY_CELL&&!e.insert(n[i][t]))throw new r.CustomError(r.CustomErrorEnum.DUPLICATE_VALUE_IN_COLUMN)}for(let t=0;t<o.SudokuEnum.BOX_COUNT;t++){let e=new l.Group(!1),i=s.Cell.getBoxRowStart(t);for(let u=i;u<i+o.SudokuEnum.BOX_LENGTH;u++){let i=s.Cell.getBoxColumnStart(t);for(let t=i;t<i+o.SudokuEnum.BOX_LENGTH;t++)if(n[u][t]!==o.SudokuEnum.EMPTY_CELL&&!e.insert(n[u][t]))throw new r.CustomError(r.CustomErrorEnum.DUPLICATE_VALUE_IN_BOX)}}return!0}}},826:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Cell=void 0;const r=n(398),o=n(777);class i{row;column;box;value;notes;constructor(t,e,n){(0,o.validateRow)(t),(0,o.validateColumn)(e),this.row=t,this.column=e,this.initializeBox(),void 0!==n?((0,o.validateValue)(n),this.value=n):this.value=o.SudokuEnum.EMPTY_CELL,this.notes=new r.Group(!0)}getRow(){return this.row}getColumn(){return this.column}getValue(){return this.value}getBox(){return this.box}static getBoxColumnStart(t){return t%o.SudokuEnum.BOX_LENGTH*3}getBoxColumnStart(){return i.getBoxColumnStart(this.box)}static getBoxRowStart(t){return 3*Math.floor(t/o.SudokuEnum.BOX_LENGTH)}getBoxRowStart(){return i.getBoxRowStart(this.box)}isEmpty(){return this.value===o.SudokuEnum.EMPTY_CELL}getNotes(){return this.notes}hasNote(t){return this.notes.contains(t)}setValue(t){this.value=t}removeNote(t){this.notes.remove(t)}removeNotes(t){for(let e=0;e<o.SudokuEnum.ROW_LENGTH;e++)t.contains(e)&&this.notes.remove(e)}initializeBox(){this.box=Math.floor(this.column/o.SudokuEnum.BOX_LENGTH),this.box+=Math.floor(this.row/o.SudokuEnum.BOX_LENGTH)*o.SudokuEnum.BOX_LENGTH}}e.Cell=i},95:(t,e)=>{var n;Object.defineProperty(e,"__esModule",{value:!0}),e.CustomError=e.CustomErrorEnum=void 0,(n=e.CustomErrorEnum||(e.CustomErrorEnum={})).INVALID_BOARD_LENGTH="The board is not length 9",n.INVALID_BOARD_CHARACTERS="The board contains characters other than the empty value: 0 and the following candidates: 123456789",n.BOARD_ALREADY_SOLVED="The board is already solved",n.ROW_INDEX_OUT_OF_RANGE="The row index used isn't in the range 0-8",n.COLUMN_INDEX_OUT_OF_RANGE="The column index used isn't in the range 0-8",n.DUPLICATE_VALUE_IN_ROW="There is a duplicate value in one of the rows",n.DUPLICATE_VALUE_IN_COLUMN="There is a duplicate value in one of the columns",n.DUPLICATE_VALUE_IN_BOX="There is a duplicate value in one of the boxes",n.INVALID_VALUE="The value provided isn't one of the following options allowed: 123456789",n.STRATEGY_NOT_IDENTIFIED="A strategy hasn't been identified yet",n.UNSOLVABLE="This board isn't solvable",n.NOT_SOLVED="This board isn't solved",n.INVALID_CANDIDATE_TYPE="Candidate isn't a string candidate or a number candidate index",n.DEFAULT_ERROR="Default Error",e.CustomError=class{Error_Message;Status=400;constructor(t){this.Error_Message=t}}},398:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Group=void 0;const r=n(777);class o{candidates;size;row;column;static subsets;constructor(t,e,n){this.candidates=new Array(r.SudokuEnum.ROW_LENGTH).fill(t),this.size=!0===t?r.SudokuEnum.ROW_LENGTH:0,void 0!==e&&void 0!==n&&(this.row=e,this.column=n)}contains(t){let e=(0,r.getCandidateIndex)(t);return!0===this.candidates[e]}insert(t){if(t instanceof o){let e=!1;for(let n=0;n<r.SudokuEnum.ROW_LENGTH;n++)t.contains(n)&&(this.insert(n),e=!0);return e}let e=(0,r.getCandidateIndex)(t);return!0!==this.candidates[e]&&(this.candidates[e]=!0,this.size++,!0)}remove(t){if(t instanceof o){let e=!1;for(let n=0;n<r.SudokuEnum.ROW_LENGTH;n++)t.contains(n)&&(this.remove(n),e=!0);return e}let e=(0,r.getCandidateIndex)(t);return!1!==this.candidates[e]&&(this.candidates[e]=!1,this.size--,!0)}equals(t){if(this.candidates.length!==t.candidates.length)return!1;for(let e=0;e<this.candidates.length;e++)if(this.contains(e)!==t.contains(e))return!1;return!0}intersection(t){let e=new o(!1);for(let n=0;n<r.SudokuEnum.ROW_LENGTH;n++)this.contains(n)&&t.contains(n)&&e.insert(n);return e}static union(t){let e=new o(!1);for(let n=0;n<t.length;n++)e.insert(t[n]);return e}clone(){let t=new o(!1);return t.insert(this),t}getSize(){return this.size}getRow(){return this.row}getColumn(){return this.column}static addSubsets(t,e){t===r.SudokuEnum.ROW_LENGTH?e.getSize()>0&&o.subsets[e.getSize()-1].push(e.clone()):(e.insert(t),o.addSubsets(t+1,e),e.remove(t),o.addSubsets(t+1,e))}static initializeSubsets(){o.subsets=new Array;for(let t=0;t<r.SudokuEnum.ROW_LENGTH;t++)o.subsets.push([]);o.addSubsets(0,new o(!1))}static getSubset(t){return void 0===o.subsets&&o.initializeSubsets(),o.subsets[t-1]}}e.Group=o},733:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Hint=e.SIMPLIFY_NOTES=e.NAKED_OCTUPLET=e.NAKED_SEPTUPLET=e.NAKED_SEXTUPLET=e.NAKED_QUINTUPLET=e.NAKED_QUADRUPLET=e.NAKED_TRIPLET=e.NAKED_PAIR=e.HIDDEN_SINGLE=e.NAKED_SINGLE=void 0;const r=n(777);var o,i,u,s,l,E,a,h,N,T;!function(t){t.HINT_INFO="Naked singles are when you only have one number left as a possibility in a cell",t.HINT_ACTION="When you see a naked single you can fill it in with its last remaining possibility"}(o=e.NAKED_SINGLE||(e.NAKED_SINGLE={})),function(t){t.HINT_INFO="Hidden singles are when you only have one cell left still containing a specific value in a row, column, or box",t.HINT_ACTION="When you see a hidden single you can fill it in with its unique possibility"}(i=e.HIDDEN_SINGLE||(e.HIDDEN_SINGLE={})),function(t){t.HINT_INFO="Naked pairs are when you only have the same two numbers left as a possibility in two cells in the same row, column, or box",t.HINT_ACTION="When you see a naked pair you can remove them from the notes of every other cell in the row, column, or box that they share"}(u=e.NAKED_PAIR||(e.NAKED_PAIR={})),function(t){t.HINT_INFO="Naked triplets are when you only have the same three numbers left as a possibility in three cells in the same row, column, or box",t.HINT_ACTION="When you see a naked triplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(s=e.NAKED_TRIPLET||(e.NAKED_TRIPLET={})),function(t){t.HINT_INFO="Naked quadruplets are when you only have the same four numbers left as a possibility in four cells in the same row, column, or box",t.HINT_ACTION="When you see a naked quadruplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(l=e.NAKED_QUADRUPLET||(e.NAKED_QUADRUPLET={})),function(t){t.HINT_INFO="Naked quintuplets are when you only have the same five numbers left as a possibility in five cells in the same row, column, or box",t.HINT_ACTION="When you see a naked quintuplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(E=e.NAKED_QUINTUPLET||(e.NAKED_QUINTUPLET={})),function(t){t.HINT_INFO="Naked sextuplets are when you only have the same six numbers left as a possibility in six cells in the same row, column, or box",t.HINT_ACTION="When you see a naked sextuplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(a=e.NAKED_SEXTUPLET||(e.NAKED_SEXTUPLET={})),function(t){t.HINT_INFO="Naked septuplets are when you only have the same seven numbers left as a possibility in seven cells in the same row, column, or box",t.HINT_ACTION="When you see a naked septuplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(h=e.NAKED_SEPTUPLET||(e.NAKED_SEPTUPLET={})),function(t){t.HINT_INFO="Naked octuplets are when you only have the same eight numbers left as a possibility in eight cells in the same row, column, or box",t.HINT_ACTION="When you see a naked octuplet you can remove them from the notes of every other cell in the row, column, or box that they share"}(N=e.NAKED_OCTUPLET||(e.NAKED_OCTUPLET={})),function(t){t.HINT_INFO="You can simplify notes using values already placed in cells at the start of the game",t.HINT_ACTION="When there is a value already placed in a cell than it can be removed from all other cells notes in its row, column, and box"}(T=e.SIMPLIFY_NOTES||(e.SIMPLIFY_NOTES={})),e.Hint=class{strategy;info;action;constructor(t){if(this.strategy=t,this.getStrategyType()===r.StrategyEnum.NAKED_SINGLE)this.info=o.HINT_INFO,this.action=o.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_PAIR)this.info=u.HINT_INFO,this.action=u.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_TRIPLET)this.info=s.HINT_INFO,this.action=s.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_QUADRUPLET)this.info=l.HINT_INFO,this.action=l.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_QUINTUPLET)this.info=E.HINT_INFO,this.action=E.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_SEXTUPLET)this.info=a.HINT_INFO,this.action=a.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_SEPTUPLET)this.info=h.HINT_INFO,this.action=h.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.NAKED_OCTUPLET)this.info=N.HINT_INFO,this.action=N.HINT_ACTION;else if(this.getStrategyType()===r.StrategyEnum.HIDDEN_SINGLE)this.info=i.HINT_INFO,this.action=i.HINT_ACTION;else{if(this.getStrategyType()!==r.StrategyEnum.SIMPLIFY_NOTES)throw new Error;this.info=T.HINT_INFO,this.action=T.HINT_ACTION}}getStrategyType(){return this.strategy.getStrategyType()}getDifficulty(){return this.strategy.getDifficulty()}getCause(){return this.strategy.getCause()}getEffectPlacements(){return this.strategy.getValuesToPlace()}getEffectRemovals(){return this.strategy.getNotesToRemove()}getInfo(){return this.info}getAction(){return this.action}}},677:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Solver=void 0;const r=n(826),o=n(95),i=n(207),u=n(777),s=n(733),l=n(398);e.Solver=class{board;emptyCells;solved;hint;allHints;algorithm;constructor(t,e=i.Strategy.getDefaultAlgorithm(),n){this.board=new Array,this.initializeCellArray(this.board,t.length),this.initializeBoard(t),void 0!==n&&this.setNotes(n),this.setEmptyCells(),this.solved=!1,this.algorithm=e}nextStep(){if(this.isFinished(this.emptyCells))return null;if(this.setHint(this.emptyCells),null!==this.hint)return this.applyHint(),this.allHints=void 0,this.setEmptyCells(),this.hint;throw new o.CustomError(o.CustomErrorEnum.UNSOLVABLE)}getAllHints(){return void 0===this.allHints&&this.setAllHints(),this.allHints}setAllHints(){this.allHints=new Array;for(let t=u.StrategyEnum.INVALID+1;t<u.StrategyEnum.COUNT;t++){let e=new i.Strategy(this.board,this.emptyCells);e.setStrategyType(t)&&this.allHints.push(new s.Hint(e))}}setEmptyCells(){this.emptyCells=new Array,this.initializeCellArray(this.emptyCells,u.SudokuEnum.COLUMN_LENGTH),this.addEveryEmptyCell(this.emptyCells)}isFinished(t){for(let e=0;e<t.length;e++){if(t[e].length>0)return!1;if(e===t.length-1)return this.solved=!0,!0}}setHint(t){let e=new i.Strategy(this.board,t);for(let t=0;t<this.algorithm.length;t++)if(e.setStrategyType(this.algorithm[t]))return void(this.hint=new s.Hint(e));this.hint=null}applyHint(){this.placeValues(this.hint.getEffectPlacements()),this.removeNotes(this.hint.getEffectRemovals())}getSolution(){if(!this.solved)throw new o.CustomError(o.CustomErrorEnum.NOT_SOLVED);return this.getBoard()}getBoard(){let t=new Array;for(let e=0;e<u.SudokuEnum.COLUMN_LENGTH;e++){t.push(new Array);for(let n=0;n<u.SudokuEnum.ROW_LENGTH;n++)t[e].push(this.board[e][n].getValue())}return t}getNotes(){let t=new Array,e=-1;for(let n=0;n<u.SudokuEnum.COLUMN_LENGTH;n++)for(let r=0;r<u.SudokuEnum.ROW_LENGTH;r++){t.push(new Array),e++;let o=this.board[n][r].getNotes();for(let n=0;n<u.SudokuEnum.ROW_LENGTH;n++)o.contains(n)&&t[e].push((n+1).toString())}return t}setNotes(t){let e;for(let n=0;n<u.SudokuEnum.COLUMN_LENGTH;n++)for(let r=0;r<u.SudokuEnum.ROW_LENGTH;r++){let o=new l.Group(!0);e=n*u.SudokuEnum.COLUMN_LENGTH+r;for(let n=0;n<t[e].length;n++)o.remove(t[e][n]);this.board[n][r].removeNotes(o)}}initializeCellArray(t,e){for(let n=0;n<e;n++)t.push(new Array)}initializeBoard(t){for(let e=0;e<t.length;e++)for(let n=0;n<t[e].length;n++)this.board[e].push(new r.Cell(e,n,t[e][n]))}addEveryEmptyCell(t){for(let e=0;e<u.SudokuEnum.COLUMN_LENGTH;e++)for(let n=0;n<u.SudokuEnum.ROW_LENGTH;n++)this.board[e][n].isEmpty()&&t[e].push(this.board[e][n])}placeValues(t){let e,n;for(let r=0;r<t.length;r++)e=t[r].getRow(),n=t[r].getColumn(),this.board[e][n].setValue(t[r].getValue())}removeNotes(t){let e,n;for(let r=0;r<t.length;r++)e=t[r].getRow(),n=t[r].getColumn(),this.board[e][n].removeNotes(t[r])}}},207:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Strategy=e.MAX_DIFFICULTY=void 0;const r=n(826),o=n(95),i=n(777),u=n(398);var s,l;!function(t){t[t.NAKED_SINGLE=10]="NAKED_SINGLE",t[t.HIDDEN_SINGLE=20]="HIDDEN_SINGLE",t[t.NAKED_PAIR=40]="NAKED_PAIR",t[t.NAKED_TRIPLET=60]="NAKED_TRIPLET",t[t.NAKED_QUADRUPLET=90]="NAKED_QUADRUPLET",t[t.NAKED_QUINTUPLET=140]="NAKED_QUINTUPLET",t[t.NAKED_SEXTUPLET=200]="NAKED_SEXTUPLET",t[t.NAKED_SEPTUPLET=300]="NAKED_SEPTUPLET",t[t.NAKED_OCTUPLET=450]="NAKED_OCTUPLET",t[t.SIMPLIFY_NOTES=10]="SIMPLIFY_NOTES"}(s||(s={})),function(t){t[t.NAKED_SINGLE=10]="NAKED_SINGLE",t[t.HIDDEN_SINGLE=40]="HIDDEN_SINGLE",t[t.NAKED_PAIR=60]="NAKED_PAIR",t[t.NAKED_TRIPLET=90]="NAKED_TRIPLET",t[t.NAKED_QUADRUPLET=140]="NAKED_QUADRUPLET",t[t.NAKED_QUINTUPLET=140]="NAKED_QUINTUPLET",t[t.NAKED_SEXTUPLET=200]="NAKED_SEXTUPLET",t[t.NAKED_SEPTUPLET=300]="NAKED_SEPTUPLET",t[t.NAKED_OCTUPLET=450]="NAKED_OCTUPLET",t[t.SIMPLIFY_NOTES=10]="SIMPLIFY_NOTES"}(l||(l={})),e.MAX_DIFFICULTY=function(){const t=Object.values(l);let e,n=l.SIMPLIFY_NOTES;for(let r=0;r<t.length;r++)e=Number(t[r]),Number.isNaN(e)||(n=Math.max(n,e));return n}();class E{board;cells;values;notes;strategyType;identified;difficulty;constructor(t,e){this.board=t,this.cells=e,this.identified=!1,this.values=new Array,this.notes=new Array}setStrategyType(t){return t===i.StrategyEnum.NAKED_SINGLE?this.isNakedSet(i.TupleEnum.SINGLE):t===i.StrategyEnum.NAKED_PAIR?this.isNakedSet(i.TupleEnum.PAIR):t===i.StrategyEnum.NAKED_TRIPLET?this.isNakedSet(i.TupleEnum.TRIPLET):t===i.StrategyEnum.NAKED_QUADRUPLET?this.isNakedSet(i.TupleEnum.QUADRUPLET):t===i.StrategyEnum.NAKED_QUINTUPLET?this.isNakedSet(i.TupleEnum.QUINTUPLET):t===i.StrategyEnum.NAKED_SEXTUPLET?this.isNakedSet(i.TupleEnum.SEXTUPLET):t===i.StrategyEnum.NAKED_SEPTUPLET?this.isNakedSet(i.TupleEnum.SEPTUPLET):t===i.StrategyEnum.NAKED_OCTUPLET?this.isNakedSet(i.TupleEnum.OCTUPLET):t===i.StrategyEnum.HIDDEN_SINGLE?this.isHiddenSet(i.TupleEnum.SINGLE):t===i.StrategyEnum.SIMPLIFY_NOTES&&this.isSimplifyNotes()}getCause(){return this.verifyIdentified(),this.cells}getValuesToPlace(){return this.verifyIdentified(),this.values}getNotesToRemove(){return this.verifyIdentified(),this.notes}verifyIdentified(){if(!this.identified)throw new o.CustomError(o.CustomErrorEnum.STRATEGY_NOT_IDENTIFIED)}getStrategyType(){return this.strategyType}getDifficulty(){return this.verifyIdentified(),this.difficulty}getNakedSetDifficultyLowerBound(t){return t===i.TupleEnum.SINGLE?s.NAKED_SINGLE:t===i.TupleEnum.PAIR?s.NAKED_PAIR:t===i.TupleEnum.TRIPLET?s.NAKED_TRIPLET:t===i.TupleEnum.QUADRUPLET?s.NAKED_QUADRUPLET:t===i.TupleEnum.QUINTUPLET?s.NAKED_QUINTUPLET:t===i.TupleEnum.SEXTUPLET?s.NAKED_SEXTUPLET:t===i.TupleEnum.SEPTUPLET?s.NAKED_SEPTUPLET:t===i.TupleEnum.OCTUPLET?s.NAKED_OCTUPLET:void 0}getNakedSetDifficultyUpperBound(t){return t===i.TupleEnum.SINGLE?l.NAKED_SINGLE:t===i.TupleEnum.PAIR?l.NAKED_PAIR:t===i.TupleEnum.TRIPLET?l.NAKED_TRIPLET:t===i.TupleEnum.QUADRUPLET?l.NAKED_QUADRUPLET:t===i.TupleEnum.QUINTUPLET?l.NAKED_QUINTUPLET:t===i.TupleEnum.SEXTUPLET?l.NAKED_SEXTUPLET:t===i.TupleEnum.SEPTUPLET?l.NAKED_SEPTUPLET:t===i.TupleEnum.OCTUPLET?l.NAKED_OCTUPLET:void 0}isNakedSet(t){let e=u.Group.getSubset(t),n=-1,o=-1;for(let l=0;l<i.GroupEnum.COUNT;l++)for(let E=0;E<i.SudokuEnum.ROW_LENGTH;E++){let a=(0,i.getCellsInGroup)(this.cells,l,E);for(let E=0;E<e.length;E++){let h=(0,i.getCellsSubset)(a,e[E],l),N=(0,i.getCellsInSubset)(a,h);if(N.length===t){let e=(0,i.getUnionOfSetNotes)(N);if(e.getSize()===t){if(t===i.TupleEnum.SINGLE){let t,n=N[0].getRow(),o=N[0].getColumn();for(let n=0;n<i.SudokuEnum.ROW_LENGTH;n++)e.contains(n)&&(t=(n+1).toString());return this.values.push(new r.Cell(n,o,t)),this.strategyType=i.StrategyEnum.NAKED_SINGLE,this.identified=!0,this.difficulty=s.NAKED_SINGLE,!0}for(let t=0;t<a.length;t++)if(!h.contains(t)&&a[t].getNotes().intersection(e).getSize()>0){let n=new u.Group(!1,a[t].getRow(),a[t].getColumn());n.insert(e),this.notes.push(n)}if(this.notes.length>0){let r;if(this.strategyType=i.StrategyEnum[i.StrategyEnum[t]],this.identified=!0,l===i.GroupEnum.ROW)r=N[N.length-1].getRow()-N[0].getRow(),r/=i.SudokuEnum.COLUMN_LENGTH-1;else if(l===i.GroupEnum.COLUMN)r=N[N.length-1].getColumn()-N[0].getColumn(),r/=i.SudokuEnum.ROW_LENGTH-1;else{let t=i.SudokuEnum.COLUMN_LENGTH,e=i.SudokuEnum.ROW_LENGTH,n=0,o=0;for(let r=0;r<N.length;r++)t=Math.min(t,N[r].getRow()),e=Math.min(e,N[r].getColumn()),n=Math.max(n,N[r].getRow()),o=Math.max(o,N[r].getColumn());r=n-t+(o-e),r/=2*(i.SudokuEnum.BOX_LENGTH-1)}if(this.difficulty=this.getNakedSetDifficultyLowerBound(t),this.difficulty+=Math.ceil(r*(this.getNakedSetDifficultyUpperBound(t)-this.getNakedSetDifficultyLowerBound(t))),l!==i.GroupEnum.BOX){l===i.GroupEnum.ROW?n=this.notes[0].getRow():o=this.notes[0].getColumn();let t,r=new u.Group(!1);for(let e=0;e<N.length;e++)t=N[e].getBox(),r.insert(t);if(1===r.getSize()){let r=(0,i.getCellsInGroup)(this.cells,i.GroupEnum.BOX,t);for(let t=0;t<r.length;t++)if(r[t].getRow()!==n&&r[t].getColumn()!==o&&r[t].getNotes().intersection(e).getSize()>0){let n=new u.Group(!1,r[t].getRow(),r[t].getColumn());n.insert(e),this.notes.push(n)}}}return this.identified}}}}}return this.identified}isHiddenSet(t){let e=u.Group.getSubset(t);for(let n=0;n<i.GroupEnum.COUNT;n++)for(let r=0;r<i.SudokuEnum.ROW_LENGTH;r++){let o=(0,i.getCellsInGroup)(this.cells,n,r);for(let E=0;E<e.length;E++){let a=(0,i.getCellsSubset)(o,e[E],n),h=(0,i.getCellsInSubset)(o,a);if(h.length===t){let e=new Array;for(let t=0;t<o.length;t++)!a.contains(t)&&o[t].isEmpty()&&e.push(o[t]);let E=(0,i.getUnionOfSetNotes)(e),N=(0,i.getUnionOfSetNotes)(h),T=new u.Group(!1),g=(0,i.getCellsInGroup)(this.board,n,r);for(let t=0;t<g.length;t++)g[t].isEmpty()||T.insert(g[t].getValue());if(E.remove(T),N.remove(T),N.getSize()-N.intersection(E).getSize()===t){for(let e=0;e<t;e++)if(h[e].getNotes().intersection(E).getSize()>0){let t=new u.Group(!1,h[e].getRow(),h[e].getColumn());t.insert(E),this.notes.push(t),this.identified=!0}if(this.identified){let e=0;for(let n=0;n<t;n++)e+=h[n].getNotes().getSize();let n=e/(i.SudokuEnum.ROW_LENGTH*i.SudokuEnum.ROW_LENGTH);return t===i.TupleEnum.SINGLE&&(this.strategyType=i.StrategyEnum.HIDDEN_SINGLE,this.difficulty=s.HIDDEN_SINGLE,this.difficulty+=Math.ceil(n*(l.HIDDEN_SINGLE-s.HIDDEN_SINGLE))),this.identified}}}}}return this.identified}isSimplifyNotes(){for(let t=0;t<i.SudokuEnum.COLUMN_LENGTH;t++)for(let e=0;e<this.cells[t].length;e++){let n=this.cells[t][e],o=n.getRow(),l=n.getColumn(),E=n.getBox(),a=r.Cell.getBoxRowStart(E),h=r.Cell.getBoxColumnStart(E),N=new u.Group(!1);for(let t=0;t<i.SudokuEnum.ROW_LENGTH;t++)this.board[o][t].isEmpty()||N.insert(this.board[o][t].getValue());for(let t=0;t<i.SudokuEnum.COLUMN_LENGTH;t++)this.board[t][l].isEmpty()||N.insert(this.board[t][l].getValue());for(let t=a;t<a+i.SudokuEnum.BOX_LENGTH;t++)for(let e=h;e<h+i.SudokuEnum.BOX_LENGTH;e++)this.board[t][e].isEmpty()||N.insert(this.board[t][e].getValue());if(N.intersection(n.getNotes()).getSize()>0){let t=new u.Group(!1,o,l);return t.insert(N),this.notes.push(t),this.identified=!0,this.strategyType=i.StrategyEnum.SIMPLIFY_NOTES,this.difficulty=s.SIMPLIFY_NOTES,this.identified}}return this.identified}static getRowStrategy(t,e,n){let r=(0,i.getCellsInRow)(e,n);return new E(t,r)}static getColumnStrategy(t,e,n){let r=(0,i.getCellsInColumn)(e,n);return new E(t,r)}static getBoxStrategy(t,e,n){let r=(0,i.getCellsInBox)(e,n);return new E(t,r)}static getDefaultAlgorithm(){let t=new Array;for(let e=0;e<i.StrategyEnum.COUNT;e++)t.push(e);return t}static getHighestStrategyDifficultyBound(t){let e=-1;for(let n=0;n<t.length;n++)e=Math.max(e,l[t[n]]);return e}}e.Strategy=E},777:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.getCellsInSubset=e.getCellsSubset=e.inSubset=e.getUnionOfSetNotes=e.getNextCell=e.getCellsInGroup=e.getNextCellInGroup=e.getNextCellInBox=e.getNextCellInColumn=e.getNextCellInRow=e.getCellsInBox=e.getCellsInColumn=e.getCellsInRow=e.getCandidateIndex=e.getEmptyCellBoard=e.getBoardArray=e.validateValue=e.validateColumn=e.validateRow=e.TupleEnum=e.GroupEnum=e.StrategyEnum=e.SudokuEnum=void 0;const r=n(826),o=n(95),i=n(398);var u,s,l,E;function a(t){for(let e=0;e<u.CANDIDATES.length;e++)if(t===u.CANDIDATES[e])return;if(t!==u.EMPTY_CELL)throw new o.CustomError(o.CustomErrorEnum.INVALID_VALUE)}function h(){let t=new Array;for(let e=0;e<u.COLUMN_LENGTH;e++)t.push([]);return t}function N(t,e){let n=h();for(let r=0;r<t[e].length;r++)n[e].push(t[e][r]);return n}function T(t,e){let n=h();for(let r=0;r<t.length;r++)for(let o=0;o<t[r].length;o++)t[r][o].getColumn()===e&&(n[t[r][o].getRow()].push(t[r][o]),o=t[r].length);return n}function g(t,e){let n=h();for(let r=0;r<t.length;r++)for(let o=0;o<t[r].length;o++)t[r][o].getBox()===e&&n[t[r][o].getRow()].push(t[r][o]);return n}function m(t,e,n){null!==e&&(n=e.getRow());let r=N(t,n);for(let t=0;t<r[n].length;t++)if(null===e||r[e.getRow()][t].getColumn()>e.getColumn())return r[n][t];return null}function S(t,e,n){null!==e&&(n=e.getColumn());let r=T(t,n);for(let t=0;t<r.length;t++)for(let n=0;n<r[t].length;n++)if(null===e||r[t][n].getRow()>e.getRow())return r[t][n];return null}function f(t,e,n){null!==e&&(n=e.getBox());let r=g(t,n);for(let t=0;t<r.length;t++)for(let n=0;n<r[t].length;n++)if(null===e||t>e.getRow()||t===e.getRow()&&r[t][n].getColumn()>e.getColumn())return r[t][n];return null}function d(t,e,n,r){return n===s.ROW?m(t,e,r):n===s.COLUMN?S(t,e,r):f(t,e,r)}function _(t,e,n){if(n===s.ROW)return t.contains(e.getColumn());if(n===s.COLUMN)return t.contains(e.getRow());{let n=r.Cell.getBoxRowStart(e.getBox()),o=r.Cell.getBoxColumnStart(e.getBox()),i=3*(e.getRow()-n);return i+=e.getColumn()-o,t.contains(i)}}!function(t){t[t.ROW_LENGTH=9]="ROW_LENGTH",t[t.COLUMN_LENGTH=9]="COLUMN_LENGTH",t[t.BOX_LENGTH=3]="BOX_LENGTH",t[t.BOX_COUNT=9]="BOX_COUNT",t[t.BOARD_LENGTH=81]="BOARD_LENGTH",t.EMPTY_CELL="0",t.CANDIDATES="123456789"}(u=e.SudokuEnum||(e.SudokuEnum={})),(E=e.StrategyEnum||(e.StrategyEnum={}))[E.INVALID=-1]="INVALID",E[E.NAKED_SINGLE=0]="NAKED_SINGLE",E[E.HIDDEN_SINGLE=1]="HIDDEN_SINGLE",E[E.NAKED_PAIR=2]="NAKED_PAIR",E[E.NAKED_TRIPLET=3]="NAKED_TRIPLET",E[E.NAKED_QUADRUPLET=4]="NAKED_QUADRUPLET",E[E.NAKED_QUINTUPLET=5]="NAKED_QUINTUPLET",E[E.NAKED_SEXTUPLET=6]="NAKED_SEXTUPLET",E[E.NAKED_SEPTUPLET=7]="NAKED_SEPTUPLET",E[E.NAKED_OCTUPLET=8]="NAKED_OCTUPLET",E[E.SIMPLIFY_NOTES=9]="SIMPLIFY_NOTES",E[E.COUNT=10]="COUNT",function(t){t[t.ROW=0]="ROW",t[t.COLUMN=1]="COLUMN",t[t.BOX=2]="BOX",t[t.COUNT=3]="COUNT"}(s=e.GroupEnum||(e.GroupEnum={})),(l=e.TupleEnum||(e.TupleEnum={}))[l.SINGLE=1]="SINGLE",l[l.PAIR=2]="PAIR",l[l.TRIPLET=3]="TRIPLET",l[l.QUADRUPLET=4]="QUADRUPLET",l[l.QUINTUPLET=5]="QUINTUPLET",l[l.SEXTUPLET=6]="SEXTUPLET",l[l.SEPTUPLET=7]="SEPTUPLET",l[l.OCTUPLET=8]="OCTUPLET",e.validateRow=function(t){if(t<0||t>=u.ROW_LENGTH)throw new o.CustomError(o.CustomErrorEnum.ROW_INDEX_OUT_OF_RANGE)},e.validateColumn=function(t){if(t<0||t>=u.COLUMN_LENGTH)throw new o.CustomError(o.CustomErrorEnum.COLUMN_INDEX_OUT_OF_RANGE)},e.validateValue=a,e.getBoardArray=function(t){let e=new Array;for(let n=0;n<u.COLUMN_LENGTH;n++){e.push([]);for(let r=0;r<u.ROW_LENGTH;r++)e[n].push(t[n*u.ROW_LENGTH+r])}return e},e.getEmptyCellBoard=h,e.getCandidateIndex=function(t){if("string"==typeof t)return a((Number(t)-1).toString()),Number(t)-1;if("number"==typeof t)return a((Number(t)+1).toString()),t;throw new o.CustomError(o.CustomErrorEnum.INVALID_CANDIDATE_TYPE)},e.getCellsInRow=N,e.getCellsInColumn=T,e.getCellsInBox=g,e.getNextCellInRow=m,e.getNextCellInColumn=S,e.getNextCellInBox=f,e.getNextCellInGroup=d,e.getCellsInGroup=function(t,e,n){let r=new Array,o=d(t,null,e,n);for(;null!==o;)r.push(o),o=d(t,r[r.length-1],e);return r},e.getNextCell=function(t,e){for(let n=0;n<t.length;n++)for(let r=0;r<t[n].length;r++)if(t[n][r].getRow()>e.getRow()||t[n][r].getRow()===e.getRow()&&t[n][r].getColumn()>e.getColumn())return t[n][r];return null},e.getUnionOfSetNotes=function(t){let e=new Array;for(let n=0;n<t.length;n++)e.push(t[n].getNotes());return i.Group.union(e)},e.inSubset=_,e.getCellsSubset=function(t,e,n){let r=new i.Group(!1);for(let o=0;o<t.length;o++)_(e,t[o],n)&&r.insert(o);return r},e.getCellsInSubset=function(t,e){let n=new Array;for(let r=0;r<u.ROW_LENGTH;r++)e.contains(r)&&n.push(t[r]);return n}},773:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Puzzles=void 0;const r=n(707),o=n(207);e.Puzzles=class{static async startGame(t,e,n,i){let u=o.Strategy.getHighestStrategyDifficultyBound(n),s=Math.ceil((0,r.getMaxGameDifficulty)(u)/1e3);e=Math.ceil(e*s);try{let n=await fetch(t+"api/v1/user/newGame?difficulty="+JSON.stringify(e),{method:"GET",headers:{"Content-Type":"application/json",Authorization:"Bearer "+i}});return await n.json()}catch(t){console.log(t)}}}}},e={};function n(r){var o=e[r];if(void 0!==o)return o.exports;var i=e[r]={exports:{}};return t[r](i,i.exports,n),i.exports}var r={};(()=>{var t=r;Object.defineProperty(t,"__esModule",{value:!0}),t.Puzzles=t.StrategyEnum=t.Board=void 0;var e=n(707);Object.defineProperty(t,"Board",{enumerable:!0,get:function(){return e.Board}});var o=n(777);Object.defineProperty(t,"StrategyEnum",{enumerable:!0,get:function(){return o.StrategyEnum}});var i=n(773);Object.defineProperty(t,"Puzzles",{enumerable:!0,get:function(){return i.Puzzles}})})();var o=exports;for(var i in r)o[i]=r[i];r.__esModule&&Object.defineProperty(o,"__esModule",{value:!0});