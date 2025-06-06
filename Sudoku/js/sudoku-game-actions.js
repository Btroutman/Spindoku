  import { attachClickEvent } from './game-functions.js';
  import { sudokuBoard, sudokuGameTimerAndRotator } from './sudoku-game-board.js';
  import { GameData } from './sudoku-game-data.js';
  import {sudokuGameSettings} from './sudoku-game-settings.js';
  import { sudokuModalScreen } from './sudoku-modal-screen.js';
 
 export class GameAction{
  constructor({cell=sudokuBoard.selectedCell,solution=sudokuBoard.selectedCell.querySelector(".solution"),candidates=Array.from(sudokuBoard.selectedCell.querySelector(".candidates").children)}={}){
    this.cellElement=cell;
    this.cellIndex= { row: cell.dataset.row, column: cell.dataset.column };
    this.previousValue="";
    this.solution=solution;
    this.candidates=candidates;
    this.determineCellContents();
  }
  determineCellContents(){
this.previousValue = this.solution.textContent || this.candidates.map(c => c.textContent || "");
  }  
 }

export const sudokuGameActions = {
    mutatingMethods: new Set(["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "copyWithin", "fill"]),

    actionHistory: new Proxy([], {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function' && sudokuGameActions.mutatingMethods.has(prop)) {
                return (...args) => {
                    const oldLength = target.length;
                    const result = value.apply(target, args);
                    if (target.length !== oldLength) {
                        sudokuGameActions.updateUndoIconState();
                    }
                    return result;
                };
            }
            return value;
        }
    }),

    setSolutionText(cell, value) {
        const solution = cell.querySelector(".solution");
        solution.textContent = value || "";
    },

    setCandidateValues(cell, valuesArray) {
        const candidates = cell.querySelector(".candidates");
        Array.from(candidates.children).forEach((c, i) => {
            c.textContent = valuesArray[i] || "";
        });
    },

    handleNumberInput(number) {
        const cell = sudokuBoard.selectedCell;
        if (!cell || cell.classList.contains("prefilled")) return;

        const solution = cell.querySelector(".solution");
        const candidates = Array.from(cell.querySelector(".candidates").children);

        // Create GameAction before cell value changes and add it to the array
        this.actionHistory.push(new GameAction({ cell, solution, candidates }));

        if (number === 0) {
            this.setCandidateValues(cell, []);
            this.setSolutionText(cell, "");
        } else if (document.getElementById("candidates-checkbox").checked) {
            const candidate = candidates[number - 1];
            candidate.textContent = candidate.textContent ? "" : number;
            this.setSolutionText(cell, "");
        } else {
            const isSame = solution.textContent === String(number);
            this.setSolutionText(cell, isSame ? "" : number);
            this.setCandidateValues(cell, []);
        }
    },

    undoLastAction() {
        const lastAction = this.actionHistory.pop();
        if (!lastAction) return;

        const { cellElement, previousValue } = lastAction;

        if (Array.isArray(previousValue)) {
            this.setCandidateValues(cellElement, previousValue);
            this.setSolutionText(cellElement, "");
        } else {
            this.setSolutionText(cellElement, previousValue);
            this.setCandidateValues(cellElement, []);
        }
    },

    removeActionsForCell(cellRow, cellColumn) {
        for (let i = this.actionHistory.length - 1; i >= 0; i--) {
            const { row, column } = this.actionHistory[i].cellIndex;
            if (row == cellRow && column == cellColumn) {
                this.actionHistory.splice(i, 1);
            }
        }
    },

    updateUndoIconState() {
        const undoIcon = document.getElementById("game-undo-icon");
        undoIcon?.classList.toggle("disabled-icon", this.actionHistory.length === 0);
    },

    init() {
        document.querySelectorAll(".number-divs div").forEach(div => {
            div.addEventListener("click", () => this.handleNumberInput(parseInt(div.dataset.value, 10)));
        });
        attachClickEvent("game-undo-icon", () => this.undoLastAction());
        attachClickEvent("cell-reset-icon", () => {
            if (sudokuBoard.selectedCell) this.handleNumberInput(0);
        });
    }
};




