import { ref } from 'vue'

// 全局单例
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

// 更新用户信息（同时更新 localStorage）
function updateUser(data) {
    user.value = { ...user.value, ...data }
    localStorage.setItem('user', JSON.stringify(user.value))
}

// 清除用户
function clearUser() {
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
}

export function useUser() {
    return { user, updateUser, clearUser }
}