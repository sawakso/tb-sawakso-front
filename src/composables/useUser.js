/**
 * useUser — Pinia useUserStore 的薄封装
 *
 * 保持与旧 composable 相同的调用接口：
 *   const { user, updateUser, clearUser } = useUser()
 *
 * 所有组件无需修改导入路径，状态统一由 Pinia 管理。
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useUser() {
    const store = useUserStore()

    // 兼容旧接口：user 是可读写的 computed ref
    const user = computed({
        get: () => store.userInfo,
        set: (val) => store.setUserInfo(val)
    })

    // 局部更新用户信息（合并 patch）
    function updateUser(patch) {
        store.updateUserInfo(patch)
    }

    // 清除用户（退出登录）
    function clearUser() {
        store.logout()
    }

    return { user, updateUser, clearUser }
}
