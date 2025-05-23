// 检查用户是否已登录
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('register.html');
    const isNotLoggedPage = currentPath.includes('not-logged.html');

    if (!isLoggedIn && !isAuthPage && !isNotLoggedPage) {
        // 未登录且不在登录相关页面，重定向到未登录页面
        window.location.href = 'not-logged.html';
    } else if (isLoggedIn && (isAuthPage || isNotLoggedPage)) {
        // 已登录但在登录相关页面，重定向到首页
        window.location.href = 'index.html';
    }

    return { isLoggedIn, currentUser };
}

// 退出登录
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// 更新用户信息
function updateUserStats(stats) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.gameStats = { ...currentUser.gameStats, ...stats };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // 更新用户列表中的用户信息
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// 获取用户信息
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
} 