 import { sudokuGameSettings } from './sudoku-game-settings.js';
 export const sudokuBoard = {
    board: document.getElementById("sudoku-board"),
    selectedCell: null,
    cells: [],
    rows: Array.from({ length: 9 }, () => []),
    columns: Array.from({ length: 9 }, () => []),
    boxes: Array.from({ length: 9 }, () => []),


    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove("active");
        }
        this.selectedCell = cell;
        this.selectedCell.classList.add("active");
    },

    selectFirstAvailableCell() {
        const firstPlayableCell = this.board.querySelector('.cell:not(.prefilled)');
        if (firstPlayableCell) {
            this.selectCell(firstPlayableCell);
        } else if (this.selectedCell) {
            //Removes the active cell border in case the only playable cell becomes unplayable by the inclusion of a hint
            this.selectedCell.classList.remove("active");
        }
    },

    createCells() {
        const fragment = document.createDocumentFragment();
        this.cells = [];
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            const row = Math.floor(i / 9);
            const col = i % 9;
            const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
            cell.dataset.row = row;
            cell.dataset.column = col;
            cell.dataset.box = box;
            this.cells.push(cell);
            this.rows[row].push(cell);
            this.columns[col].push(cell);
            this.boxes[box].push(cell);
            fragment.appendChild(cell);
        }
        this.board.appendChild(fragment);

    },

    init() {
        this.createCells();
        this.board.addEventListener("click", (event) => {
            const cell = event.target.closest(".cell:not(.prefilled)");
            if (cell && this.board.contains(cell)) {
                this.selectCell(cell);
            }
        });

    }
};

export const sudokuGameTimerAndRotator = {
    timerElement: document.getElementById("game-timer"),
    _boardRotation: 0,
    timer: 0,
    rotationInterval: null,
    timerInterval: null,
    isPaused: false,

    get boardRotation() {
        return this._boardRotation;
    },

    set boardRotation(value) {
        this._boardRotation = value;
        this.rotateBoard();
    },

    startTimer({ resetTimer = false } = {}) {
        if (resetTimer) {
            this.timer = 0;
            this.updateTimerDisplay();
            this.boardRotation = 0;
        }
        clearInterval(this.timerInterval);
        clearInterval(this.rotationInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateTimerDisplay();
            }
        }, 1000);
        this.rotationInterval = setInterval(() => {
            if (!this.isPaused) {
                this.boardRotation += 90;
            }
        }, sudokuGameSettings.rotationRate);
    },

    updateTimerDisplay() {
        const hours = Math.floor(this.timer / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((this.timer % 3600) / 60).toString().padStart(2, "0");
        const seconds = (this.timer % 60).toString().padStart(2, "0");
        this.timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    },

    rotateBoard() {
        const board = sudokuBoard.board;
        const cellInternals = board.querySelectorAll(".cell .solution, .cell .candidates");
        const shouldAnimate = this.boardRotation !== 0;

        board.style.transition = shouldAnimate ? "transform 0.5s ease-in-out" : "none";
        board.style.transform = `rotate(${this.boardRotation}deg)`;

        cellInternals.forEach((cell) => {
            cell.style.transition = shouldAnimate ? "transform 0.5s ease-in-out" : "none";
            cell.style.transform = `rotate(${-this.boardRotation}deg)`;
        });
    },

    togglePause({ forcePause = false, forceResume = false } = {}) {
        this.isPaused = forcePause || (!forceResume && !this.isPaused);
        document.getElementById("game-pause-icon")?.classList.toggle("active-icon", this.isPaused);

        if (this.isPaused) {
            clearInterval(this.rotationInterval);
            clearInterval(this.timerInterval);
        } else {
            this.startTimer();
        }
    },

    init() {
        document.getElementById("game-pause-icon").addEventListener("click", () => this.togglePause());
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.togglePause({ forcePause: true });
            }
        });
    }
};
