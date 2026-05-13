import request from '../index'

export const commentsApi = {
    getByPostId(postId) {
        return request.get(`/posts/${postId}/comments`)
    },
    create(postId, data) {
        return request.post(`/posts/${postId}/comments`, data)
    },
    delete(id) {
        return request.delete(`/comments/${id}`)
    }
}
