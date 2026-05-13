import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: (() => {
            try {
                return JSON.parse(localStorage.getItem('user') || 'null')
            } catch {
                return null
            }
        })()
    }),

    getters: {
        isLoggedIn: (state) => !!state.token
    },

    actions: {
        // 应用启动时调用，从 localStorage 恢复状态（state 初始化已处理，此处作兜底）
        initUser() {
            if (!this.userInfo) {
                try {
                    const saved = localStorage.getItem('user')
                    if (saved) this.userInfo = JSON.parse(saved)
                } catch {
                    localStorage.removeItem('user')
                }
            }
            if (!this.token) {
                const token = localStorage.getItem('token')
                if (token) this.token = token
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

        // 局部更新用户信息（如修改头像/昵称后）
        updateUserInfo(patch) {
            this.userInfo = { ...this.userInfo, ...patch }
            localStorage.setItem('user', JSON.stringify(this.userInfo))
        },

        logout() {
            this.token = ''
            this.userInfo = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})
