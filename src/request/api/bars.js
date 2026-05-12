import request from '../index'

export const barsApi = {
    getAll() {
        return request.get('/bars')
    },
    getById(id) {
        return request.get(`/bars/${id}`)
    }
}