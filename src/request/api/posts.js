import request from '../index'

export const postsApi = {
    getAll(params = {}) {
        return request.get('/posts', { params })
    },
    getById(id) {
        return request.get(`/posts/${id}`)
    },
    create(data) {
        return request.post('/posts', data)
    },
    delete(id) {
        return request.delete(`/posts/${id}`)
    }
}
