import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home/Home.vue'

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/post/:id',
        name: 'postDetail',
        component: () => import('@/views/PostDetail/PostDetail.vue')
    },
    {
        path: '/bar/:id',
        name: 'barDetail',
        component: () => import('@/views/BarDetail/BarDetail.vue')
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/Profile/Profile.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 登录守卫：需要登录的页面统一在这里拦截
router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (!token) return { path: '/' }
    }
})

export default router