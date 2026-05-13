import request from '../index'

export const reactionsApi = {
    toggle(data) {
        return request.post('/reactions', data)
    }
}
