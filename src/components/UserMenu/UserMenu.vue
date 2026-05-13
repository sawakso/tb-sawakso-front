<template>
  <div class="user-menu-wrapper">
    <button class="user-btn" @click="showMenu = !showMenu">
      <div class="user-avatar">
        <img v-if="user?.avatar" :src="user.avatar" class="avatar-img" loading="lazy" />
        <span v-else>{{ user?.nickname?.charAt(0) }}</span>
      </div>
      <span class="user-name">{{ user?.nickname }}</span>
      <i class="fas fa-chevron-down"></i>
    </button>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <div v-if="showMenu" class="menu-overlay" @click="showMenu = false">
        <div class="menu-dropdown" @click.stop>
          <div class="menu-header">
            <div class="menu-avatar">
              <img v-if="user?.avatar" :src="user.avatar" class="avatar-img" loading="lazy" />
              <span v-else>{{ user?.nickname?.charAt(0) }}</span>
            </div>
            <div>
              <p class="menu-nickname">{{ user?.nickname }}</p>
              <p class="menu-role">{{ user?.role === 'ADMIN' ? '管理员' : '用户' }}</p>
            </div>
          </div>
          <div class="menu-divider"></div>
          <button class="menu-item" @click="goTo('/user')">
            <i class="fas fa-user-edit"></i> 编辑资料
          </button>
          <button class="menu-item" @click="goTo('/user/password')">
            <i class="fas fa-key"></i> 修改密码
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item" @click="logout">
            <i class="fas fa-sign-out-alt"></i> 退出登录
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item danger" @click="confirmDelete">
            <i class="fas fa-trash"></i> 注销账号
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 退出登录弹窗 -->
    <Teleport to="body">
      <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
        <div class="modal-content" @click.stop>
          <h3>退出登录</h3>
          <p class="modal-text">确定要退出当前账号吗？</p>
          <div class="btn-group">
            <button class="cancel-btn" @click="showLogoutModal = false">取消</button>
            <button class="confirm-btn" @click="doLogout">确认退出</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- 注销账号弹窗 -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
          <h3>注销账号</h3>
          <p class="modal-warning">⚠️ 此操作不可撤销，将永久删除你的账号和数据。</p>
          <div class="input-group">
            <input v-model="deleteEmail" placeholder="请输入邮箱地址" class="auth-input" />
          </div>
          <div class="input-group code-group">
            <input v-model="deleteCode" placeholder="验证码" class="auth-input" />
            <button class="send-code-btn" @click="sendDeleteCode" :disabled="deleteCodeLoading || !deleteEmail">
              {{ deleteCodeLoading ? '发送中...' : '发送验证码' }}
            </button>
          </div>
          <div class="btn-group">
            <button class="cancel-btn" @click="showDeleteModal = false">取消</button>
            <button class="danger-btn" @click="doDelete" :disabled="!deleteEmail || !deleteCode || deleteLoading">
              {{ deleteLoading ? '注销中...' : '确认注销' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/request/api/user'
import { useUserStore } from '@/stores/user'

const props = defineProps({ user: Object })
const emit = defineEmits(['logout'])

const router = useRouter()
const userStore = useUserStore()
const showMenu = ref(false)

const goTo = (path) => { router.push(path); showMenu.value = false }

// 退出登录
const showLogoutModal = ref(false)
const logout = () => { showMenu.value = false; showLogoutModal.value = true }
const doLogout = () => {
  userStore.logout()
  emit('logout')
  showLogoutModal.value = false
  router.push('/')
}

// 注销账号
const showDeleteModal = ref(false)
const deleteEmail = ref('')
const deleteCode = ref('')
const deleteCodeLoading = ref(false)
const deleteLoading = ref(false)

const confirmDelete = () => {
  showMenu.value = false
  deleteCode.value = ''
  deleteEmail.value = ''  // ⭐ 清空，让用户手动输入
  showDeleteModal.value = true
}

const sendDeleteCode = async () => {
  deleteCodeLoading.value = true
  try {
    await userApi.sendCode({ email: deleteEmail.value, type: 3 })
    alert('验证码已发送')
  } catch (e) { alert('发送失败') }
  finally { deleteCodeLoading.value = false }
}

const doDelete = async () => {
  deleteLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: deleteEmail.value, code: deleteCode.value })
    })
    const data = await res.json()
    if (data.code === 200) {
      alert('账号已注销')
      userStore.logout()
      router.push('/')
    } else {
      alert(data.message || '注销失败')
    }
  } catch (e) { alert('注销失败') }
  finally { deleteLoading.value = false }
}
</script>

<style scoped>
.user-menu-wrapper { position: relative; }
.user-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; color: var(--text-color); cursor: pointer;
  padding: 4px 8px; border-radius: 20px; transition: var(--transition);
}
.user-btn:hover { background: var(--surface-color); }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--primary-color); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; overflow: hidden;
}
.user-name { font-size: 0.9rem; }
.avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.menu-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; }
.menu-dropdown {
  position: absolute; top: 70px; right: 40px;
  background: var(--surface-color); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 16px; min-width: 220px;
  backdrop-filter: blur(20px); animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.menu-header { display: flex; gap: 12px; align-items: center; }
.menu-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--primary-color); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 600; overflow: hidden;
}
.menu-nickname { color: var(--text-color); font-weight: 600; }
.menu-role { color: var(--text-secondary); font-size: 0.8rem; }
.menu-divider { height: 1px; background: var(--border-color); margin: 12px 0; }
.menu-item {
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: none; border: none;
  color: var(--text-color); font-size: 0.9rem; cursor: pointer;
  border-radius: 8px; transition: background 0.2s;
}
.menu-item:hover { background: var(--bg-color); }
.menu-item.danger { color: #ff6b6b; }
.menu-item.danger:hover { background: rgba(255, 107, 107, 0.1); }

/* 弹窗通用 */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
  background: var(--surface-color); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 28px; width: 380px; max-width: 90vw;
}
h3 { color: var(--text-color); margin-bottom: 12px; font-size: 1.2rem; }
.modal-text { color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem; }
.modal-warning { color: #ff6b6b; margin-bottom: 16px; font-size: 0.85rem; text-align: center; }

.input-group { margin-bottom: 14px; }
.auth-input {
  width: 100%; padding: 10px 14px; border: 1px solid var(--border-color);
  border-radius: 10px; background: var(--bg-color); color: var(--text-color);
  outline: none; font-size: 14px; box-sizing: border-box;
}
.auth-input:disabled { opacity: 0.5; }
.code-group { display: flex; gap: 10px; }
.code-group .auth-input { flex: 1; }
.send-code-btn {
  white-space: nowrap; padding: 10px 14px;
  border: 1px solid var(--primary-color); border-radius: 10px;
  background: transparent; color: var(--primary-color); cursor: pointer; font-size: 13px;
}
.send-code-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-group { display: flex; gap: 12px; margin-top: 8px; }
.cancel-btn {
  flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 10px;
  background: transparent; color: var(--text-color); cursor: pointer; font-size: 14px;
}
.confirm-btn {
  flex: 1; padding: 10px; border: none; border-radius: 10px;
  background: var(--primary-color); color: white; cursor: pointer; font-size: 14px;
}
.danger-btn {
  flex: 1; padding: 10px; border: none; border-radius: 10px;
  background: #ff4444; color: white; cursor: pointer; font-size: 14px;
}
.danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>