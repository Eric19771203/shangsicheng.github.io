// 检查登录状态并显示用户信息
window.onload = function() {
    checkAuth();
    showUserInfo();
    initWebSocket();
};

// 显示用户信息
function showUserInfo() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const wins = document.querySelector('.wins');
        const losses = document.querySelector('.losses');
        const draws = document.querySelector('.draws');
        
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        userName.textContent = currentUser.username;
        
        const stats = currentUser.gameStats;
        wins.textContent = `胜利: ${stats.wins}`;
        losses.textContent = `失败: ${stats.losses}`;
        draws.textContent = `平局: ${stats.draws}`;
    }
}

let ws;
let matchTimer;
let isAIMatch = false;

// 初始化WebSocket连接
function initWebSocket() {
    ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        console.log('WebSocket连接已建立');
        // 开始匹配
        startMatching();
        // 启动匹配计时器
        startMatchTimer();
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        document.querySelector('.match-message').textContent = '连接已断开，请刷新页面重试';
    };
}

// 启动匹配计时器
function startMatchTimer() {
    let seconds = 0;
    matchTimer = setInterval(() => {
        seconds++;
        if (seconds >= 20 && !isAIMatch) {
            // 20秒后仍未匹配到玩家，启动AI对战
            startAIMatch();
        }
    }, 1000);
}

// 开始AI对战
function startAIMatch() {
    isAIMatch = true;
    clearInterval(matchTimer);
    document.querySelector('.match-message').textContent = '正在启动AI对战...';
    
    // 生成一个随机的AI名称
    const aiNames = ['棋圣', '棋王', '棋仙', '棋神', '棋魔'];
    const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
    
    // 延迟一秒后跳转到游戏页面，并传递AI信息
    setTimeout(() => {
        window.location.href = `game.html?mode=ai&aiName=${aiName}`;
    }, 1000);
}

// 处理WebSocket消息
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'matching':
            document.querySelector('.match-message').textContent = '正在寻找对手...';
            break;
        case 'matched':
            clearInterval(matchTimer);
            document.querySelector('.match-message').textContent = '已找到对手！正在进入游戏...';
            // 延迟一秒后跳转，让用户看到匹配成功的消息
            setTimeout(() => {
                window.location.href = `game.html?gameId=${data.gameId}`;
            }, 1000);
            break;
        case 'error':
            document.querySelector('.match-message').textContent = data.message;
            break;
    }
}

// 开始匹配
function startMatching() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    ws.send(JSON.stringify({
        type: 'startMatch',
        player: {
            username: currentUser.username,
            stats: currentUser.gameStats
        }
    }));
}

// 取消匹配
function cancelMatch() {
    clearInterval(matchTimer);
    ws.send(JSON.stringify({ type: 'cancelMatch' }));
    window.location.href = 'index.html';
} 