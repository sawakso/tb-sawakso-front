// src/composables/useScrollHide.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollHide() {
    const isHeaderVisible = ref(true)
    let lastScrollY = 0
    let ticking = false

    const handleScroll = () => {
        const currentScrollY = window.scrollY

        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (currentScrollY < 10) {
                    // 页面顶部，始终显示
                    isHeaderVisible.value = true
                } else if (currentScrollY > lastScrollY + 5) {
                    // 向下滚动，隐藏
                    isHeaderVisible.value = false
                } else if (currentScrollY < lastScrollY - 5) {
                    // 向上滚动，显示
                    isHeaderVisible.value = true
                }

                lastScrollY = currentScrollY
                ticking = false
            })
            ticking = true
        }
    }

    onMounted(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
    })

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
    })

    return { isHeaderVisible }
}