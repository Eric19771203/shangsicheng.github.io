class BoardRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = options.gridSize || 15;
        this.cellSize = options.cellSize || 40;
        this.boardSize = this.gridSize * this.cellSize;
        this.margin = options.margin || 40;
        this.stoneRadius = options.stoneRadius || 17;
        this.starRadius = options.starRadius || 5;
        this.stars = [
            [3, 3], [3, 11],
            [7, 7],
            [11, 3], [11, 11]
        ];
        this.woodPattern = null;
        this.loadWoodTexture();
    }

    loadWoodTexture() {
        // 使用SVG生成木纹纹理
        const woodImg = new window.Image();
        woodImg.src =
            "data:image/svg+xml;utf8,<svg width='200' height='200' xmlns='http://www.w3.org/2000/svg'><filter id='noise' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/><feBlend mode='overlay' in='SourceGraphic'/></filter><rect width='200' height='200' fill='%23e6c88c'/><rect width='200' height='200' filter='url(%23noise)' opacity='0.08'/></svg>";
        woodImg.onload = () => {
            const pattern = this.ctx.createPattern(woodImg, 'repeat');
            this.woodPattern = pattern;
            this.drawBoard();
        };
    }

    drawBoard() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制木纹背景
        if (this.woodPattern) {
            ctx.save();
            ctx.fillStyle = this.woodPattern;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = '#e6c88c';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
        // 绘制边框
        ctx.save();
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.strokeRect(this.margin / 2, this.margin / 2, this.boardSize + this.margin, this.boardSize + this.margin);
        ctx.restore();
        // 绘制网格线
        ctx.save();
        ctx.strokeStyle = 'rgba(139,69,19,0.7)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < this.gridSize; i++) {
            // 横线
            ctx.beginPath();
            ctx.moveTo(this.margin, this.margin + i * this.cellSize);
            ctx.lineTo(this.margin + (this.gridSize - 1) * this.cellSize, this.margin + i * this.cellSize);
            ctx.stroke();
            // 竖线
            ctx.beginPath();
            ctx.moveTo(this.margin + i * this.cellSize, this.margin);
            ctx.lineTo(this.margin + i * this.cellSize, this.margin + (this.gridSize - 1) * this.cellSize);
            ctx.stroke();
        }
        ctx.restore();
        // 绘制星位
        this.drawStars();
    }

    drawStars() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#4a3728';
        this.stars.forEach(([row, col]) => {
            ctx.beginPath();
            ctx.arc(
                this.margin + col * this.cellSize,
                this.margin + row * this.cellSize,
                this.starRadius, 0, 2 * Math.PI
            );
            ctx.fill();
        });
        ctx.restore();
    }

    drawStone(row, col, color, highlight = false) {
        const ctx = this.ctx;
        const x = this.margin + col * this.cellSize;
        const y = this.margin + row * this.cellSize;
        ctx.save();
        // 阴影
        ctx.shadowColor = color === 'black' ? '#333' : '#aaa';
        ctx.shadowBlur = highlight ? 24 : 12;
        ctx.shadowOffsetY = 2;
        // 棋子
        ctx.beginPath();
        ctx.arc(x, y, this.stoneRadius, 0, 2 * Math.PI);
        ctx.closePath();
        const grad = ctx.createRadialGradient(x, y, 4, x, y, this.stoneRadius);
        if (color === 'black') {
            grad.addColorStop(0, '#666');
            grad.addColorStop(0.5, '#222');
            grad.addColorStop(1, '#000');
        } else {
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, '#eee');
            grad.addColorStop(1, '#bbb');
        }
        ctx.fillStyle = grad;
        ctx.fill();
        // 高亮描边
        if (highlight) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#FFD700';
            ctx.stroke();
        }
        ctx.restore();
    }

    clearBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBoard();
    }

    drawAllStones(stones, highlights = []) {
        for (let i = 0; i < stones.length; i++) {
            for (let j = 0; j < stones[i].length; j++) {
                if (stones[i][j]) {
                    const isHighlight = highlights.some(pos => pos.row === i && pos.col === j);
                    this.drawStone(i, j, stones[i][j], isHighlight);
                }
            }
        }
    }

    getCellFromCoords(x, y) {
        // 将canvas坐标转换为棋盘行列
        const col = Math.round((x - this.margin) / this.cellSize);
        const row = Math.round((y - this.margin) / this.cellSize);
        if (
            row >= 0 && row < this.gridSize &&
            col >= 0 && col < this.gridSize
        ) {
            return { row, col };
        }
        return null;
    }
}

export default BoardRenderer; 