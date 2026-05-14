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
     * @returns {{ data: { url: string, type: 'image'|'video' } }}
     */
    uploadMedia(file) {
        const fd = new FormData()
        fd.append('file', file)
        console.log('[Upload] 即将上传文件:', file.name, 'size:', file.size)
        return request.post('/upload', fd).then(res => {
            console.log('[Upload] 上传成功:', res.data?.url)
            return res
        })
    }
}
