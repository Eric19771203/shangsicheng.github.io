import BoardRenderer from './BoardRenderer.js';

class GomokuPractice {
    constructor() {
        this.canvas = document.getElementById('board-canvas');
        this.boardRenderer = new BoardRenderer(this.canvas, {
            gridSize: 15,
            cellSize: 40,
            margin: 40
        });
        this.currentPlayer = 'black';
        this.gameBoard = Array(15).fill().map(() => Array(15).fill(null));
        this.isGameOver = false;
        this.winMessage = document.getElementById('win-message');
        this.init();
    }

    init() {
        this.boardRenderer.drawBoard();
        this.addEventListeners();
    }

    addEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.isGameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cell = this.boardRenderer.getCellFromCoords(x, y);
            if (!cell) return;
            const { row, col } = cell;
            if (this.gameBoard[row][col]) return;
            this.makeMove(row, col);
        });
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    makeMove(row, col) {
        this.gameBoard[row][col] = this.currentPlayer;
        this.boardRenderer.clearBoard();
        this.boardRenderer.drawAllStones(this.gameBoard);
        if (this.checkWin(row, col)) {
            const winner = this.currentPlayer === 'black' ? '黑子' : '白子';
            this.winMessage.textContent = `${winner}获胜！`;
            this.winMessage.classList.add('show');
            this.isGameOver = true;
            return;
        }
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        document.getElementById('current-player').textContent =
            this.currentPlayer === 'black' ? '黑子' : '白子';
    }

    checkWin(row, col) {
        const directions = [
            [[0, 1], [0, -1]],  // 水平
            [[1, 0], [-1, 0]],  // 垂直
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]]  // 反对角线
        ];
        return directions.some(direction => {
            const count = 1 +
                this.countStones(row, col, direction[0][0], direction[0][1]) +
                this.countStones(row, col, direction[1][0], direction[1][1]);
            return count >= 5;
        });
    }

    countStones(row, col, deltaRow, deltaCol) {
        let count = 0;
        let currentRow = row + deltaRow;
        let currentCol = col + deltaCol;
        while (
            currentRow >= 0 && currentRow < 15 &&
            currentCol >= 0 && currentCol < 15 &&
            this.gameBoard[currentRow][currentCol] === this.currentPlayer
        ) {
            count++;
            currentRow += deltaRow;
            currentCol += deltaCol;
        }
        return count;
    }

    resetGame() {
        this.gameBoard = Array(15).fill().map(() => Array(15).fill(null));
        this.currentPlayer = 'black';
        this.isGameOver = false;
        document.getElementById('current-player').textContent = '黑子';
        this.winMessage.textContent = '';
        this.winMessage.classList.remove('show');
        this.boardRenderer.clearBoard();
    }
}

window.onload = function() {
    new GomokuPractice();
};