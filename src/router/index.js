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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router