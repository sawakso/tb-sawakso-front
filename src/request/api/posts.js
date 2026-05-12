import request from '../index'

export const postsApi = {
    getAll(params = {}) {
        return request.get('/posts', { params })
    },
    getById(id) {
        return request.get(`/posts/${id}`)
    }
}