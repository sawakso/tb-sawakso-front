import request from '../index'

export const barsApi = {
    getAll() {
        return request.get('/bars')
    },
    getById(id) {
        return request.get(`/bars/${id}`)
    },
    follow(barId) {
        return request.post(`/user/bar/${barId}`)
    },
    unfollow(barId) {
        return request.delete(`/user/bar/${barId}`)
    }
}
