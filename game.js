import BoardRenderer from './BoardRenderer.js';

class SoundGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 生成落子音效
    playPlaceSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 生成胜利音效
    playWinSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 创建上升的音阶
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = 0.15;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        
        frequencies.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * duration);
        });
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + frequencies.length * duration);
    }

    // 生成按钮点击音效
    playButtonSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
}

class OnlineGomoku {
    constructor() {
        this.board = document.getElementById('board');
        this.gameInfo = document.getElementById('game-info');
        this.playerTurn = document.getElementById('player-turn');
        this.restartBtn = document.getElementById('restart-btn');
        this.waitingMessage = document.getElementById('waiting-message');
        this.gameStatus = document.getElementById('game-status');
        
        this.gridSize = 15;
        this.cellSize = 40;
        this.stones = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.isAIMode = false;
        this.aiName = '';
        this.aiColor = 'white';
        this.aiDifficulty = 'normal';
        this.aiThinkTime = 500;

        // 初始化音效生成器
        this.soundGenerator = new SoundGenerator();
        
        // 添加复盘相关属性
        this.moveHistory = [];
        this.isReplaying = false;
        this.replayIndex = 0;
        
        // 替换棋盘为Canvas
        this.canvas = document.getElementById('board-canvas');
        this.boardRenderer = new BoardRenderer(this.canvas, {
            gridSize: 15,
            cellSize: 40,
            margin: 40
        });
        
        this.init();
    }
    
    init() {
        // 检查是否是AI模式
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'ai') {
            this.isAIMode = true;
            this.aiName = urlParams.get('aiName') || '棋圣';
            this.setAIDifficulty();
            this.initAIGame();
        } else {
            this.initOnlineGame();
        }
        
