import { sudokuBoard, sudokuGameTimerAndRotator } from './sudoku-game-board.js';
import { sudokuGameActions, sudokuHints, sudokuMutationObserver } from './sudoku-game-actions.js';
//import { sudokuGameActions, sudokuHints} from './sudoku-game-actions.js';
import { sudokuModalScreen } from './sudoku-modal-screen.js';
import { sudokuGameSettings } from './sudoku-game-settings.js';

export function initializeSudoku() {
    sudokuBoard.init();
    sudokuModalScreen.init();
    sudokuModalScreen.showGameModal({ modalType: "difficulty" });
    sudokuGameActions.init();
    sudokuHints.init();
    sudokuGameTimerAndRotator.init();
    sudokuGameSettings.init();
    sudokuMutationObserver.init();
}
