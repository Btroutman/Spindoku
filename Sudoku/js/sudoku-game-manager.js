import { sudokuGameActions, sudokuHints } from './sudoku-game-actions.js';
import { sudokuGameTimerAndRotator, sudokuBoard } from './sudoku-game-board.js';
import { GameData } from './sudoku-game-data.js';
export const PuzzleData = {
    difficultyLevels: ["easy", "medium", "hard"],
    easyPuzzleArray: null,
    mediumPuzzleArray: null,
    hardPuzzleArray: null,

    async loadPuzzleModule(difficulty) {
        const modulePath = `../puzzle-modules/${difficulty}-puzzles.js`;
        try {
            const module = await import(modulePath);
            this[`${difficulty}PuzzleArray`] = module.default;
            console.log(`Imported ${difficulty} puzzles`);
            return module.default;
        } catch (error) {
            console.error(`Failed to load ${difficulty} puzzles:`, error);
            return null;
        }
    },

    async importGames(initialDifficultySelection) {
        const primaryPuzzles = await this.loadPuzzleModule(initialDifficultySelection);
        if (!primaryPuzzles) return null;

        const otherDifficulties = this.difficultyLevels.filter(
            (level) => level !== initialDifficultySelection
        );

        Promise.allSettled(otherDifficulties.map((difficulty) => this.loadPuzzleModule(difficulty)))
            .then((results) => {
                results.forEach((result, index) => {
                    if (result.status === "rejected") {
                        console.error(`Background load failed for ${otherDifficulties[index]}`);
                    }
                });
            });

        return primaryPuzzles;
    }
};

export async function beginNewGame({ difficulty = null, restart = false } = {}) {
    if (!restart) {
        if (!PuzzleData.difficultyLevels.includes(difficulty)) {
            throw new Error("Invalid difficulty selection");
        }
        let puzzleArray = PuzzleData[`${difficulty}PuzzleArray`] ?? await PuzzleData.importGames(difficulty);
        if (!puzzleArray || puzzleArray.length === 0) {
            throw new Error(`Failed to load puzzles for difficulty: ${difficulty}`);
        }
        GameData.currentGame = new GameData(difficulty, puzzleArray);
    }
    populateBoard();
    refreshBoardStatus();
}

export function refreshBoardStatus() {
    console.log('Refresh Board Status');
    sudokuGameActions.actionHistory.splice(0);
    sudokuHints.hintsRemaining = 3;
    sudokuGameTimerAndRotator.startTimer({ resetTimer: true });
}

export function populateBoard() {
    const cellInternals = `<div class='solution'></div><div class='candidates'>${"<div></div>".repeat(9)}</div>`;
    GameData.currentGame.puzzle.forEach((value, index) => {
        const cell = sudokuBoard.cells[index];
        cell.classList.remove("prefilled", "active", "hint");
        cell.innerHTML = value > 0 ? `<div class='solution'>${value}</div>` : cellInternals;
        if (value) cell.classList.add("prefilled");
    });
    sudokuBoard.selectFirstAvailableCell();
}
