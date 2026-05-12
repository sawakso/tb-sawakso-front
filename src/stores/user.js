import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: null
    }),

    getters: {
        isLoggedIn: (state) => !!state.token
    },

    actions: {
        initUser() {
            const savedUser = localStorage.getItem('user')
            if (savedUser) {
                try {
                    this.userInfo = JSON.parse(savedUser)
                } catch (e) {
                    localStorage.removeItem('user')
                }
            }
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
            }
        },

        setToken(token) {
            this.token = token
            localStorage.setItem('token', token)
        },

        setUserInfo(info) {
            this.userInfo = info
            localStorage.setItem('user', JSON.stringify(info))
        },

        logout() {
            this.token = ''
            this.userInfo = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})