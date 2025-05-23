document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // 验证用户名
    if (!validateUsername(username)) {
        alert('用户名格式不正确！');
        return;
    }

    // 验证密码
    if (!validatePassword(password)) {
        alert('密码格式不正确！');
        return;
    }

    // 验证密码确认
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }

    // 获取已存在的用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
        alert('用户名已存在！');
        return;
    }

    // 创建新用户
    const newUser = {
        username,
        password: hashPassword(password),
        createTime: new Date().toISOString(),
        gameStats: {
            wins: 0,
            losses: 0,
            draws: 0
        }
    };

    // 保存用户信息
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 自动登录
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert('注册成功！');
    window.location.href = 'index.html';
});

// 验证用户名
function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]{4,16}$/;
    return regex.test(username);
}

// 验证密码
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    return regex.test(password);
}

// 简单的密码哈希函数
function hashPassword(password) {
    return btoa(password);
} 