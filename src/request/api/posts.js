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
    },

    /**
     * 上传媒体文件（图片/视频）到 R2
     * @param {File} file - 文件对象
     * @param {string|number} [postId] - 可选帖子ID，有则按帖子分文件夹存储
     * @returns {{ data: { url: string, key: string, type: 'image'|'video', size: number } }}
     */
    uploadMedia(file, postId) {
        const fd = new FormData()
        fd.append('file', file)
        if (postId) fd.append('postId', postId)

        console.log('[Upload] 即将上传文件:', file.name, 'size:', file.size, postId ? 'postId:' + postId : '(预上传)')
        return request.post('/upload', fd).then(res => {
            console.log('[Upload] 上传成功:', res.data?.url, '| key:', res.data?.key)
            return res
        })
    },

    /**
     * 更新帖子（主要用于创建后补充媒体信息）
     * @param {string|number} id - 帖子ID
     * @param {{ images?: string[], video?: string, media_type?: string, media_url?: string }} data
     */
    update(id, data) {
        return request.put(`/posts/${id}`, data)
    }
}
