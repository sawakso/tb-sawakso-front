import { defineStore } from 'pinia'
import { userApi } from '@/request/api/user.js'
import { postsApi } from '@/request/api/posts.js'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: (() => {
            try {
                return JSON.parse(localStorage.getItem('user') || 'null')
            } catch {
                return null
            }
        })(),
        // 用户缓存池：key=userId, value={ id, username, nickname, avatar, bio }
        userMap: {},

        // ==================== 个人中心数据 ====================
        myPosts: [],              // 我的帖子
        myComments: [],           // 我的评论（含 post_title）
        myBars: [],               // 关注的吧
        followStats: {            // 关注/粉丝统计
            following: 0,
            followers: 0
        },
        followingList: [],        // 我关注的人列表
        followerList: [],         // 粉丝列表
        profileLoaded: false,     // 个人中心数据是否已加载
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,

        /** 获赞帖子 */
        likedPosts(state) {
            return state.myPosts.filter(p => (p.like_count || 0) > 0)
        },

        /** 获赞评论 */
        likedComments(state) {
            return state.myComments.filter(c => (c.like_count || 0) > 0)
        },

        /** 总获赞数 */
        totalLikes() {
            const postLikes = this.likedPosts.reduce((s, p) => s + (p.like_count || 0), 0)
            const commentLikes = this.likedComments.reduce((s, c) => s + (c.like_count || 0), 0)
            return postLikes + commentLikes
        },
    },

    actions: {
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
            if (info?.id) {
                this.userMap[info.id] = {
                    id: info.id,
                    username: info.username,
                    nickname: info.nickname,
                    avatar: info.avatar,
                    bio: info.bio
                }
            }
        },

        updateUserInfo(patch) {
            this.userInfo = { ...this.userInfo, ...patch }
            localStorage.setItem('user', JSON.stringify(this.userInfo))
            if (this.userInfo?.id) {
                this.userMap[this.userInfo.id] = { ...this.userMap[this.userInfo.id], ...patch }
            }
        },

        logout() {
            this.token = ''
            this.userInfo = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // 清空个人中心数据
            this.myPosts = []
            this.myComments = []
            this.myBars = []
            this.followStats = { following: 0, followers: 0 }
            this.followingList = []
            this.followerList = []
            this.profileLoaded = false
            // 注意：不清空 userMap，因为其他用户的展示数据仍需保留
        },

        // ==================== 用户缓存池 ====================

        getUser(userId) {
            if (!userId) return null
            return this.userMap[userId] || null
        },

        setUsers(users) {
            const list = Array.isArray(users) ? users : [users]
            for (const u of list) {
                if (!u?.id) continue
                const existing = this.userMap[u.id] || {}
                this.userMap[u.id] = {
                    id: u.id,
                    username: u.username ?? existing.username,
                    nickname: u.nickname ?? existing.nickname,
                    avatar: u.avatar ?? existing.avatar,
                    bio: u.bio ?? existing.bio
                }
            }
        },

        extractAndCacheUsers(data) {
            const list = Array.isArray(data) ? data : [data]
            for (const item of list) {
                if (!item?.user_id) continue
                this.setUsers({
                    id: item.user_id,
                    username: item.username,
                    nickname: item.nickname,
                    avatar: item.avatar
                })
            }
        },

        // ==================== 个人中心数据加载 ====================

        /**
         * 加载当前用户个人信息（刷新 userInfo）
         */
        async fetchProfile() {
            const res = await userApi.getMe()
            const data = res.data || res
            this.setUserInfo(data)
            return data
        },

        /**
         * 加载关注/粉丝统计数据
         */
        async fetchFollowStats() {
            try {
                const data = await userApi.getFollowStats()
                this.followStats = data.data || data
            } catch (e) {
                console.error('获取关注统计失败:', e)
            }
        },

        /**
         * 加载我的帖子（通过后端接口按 user_id 过滤）
         */
        async fetchMyPosts() {
            try {
                const allPosts = await postsApi.getAll()
                const userId = this.userInfo?.userId || this.userInfo?.id
                this.myPosts = allPosts.filter(p => Number(p.user_id) === Number(userId))
                // 缓存帖子中的用户信息
                this.extractAndCacheUsers(this.myPosts)
            } catch (e) {
                console.error('获取我的帖子失败:', e)
                this.myPosts = []
            }
        },

        /**
         * 加载我的评论（通过后端聚合接口）
         */
        async fetchMyComments() {
            const userId = this.userInfo?.userId || this.userInfo?.id
            if (!userId) {
                this.myComments = []
                return
            }

            try {
                // 使用后端用户评论接口（避免 N+1 前端请求）
                const res = await userApi.getMyComments(userId)
                const data = res.data || res
                this.myComments = Array.isArray(data) ? data : []
                // 缓存评论中的用户信息
                this.extractAndCacheUsers(this.myComments)
            } catch (e) {
                // 后端接口不可用时降级为前端过滤方式
                console.warn('后端评论接口不可用，使用前端过滤:', e)
                await this._fetchMyCommentsFallback(userId)
            }
        },

        /**
         * 降级方案：逐帖子拉评论再前端过滤
         */
        async _fetchMyCommentsFallback(userId) {
            try {
                const allPosts = await postsApi.getAll()
                const commentsPromises = allPosts.map(p =>
                    fetch(`https://tb-api.sawakso.com/api/posts/${p.id}/comments`).then(r => r.json())
                )
                const commentsArrays = await Promise.all(commentsPromises)
                const allComments = commentsArrays.flat()
                this.myComments = allComments.filter(c => Number(c.user_id) === Number(userId))
            } catch (e) {
                console.error('获取我的评论失败:', e)
                this.myComments = []
            }
        },

        /**
         * 加载关注的吧
         */
        async fetchMyBars() {
            try {
                const res = await userApi.getMyBars()
                const data = res.data || res
                this.myBars = Array.isArray(data) ? data : []
            } catch (e) {
                console.error('获取关注的吧失败:', e)
                this.myBars = []
            }
        },

        /**
         * 加载关注列表
         */
        async fetchFollowing() {
            const userId = this.userInfo?.userId || this.userInfo?.id
            if (!userId) return
            try {
                const res = await userApi.getFollowing(userId)
                const data = res.data || res
                this.followingList = Array.isArray(data) ? data : []
                // 将关注列表用户加入缓存池
                this.setUsers(this.followingList)
            } catch (e) {
                console.error('获取关注列表失败:', e)
                this.followingList = []
            }
        },

        /**
         * 加载粉丝列表
         */
        async fetchFollowers() {
            const userId = this.userInfo?.userId || this.userInfo?.id
            if (!userId) return
            try {
                const res = await userApi.getFollowers(userId)
                const data = res.data || data
                this.followerList = Array.isArray(data) ? data : []
                // 将粉丝列表用户加入缓存池
                this.setUsers(this.followerList)
            } catch (e) {
                console.error('获取粉丝列表失败:', e)
                this.followerList = []
            }
        },

        /**
         * 取关用户（更新本地状态）
         */
        async unfollowUser(targetUser) {
            const targetId = targetUser.id || targetUser.userId || targetUser.target_user_id
            await userApi.unfollowUser(targetId)
            this.followingList = this.followingList.filter(u => {
                const uid = u.id || u.userId || u.target_user_id
                return Number(uid) !== Number(targetId)
            })
            this.followStats.following = Math.max(this.followStats.following - 1, 0)
        },

        /**
         * 一键加载所有个人中心数据
         */
        async fetchAllProfileData() {
            this.profileLoaded = false
            await this.fetchProfile()
            await Promise.all([
                this.fetchFollowStats(),
                this.fetchMyPosts(),
                this.fetchMyComments(),
                this.fetchMyBars(),
                this.fetchFollowing(),
                this.fetchFollowers()
            ])
            this.profileLoaded = true
        }
    }
})