export const sudokuHints = {
    _hintsRemaining: 3, // internal backing value

    get hintsRemaining() {
        return this._hintsRemaining;
    },

    set hintsRemaining(value) {
        this._hintsRemaining = value;

        // Update UI when value changes
        this.hintIconCounter.textContent = value;
        this.hintIcon.classList.toggle("disabled-icon", value === 0);
    },

    hintIcon: document.getElementById("game-hint-icon"),
    hintIconCounter: document.getElementById("game-hint-icon-counter"),

    getHint() {
        if (this.hintsRemaining === 0) return;

        const emptyCells = sudokuBoard.cells.filter(cell =>
            !cell.querySelector(".solution")?.textContent.trim() &&
            !Array.from(cell.querySelector(".candidates")?.children || []).some(child => child.textContent.trim())
        );

        if (emptyCells.length === 0) return;

        const hintCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const row = parseInt(hintCell.dataset.row, 10);
        const col = parseInt(hintCell.dataset.column, 10);
        const correctValue = GameData.currentGame.solution[(row * 9) + col];

        hintCell.querySelector(".solution").textContent = correctValue;
        hintCell.classList.add("prefilled", "hint");
        sudokuGameActions.removeActionsForCell(row, col);
        this.hintsRemaining--;
    },
     init() {
        attachClickEvent(this.hintIcon, () => this.getHint());
    },
};


export const sudokuMutationObserver = {
   observer: null,


validateSolution() {

if(sudokuGameSettings.solutionValidation=="none"){return false;}

        sudokuBoard.cells.forEach(cell => {
            const solutionDiv = cell.querySelector(".solution");
            const value = parseInt(solutionDiv?.textContent);
            let hasError;

            if (!value) {
                solutionDiv?.classList.remove('invalidSolution');
                return;
            }
            if(sudokuGameSettings.solutionValidation=="violatesRule"){

            const groups = [
                sudokuBoard.rows[cell.dataset.row],
                sudokuBoard.columns[cell.dataset.column],
                sudokuBoard.boxes[cell.dataset.box]
            ];

            hasError = groups.some(group =>
                group.some(c => c !== cell && parseInt(c.querySelector(".solution")?.textContent) === value)
            );
}
else if(sudokuGameSettings.solutionValidation=="wrongSolution"){
  const expectedValue = GameData.currentGame.solution[(cell.dataset.row * 9) + parseInt(cell.dataset.column)];
  hasError=Boolean(value != expectedValue); 
}

            solutionDiv.classList.toggle('invalidSolution', hasError);
        });
    },



checkCompletedPuzzle() {
    return sudokuBoard.cells.every(cell => {
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.column, 10);
        const expectedValue = GameData.currentGame.solution[(row * 9) + col];

        const solutionDiv = cell.querySelector(".solution");
        const currentValue = parseInt(solutionDiv?.textContent, 10);

        return currentValue === expectedValue;
    });
},

   handleMutations(mutationList) {
 sudokuGameTimerAndRotator.togglePause({forceResume:true});     
      if (mutationList.length > 10) return false;     
if (!document.querySelector(".solution:empty")&& this.checkCompletedPuzzle()) {
document.getElementById("winning-difficulty").textContent=GameData.currentGame.difficulty;
document.getElementById("winning-time").textContent=document.getElementById("game-timer").textContent;
document.getElementById("winning-hints").textContent=sudokuHints.hintsRemaining;
sudokuModalScreen.showGameModal({modalType : "winning"});
}
else if(mutationList.some(record =>record.target?.classList?.contains("solution"))){this.validateSolution();}
},

   init() {
      this.observer = new MutationObserver(this.handleMutations.bind(this));

      this.observer.observe(document.getElementById('sudoku-board'), {
         subtree: true,
         childList: true,
         characterData: true
      });
      document.getElementById('game-validation-selection').addEventListener('change', function(event) {

    sudokuGameSettings.solutionValidation=event.target.value;
    document.getElementById("sudoku-board").querySelectorAll('.invalidSolution').forEach(cell => cell.classList.remove("invalidSolution"));
    sudokuMutationObserver.validateSolution();
});

   },
   disconnect() {
      if (this.observer) {
         this.observer.disconnect();
         console.log("🛑 Sudoku MutationObserver disconnected");
      }
   }
};
