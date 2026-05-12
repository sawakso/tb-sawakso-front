// src/request/api/user.js
import request from '../index'

export const userApi = {
    // 密码登录
    login(data) {
        return request.post('/api/user/login', data)
    },
    // 验证码登录
    loginByCode(data) {
        return request.post('/api/user/login-by-code', data)
    },
    // 注册
    register(data) {
        return request.post('/api/user/register', data)
    },
    // 发送验证码
    sendCode(data) {
        return request.post('/api/user/send-code', data)
    },
    // 重置密码
    resetPassword(data) {
        return request.post('/api/user/reset-password', data)
    },
    // 检查用户名
    checkUsername(username) {
        return request.get('/api/user/check-username', { params: { username } })
    }
}