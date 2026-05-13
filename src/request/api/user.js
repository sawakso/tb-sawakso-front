import request from '../index'

export const userApi = {
    login(data) {
        return request.post('/api/user/login', data)
    },
    loginByCode(data) {
        return request.post('/api/user/login-by-code', data)
    },
    register(data) {
        return request.post('/api/user/register', data)
    },
    sendCode(data) {
        return request.post('/api/user/send-code', data)
    },
    resetPassword(data) {
        return request.post('/api/user/reset-password', data)
    },
    checkUsername(username) {
        return request.get('/api/user/check-username', { params: { username } })
    },
    getMe() {
        return request.get('/api/user/me')
    },
    updateProfile(data) {
        return request.put('/api/user/profile', data)
    },
    uploadAvatar(file) {
        const fd = new FormData()
        fd.append('file', file)
        return request.post('/api/user/avatar', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    getFollowStats() {
        return request.get('/api/user/follow-stats')
    },
    getMyBars() {
        return request.get('/api/user/bars')
    },
    followUser(targetUserId) {
        return request.post(`/api/user/follow/${targetUserId}`)
    },
    unfollowUser(targetUserId) {
        return request.delete(`/api/user/follow/${targetUserId}`)
    },

    // ==================== 个人中心聚合接口（走 tb-api）====================
    getMyComments(userId) {
        // 走 tb-api 域名
        return request.get(`/user/${userId}/comments`, { baseURL: 'https://tb-api.sawakso.com/api' })
    },
    getFollowing(userId) {
        return request.get(`/user/${userId}/following`, { baseURL: 'https://tb-api.sawakso.com/api' })
    },
    getFollowers(userId) {
        return request.get(`/user/${userId}/followers`, { baseURL: 'https://tb-api.sawakso.com/api' })
    }
}
