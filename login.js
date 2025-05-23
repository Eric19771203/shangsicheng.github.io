document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 获取用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 查找用户
    const user = users.find(u => u.username === username && u.password === hashPassword(password));

    if (user) {
        // 登录成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // 跳转到首页
        window.location.href = 'index.html';
    } else {
        alert('用户名或密码错误！');
    }
});

// 简单的密码哈希函数（与注册页面保持一致）
function hashPassword(password) {
    return btoa(password);
} 