import request from '../index'

export const commentsApi = {
    getByPostId(postId) {
        return request.get(`/posts/${postId}/comments`)
    }
}