        this.createGrid();
        this.displayUserInfo();
        this.addEventListeners();
    }
    
    initAIGame() {
        // 隐藏等待消息
        this.waitingMessage.style.display = 'none';
        
        // 显示AI信息
        const aiInfo = document.createElement('div');
        aiInfo.className = 'player-status';
        aiInfo.innerHTML = `
            <div class="player-avatar">${this.aiName.charAt(0)}</div>
            <div class="player-name">${this.aiName}</div>
        `;
        this.gameStatus.appendChild(aiInfo);
        
        // 设置AI为白方
        this.aiColor = 'white';
    }
    
    setAIDifficulty() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        
        const stats = currentUser.gameStats;
        const totalGames = stats.wins + stats.losses + stats.draws;
        
        if (totalGames === 0) {
            this.aiDifficulty = 'normal';
            this.aiThinkTime = 500;
        } else {
            const winRate = stats.wins / totalGames;
            
            if (winRate > 0.7) {
                this.aiDifficulty = 'hard';
                this.aiThinkTime = 300;
            } else if (winRate < 0.3) {
                this.aiDifficulty = 'easy';
                this.aiThinkTime = 800;
            } else {
                this.aiDifficulty = 'normal';
                this.aiThinkTime = 500;
            }
        }
        
        const difficultyNames = {
            'easy': ['棋童', '棋手', '棋士'],
            'normal': ['棋王', '棋仙', '棋圣'],
            'hard': ['棋神', '棋魔', '棋尊']
        };
        
        if (!this.aiName || !difficultyNames[this.aiDifficulty].includes(this.aiName)) {
            this.aiName = difficultyNames[this.aiDifficulty][
                Math.floor(Math.random() * difficultyNames[this.aiDifficulty].length)
            ];
        }
    }
    
    makeAIMove() {
        if (this.gameOver || this.currentPlayer !== this.aiColor) return;
        
        let bestMove = null;
        
        switch (this.aiDifficulty) {
            case 'easy':
                bestMove = this.getEasyMove();
                break;
            case 'normal':
                bestMove = this.getNormalMove();
                break;
            case 'hard':
                bestMove = this.getHardMove();
                break;
        }
        
        if (bestMove) {
            setTimeout(() => {
                this.placeStone(bestMove.row, bestMove.col);
            }, this.aiThinkTime);
        }
    }
    
    getEasyMove() {
        const emptySpots = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.stones[i][j]) {
                    emptySpots.push({ row: i, col: j });
                }
            }
        }
        return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }
    
    getNormalMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.stones[i][j]) {
                    const score = this.evaluateMove(i, j);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    getHardMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.stones[i][j]) {
                    const score = this.evaluateMoveHard(i, j);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, col: j };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    evaluateMoveHard(row, col) {
        // 首先评估防守价值
        const defenseScore = this.evaluateDefense(row, col);
        
        // 如果存在必胜棋型威胁，直接返回防守分数
        if (defenseScore >= 1000000) {
            return defenseScore;
        }
        
        // 评估进攻价值
        const attackScore = this.evaluateAttack(row, col);
        
        // 如果存在必胜棋型，直接返回进攻分数
        if (attackScore >= 1000000) {
            return attackScore;
        }
        
        // 综合考虑进攻和防守
        let score = Math.max(defenseScore, attackScore);
        
        // 考虑棋盘位置
        const positionScore = this.evaluatePosition(row, col);
        score += positionScore;
        
        return score;
    }
    
    checkSpecialPatterns(row, col) {
        let score = 0;
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            if (this.checkDoubleThree(row, col, dx, dy)) {
                score += 8000;
            }
            
            if (this.checkTripleThree(row, col, dx, dy)) {
                score += 15000;
            }
            
            if (this.checkLiveFour(row, col, dx, dy)) {
                score += 100000;
            }
        }
        
        return score;
    }
    
    checkDoubleThree(row, col, dx, dy) {
        const patterns = [
            '0110110', '0111010', '0101110'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkTripleThree(row, col, dx, dy) {
        const patterns = [
            '011010110', '011011010', '010110110'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkLiveFour(row, col, dx, dy) {
        const patterns = [
            '011110', '11011', '11101'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    matchPattern(row, col, dx, dy, pattern) {
        const length = pattern.length;
        const start = -Math.floor(length / 2);
        
        for (let i = 0; i < length; i++) {
            const newRow = row + dx * (start + i);
            const newCol = col + dy * (start + i);
            
            if (!this.isValidPosition(newRow, newCol)) {
                return false;
            }
            
            const stone = this.stones[newRow][newCol];
            if (pattern[i] === '1' && stone !== this.aiColor) return false;
            if (pattern[i] === '0' && stone !== null) return false;
            if (pattern[i] === '2' && stone === this.aiColor) return false;
        }
        
        return true;
    }
    
    evaluateDefense(row, col) {
        let score = 0;
        const opponentColor = this.aiColor === 'white' ? 'black' : 'white';
        
        // 临时放置对手的棋子
        this.stones[row][col] = opponentColor;
        
        // 检查对手的威胁
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        // 检查每个方向
        for (const [dx, dy] of directions) {
            // 检查必胜棋型威胁
            if (this.checkLiveFour(row, col, dx, dy) ||
                this.checkJumpLiveFour(row, col, dx, dy) ||
                this.checkDoubleThree(row, col, dx, dy) ||
                this.checkTripleThree(row, col, dx, dy)) {
                // 如果发现必胜棋型，直接返回最高分数
                this.stones[row][col] = null;
                return 1000000;
            }
            // 检查次优进攻棋型
            else if (this.checkLiveThree(row, col, dx, dy)) {
                score += 50000; // 活三威胁，优先防守
            }
            else if (this.checkSleepThree(row, col, dx, dy)) {
                score += 20000; // 眠三威胁，考虑防守
            }
        }
        
        // 恢复棋盘状态
        this.stones[row][col] = null;
        
        return score;
    }
    
    // 新增：检查跳活四
    checkJumpLiveFour(row, col, dx, dy) {
        const patterns = [
            '11011', '11101', '10111', '11110'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    // 新增：检查眠三
    checkSleepThree(row, col, dx, dy) {
        const patterns = [
            '001112', '211100', '010112', '211010'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkCombinationPatterns(row, col) {
        let score = 0;
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            if (this.checkFourThree(row, col, dx, dy)) {
                score += 180000;
            }
            
            if (this.checkFiveThree(row, col, dx, dy)) {
                score += 200000;
            }
            
            if (this.checkLiveFourCombination(row, col, dx, dy)) {
                score += 250000;
            }
        }
        
        return score;
    }
    
    checkFourThree(row, col, dx, dy) {
        const patterns = [
            '0110110110', '0110101110', '0110111010'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkFiveThree(row, col, dx, dy) {
        const patterns = [
            '011011010110', '011010110110', '011011011010'
        ];
        
        for (const pattern of patterns) {
            if (this.matchPattern(row, col, dx, dy, pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkLiveFourCombination(row, col, dx, dy) {
        let liveFourCount = 0;
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        for (const [dirX, dirY] of directions) {
            if (this.checkLiveFour(row, col, dirX, dirY)) {
                liveFourCount++;
            }
        }
        
        return liveFourCount >= 2;
    }
    
    evaluatePosition(row, col) {
        const center = this.gridSize / 2;
        const distanceFromCenter = Math.sqrt(
            Math.pow(row - center, 2) + Math.pow(col - center, 2)
        );
        
        return Math.max(0, 100 - distanceFromCenter * 10);
    }
    
    // 检查位置是否有效
    isValidPosition(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }
    
    // 修改：检查胜利
    checkWin(row, col) {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        let winInfo = null;
        
        for (const [dx, dy] of directions) {
            // 检查活四
            if (this.checkLiveFour(row, col, dx, dy)) {
                winInfo = {
                    type: '活四',
                    direction: this.getDirectionName(dx, dy),
                    positions: this.getWinningPositions(row, col, dx, dy, 5)
                };
                return winInfo;
            }
            // 检查跳活四
            if (this.checkJumpLiveFour(row, col, dx, dy)) {
                winInfo = {
                    type: '跳活四',
                    direction: this.getDirectionName(dx, dy),
                    positions: this.getWinningPositions(row, col, dx, dy, 5)
                };
                return winInfo;
            }
            // 检查双活三
            if (this.checkDoubleThree(row, col, dx, dy)) {
                winInfo = {
                    type: '双活三',
                    direction: this.getDirectionName(dx, dy),
                    positions: this.getWinningPositions(row, col, dx, dy, 7)
                };
                return winInfo;
            }
            // 检查三活三
            if (this.checkTripleThree(row, col, dx, dy)) {
                winInfo = {
                    type: '三活三',
                    direction: this.getDirectionName(dx, dy),
                    positions: this.getWinningPositions(row, col, dx, dy, 9)
                };
                return winInfo;
            }
        }
        
        return null;
    }
    
    getDirectionName(dx, dy) {
        if (dx === 1 && dy === 0) return '横向';
        if (dx === 0 && dy === 1) return '纵向';
        if (dx === 1 && dy === 1) return '右下斜向';
        if (dx === 1 && dy === -1) return '右上斜向';
        return '';
    }

    getWinningPositions(row, col, dx, dy, length) {
        const positions = [];
        const start = -Math.floor(length / 2);
        
        for (let i = 0; i < length; i++) {
            const newRow = row + dx * (start + i);
            const newCol = col + dy * (start + i);
            if (this.isValidPosition(newRow, newCol)) {
                positions.push({ row: newRow, col: newCol });
            }
        }
        
        return positions;
    }

    showWinMessage(winInfo) {
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';
        
        // 创建胜利信息内容
        const content = document.createElement('div');
        content.className = 'win-content';
        content.innerHTML = `
            <h2>${this.currentPlayer === 'black' ? '黑' : '白'}方胜利！</h2>
            <p>胜利原因：${winInfo.type}</p>
            <p>方向：${winInfo.direction}</p>
            <div class="win-buttons">
                <button id="replay-btn">复盘</button>
                <button id="restart-btn">重新开始</button>
            </div>
        `;
        
        winMessage.appendChild(content);
        document.body.appendChild(winMessage);
        
        // 添加胜利动画
        winMessage.classList.add('show');
        
        // 播放胜利音效
        this.soundGenerator.playWinSound();
        
        // 添加按钮事件监听
        document.getElementById('replay-btn').addEventListener('click', () => {
            this.soundGenerator.playButtonSound();
            this.startReplay();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.soundGenerator.playButtonSound();
            this.restartGame();
        });

        // 高亮胜利棋子
        if (winInfo && winInfo.positions) {
            this.boardRenderer.clearBoard();
            this.boardRenderer.drawAllStones(this.stones, winInfo.positions);
        }
    }

    startReplay() {
        if (this.isReplaying) return;
        
        this.isReplaying = true;
        this.replayIndex = 0;
        
        // 清空棋盘
        this.clearBoard();
        
        // 开始复盘
        this.replayNextMove();
    }

    replayNextMove() {
        if (this.replayIndex >= this.moveHistory.length) {
            this.isReplaying = false;
            return;
        }
        
        const move = this.moveHistory[this.replayIndex];
        this.stones[move.row][move.col] = move.player;
        this.boardRenderer.clearBoard();
        this.boardRenderer.drawAllStones(this.stones);
        
        this.replayIndex++;
        setTimeout(() => this.replayNextMove(), 500);
    }

    clearBoard() {
        this.boardRenderer.clearBoard();
        this.stones = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
    }

    placeStone(row, col) {
        if (this.gameOver || this.stones[row][col]) return;
        
        this.stones[row][col] = this.currentPlayer;
        this.drawStone(row, col, this.currentPlayer);
        
        // 记录移动历史
        this.moveHistory.push({
            row,
            col,
            player: this.currentPlayer
        });
        
        // 播放落子音效
        this.soundGenerator.playPlaceSound();
        
        // 检查是否形成必胜棋型
        const winInfo = this.checkWin(row, col);
        if (winInfo) {
            this.gameOver = true;
            this.showWinMessage(winInfo);
            if (this.isAIMode) {
                this.updateStats(this.currentPlayer === this.aiColor ? 'loss' : 'win');
            }
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerTurn();
        
        // 如果是AI模式且轮到AI下棋
        if (this.isAIMode && this.currentPlayer === this.aiColor && !this.gameOver) {
            this.makeAIMove();
        }
    }
    
    // 修改：显示胜利消息
    showWinMessage() {
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';
        winMessage.textContent = `${this.currentPlayer === 'black' ? '黑' : '白'}方胜利！`;
        document.body.appendChild(winMessage);
        
        // 显示重新开始按钮
        this.restartBtn.style.display = 'block';
    }
    
    // 修改：评估进攻价值
    evaluateAttack(row, col) {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        
        // 检查每个方向
        for (const [dx, dy] of directions) {
            // 检查必胜棋型
            if (this.checkLiveFour(row, col, dx, dy) ||
                this.checkJumpLiveFour(row, col, dx, dy) ||
                this.checkDoubleThree(row, col, dx, dy) ||
                this.checkTripleThree(row, col, dx, dy)) {
                // 如果发现必胜棋型，直接返回最高分数
                return 1000000;
            }
        }
        
        // 如果没有必胜棋型，评估其他进攻价值
        let score = 0;
        for (const [dx, dy] of directions) {
            if (this.checkLiveThree(row, col, dx, dy)) {
                score += 50000; // 活三，优先进攻
            }
            else if (this.checkSleepThree(row, col, dx, dy)) {
                score += 20000; // 眠三，考虑进攻
            }
            else if (this.checkLiveTwo(row, col, dx, dy)) {
                score += 5000; // 活二，基础进攻
            }
        }
        
        return score;
    }
    
    // 更新游戏统计
    updateStats(result) {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const stats = currentUser.gameStats;
            stats[result]++;
            updateUserStats(stats);
        }
    }
    
    initOnlineGame() {
        this.gameBoard = Array(15).fill().map(() => Array(15).fill(null));
        this.isGameOver = false;
        this.winMessage = document.getElementById('win-message');
        this.playerRole = null; // 'black' 或 'white'
        this.roomId = new URLSearchParams(window.location.search).get('roomId');
        this.ws = null;
        
        this.initWebSocket();
        this.showUserInfo();
    }

    showUserInfo() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const userAvatar = document.querySelector('.nav-bar .user-avatar');
            const userName = document.querySelector('.nav-bar .user-name');
            const wins = document.querySelector('.nav-bar .wins');
            const losses = document.querySelector('.nav-bar .losses');
            const draws = document.querySelector('.nav-bar .draws');
            
            userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
            userName.textContent = currentUser.username;
            
            const stats = currentUser.gameStats;
            wins.textContent = `胜利: ${stats.wins}`;
            losses.textContent = `失败: ${stats.losses}`;
            draws.textContent = `平局: ${stats.draws}`;
        }
    }

    initWebSocket() {
        this.ws = new WebSocket('ws://localhost:8080');
        
        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
            // 加入房间
            this.ws.send(JSON.stringify({
                type: 'joinGame',
                roomId: this.roomId,
                player: getCurrentUser()
            }));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket连接已关闭');
            alert('连接已断开，请重新进入房间');
            window.location.href = 'room.html';
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'gameStart':
                this.handleGameStart(data);
                break;
            case 'move':
                this.handleOpponentMove(data);
                break;
            case 'gameOver':
                this.handleGameOver(data);
                break;
            case 'playerLeft':
                this.handlePlayerLeft(data);
                break;
            case 'waitingForPlayer':
                this.showWaitingMessage();
                break;
        }
    }

    handleGameStart(data) {
        this.playerRole = data.role;
        this.updatePlayersInfo(data.players);
        this.hideWaitingMessage();
        
        if (this.playerRole === 'black') {
            this.addEventListeners();
        }
    }

    handleOpponentMove(data) {
        const { row, col, player } = data;
        this.gameBoard[row][col] = player;
        this.drawStone(row, col, player);
        
        if (player !== this.playerRole) {
            this.currentPlayer = this.playerRole;
            this.addEventListeners();
        }
    }

    handleGameOver(data) {
        this.isGameOver = true;
        this.winMessage.textContent = data.message;
        this.winMessage.classList.add('show');
        
        // 更新战绩
        if (data.winner) {
            const stats = { wins: 0, losses: 0, draws: 0 };
            if (data.winner === this.playerRole) {
                stats.wins = 1;
            } else {
                stats.losses = 1;
            }
            updateUserStats(stats);
        } else {
            updateUserStats({ draws: 1 });
        }
    }

    handlePlayerLeft(data) {
        alert(data.message);
        window.location.href = 'room.html';
    }

    showWaitingMessage() {
        document.querySelector('.waiting-message').style.display = 'block';
    }

    hideWaitingMessage() {
        document.querySelector('.waiting-message').style.display = 'none';
    }

    updatePlayersInfo(players) {
        const blackPlayer = players.find(p => p.role === 'black');
        const whitePlayer = players.find(p => p.role === 'white');

        if (blackPlayer) {
            const blackPlayerEl = document.querySelector('.black-player');
            blackPlayerEl.querySelector('.player-avatar').textContent = blackPlayer.username.charAt(0).toUpperCase();
            blackPlayerEl.querySelector('.player-name').textContent = blackPlayer.username;
            blackPlayerEl.querySelector('.player-stats').textContent = 
                `胜: ${blackPlayer.stats.wins} 负: ${blackPlayer.stats.losses} 平: ${blackPlayer.stats.draws}`;
        }

        if (whitePlayer) {
            const whitePlayerEl = document.querySelector('.white-player');
            whitePlayerEl.querySelector('.player-avatar').textContent = whitePlayer.username.charAt(0).toUpperCase();
            whitePlayerEl.querySelector('.player-name').textContent = whitePlayer.username;
            whitePlayerEl.querySelector('.player-stats').textContent = 
                `胜: ${whitePlayer.stats.wins} 负: ${whitePlayer.stats.losses} 平: ${whitePlayer.stats.draws}`;
        }
    }

    createGrid() {
        // Canvas棋盘由BoardRenderer负责绘制
        this.stones = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.boardRenderer.drawBoard();
        this.boardRenderer.drawAllStones(this.stones);
    }

    addEventListeners() {
        if (this.isGameOver) return;
        // Canvas点击事件
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cell = this.boardRenderer.getCellFromCoords(x, y);
            if (!cell) return;
            const { row, col } = cell;
            if (this.stones[row][col]) return;
            this.placeStone(row, col);
        });
    }

    drawStone(row, col, player, highlight = false) {
        this.boardRenderer.drawStone(row, col, player, highlight);
    }
}

// 初始化游戏
window.onload = function() {
    checkAuth();
    new OnlineGomoku();
}; 