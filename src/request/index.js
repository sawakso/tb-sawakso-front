// src/request/index.js
import axios from 'axios'

const request = axios.create({
    timeout: 10000
})

// ========== 简单缓存（GET 请求 5 分钟有效）==========
const cache = new Map()
const CACHE_TIME = 5 * 60 * 1000

// ========== 请求去重（防止快速点击重复请求）==========
const pending = new Map()

// 请求拦截器
request.interceptors.request.use(config => {
    // ✅ 更健壮的匹配方式
    const url = config.url || ''

    // 检查是否是贴吧/帖子/上传相关接口
    if (url.includes('/bars') || url.includes('/posts') || url.includes('/upload')) {
        config.baseURL = 'https://tb-api.sawakso.com/api'
    } else {
        config.baseURL = 'https://api.sawakso.com'
    }
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url} → baseURL: ${config.baseURL}`)

    // 1. GET 请求走缓存
    if (config.method === 'get') {
        const key = `${config.url}${JSON.stringify(config.params || '')}`

        // 检查缓存
        const cached = cache.get(key)
        if (cached && Date.now() - cached.time < CACHE_TIME) {
            return Promise.reject({ __cached: true, data: cached.data })
        }

        // 请求去重
        if (pending.has(key)) {
            return Promise.reject({ __pending: true, promise: pending.get(key) })
        }

        // 标记为 pending
        config._key = key
        let resolvePending
        pending.set(key, new Promise(resolve => { resolvePending = resolve }))
        config._resolvePending = resolvePending
    }

    // 2. 带 Token
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// 响应拦截器
request.interceptors.response.use(
    response => {
        // GET 请求存入缓存 + 移除 pending
        if (response.config._key) {
            const key = response.config._key
            cache.set(key, { data: response.data, time: Date.now() })
            pending.delete(key)
            if (response.config._resolvePending) {
                response.config._resolvePending(response.data)
            }
        }
        return response.data
    },
    error => {
        // 缓存命中
        if (error.__cached) return Promise.resolve(error.data)

        // 请求去重：返回同一个 Promise
        if (error.__pending) return error.promise

        // 401 处理
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/#/login'
        }
        return Promise.reject(error)
    }
)

// 清除缓存
request.clearCache = (url) => {
    if (url) {
        for (const key of cache.keys()) {
            if (key.includes(url)) cache.delete(key)
        }
    } else {
        cache.clear()
    }
}

export default request