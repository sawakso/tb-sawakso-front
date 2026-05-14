import request from '../index'

export const barsApi = {
    // 搜索贴吧（q 为空时返回热门贴吧）
    search(q = '') {
        return request.get('/bars/search', { params: q ? { q } : {} })
    },
    getAll() {
        return request.get('/bars')
    },
    getById(id) {
        return request.get(`/bars/${id}`)
    },
    // 创建贴吧
    create(data) {
        return request.post('/bars', data)
    },
    follow(barId) {
        return request.post(`/user/bar/${barId}`)
    },
    unfollow(barId) {
        return request.delete(`/user/bar/${barId}`)
    }
}
