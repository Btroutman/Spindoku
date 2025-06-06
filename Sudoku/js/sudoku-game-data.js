
export class GameData {
    static currentGame;

    constructor(difficulty, puzzleArray) {
        this.difficulty = difficulty;
        this.puzzle = null;
        this.solution = null;
        this.selectedPuzzle = this.getRandomPuzzle(puzzleArray);
        this.randomizeSudokuNumbers(this.selectedPuzzle);
    }

    getRandomPuzzle(puzzleArray) {
        console.log("Selecting puzzle");
        return puzzleArray[Math.floor(Math.random() * puzzleArray.length)];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    randomizeSudokuNumbers(sudokuObject) {
        const { puzzle, solution } = sudokuObject;
        const numberMap = {};
        const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(availableNumbers);

        availableNumbers.forEach((newNum, index) => {
            numberMap[index + 1] = newNum;
        });

        console.log("Number map:", numberMap);

        this.puzzle = puzzle.map(num => (num !== 0 ? numberMap[num] : 0));
        this.solution = solution.map(num => numberMap[num]);

        console.log("Randomized puzzle:", this.puzzle);
        console.log("Randomized solution:", this.solution);
    }
}
