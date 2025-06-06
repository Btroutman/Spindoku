import { attachClickEvent } from './game-functions.js';
import { beginNewGame } from './sudoku-game-manager.js';
import { sudokuGameTimerAndRotator } from './sudoku-game-board.js';

export const sudokuModalScreen = {
    gameDialog: document.getElementById("game-dialog"),
    containers: {
        settings: document.getElementById("select-settings-container"),
        difficulty: document.getElementById("select-difficulty-container"),
        options: document.getElementById("select-options-container"),
        winning: document.getElementById("winning-game-container"),
    },
    difficultyContent: document.getElementById("select-difficulty-content"),
    loadingIndicator: document.getElementById("select-difficulty-loading"),

    showGameModal({ modalType } = {}) {
        Object.values(this.containers).forEach(c => (c.style.display = "none"));
        if (this.containers[modalType]) this.containers[modalType].style.display = "block";

        if (modalType === "difficulty") {
            this.difficultyContent.style.display = "block";
            this.loadingIndicator.style.display = "none";
        }

        this.gameDialog.showModal();
        sudokuGameTimerAndRotator.togglePause({ forcePause: true });
    },

    init() {
/* ==============================================================
 * 1)  Central “click map”  →  [ selector , click‑handler ]
 * ==============================================================*/
const clickMap = [
  [
    ".close-modal-button",
    () => { this.gameDialog.close(); }
  ],
  [
    ".new-game-button",
    () => this.showGameModal({ modalType: "difficulty" })
  ],
  [
    ".restart-game-button",
    async () => {
      await beginNewGame({ restart: true });
      this.gameDialog.close();
    }
  ],
  [
    /* NEW: starts a game at a chosen difficulty */
    ".difficulty-button",
    async (evt) => {
      const btn = evt.currentTarget;                 // the clicked button
      this.loadingIndicator.style.display = "block";
      this.difficultyContent.style.display = "none";
      await beginNewGame({ difficulty: btn.dataset.difficulty });
      document.body.classList.remove("preload");
      this.gameDialog.close();
    }
  ],
  [
    "#game-settings-icon",
    () => this.showGameModal({ modalType: "settings" })
  ],
  [
    "#game-settings-button",
    () => this.showGameModal({ modalType: "options" })
  ]
];

/* ==============================================================
 * 2)  Attach every handler in one pass
 * ==============================================================*/
clickMap.forEach(([selector, handler]) => {
  document.querySelectorAll(selector).forEach(el =>
    attachClickEvent(el, handler)
  );
});



        this.gameDialog.addEventListener("close", () => {
            sudokuGameTimerAndRotator.togglePause({ forceResume: true });
        });
    },

    closeModalDialog() {
        this.gameDialog.close();
    }
}
