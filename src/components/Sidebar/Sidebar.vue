<template>
  <!-- 移动端遮罩 -->
  <div v-if="isMobile && sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

  <!-- 移动端切换按钮 -->
  <button v-if="isMobile" class="sidebar-toggle" @click="toggleSidebar">
    <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
  </button>

  <aside class="sidebar" :class="{ 'sidebar-closed': !sidebarOpen, 'sidebar-mobile': isMobile }">
    <!-- 折叠按钮（桌面端） -->
    <button v-if="!isMobile" class="collapse-btn" @click="toggleSidebar" :title="sidebarOpen ? '收起侧边栏' : '展开侧边栏'">
      <i :class="sidebarOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
    </button>

    <!-- 用户卡片（折叠时只显示头像） -->
    <div class="user-card" @click="user ? $router.push('/profile') : $emit('openAuth')">
      <div class="user-avatar">
        <img v-if="user" :src="user.avatar || '/images/default-avatar.png'" alt="avatar" />
        <i v-else class="fas fa-user"></i>
      </div>
      <div v-show="sidebarOpen" class="user-info">
        <p class="username">{{ user ? user.username : '未登录' }}</p>
        <p class="user-sub">{{ user ? '查看个人中心' : '点击登录账号' }}</p>
      </div>
      <i v-show="sidebarOpen" class="fas fa-chevron-right arrow"></i>
    </div>

    <!-- 我的贴吧 -->
    <div class="menu-section" v-if="user && myBars.length > 0 && sidebarOpen">
      <h3 class="section-title">我的贴吧</h3>
      <router-link v-for="bar in myBars" :key="bar.id" :to="'/bar/' + bar.id" class="menu-item">
        <img :src="bar.avatar || '/images/default-avatar.png'" class="bar-icon" />
        <span>{{ bar.name }}</span>
      </router-link>
    </div>

    <!-- 热门贴吧 -->
    <div class="menu-section" v-if="sidebarOpen">
      <h3 class="section-title">{{ user ? '热门贴吧' : '推荐贴吧' }}</h3>
      <router-link v-for="bar in hotBars" :key="bar.id" :to="'/bar/' + bar.id" class="menu-item">
        <img :src="bar.avatar || '/images/default-avatar.png'" class="bar-icon" />
        <span>{{ bar.name }}</span>
        <span class="bar-count">{{ bar.member_count || bar.memberCount }}</span>
      </router-link>
    </div>

    <!-- 折叠时的图标菜单 -->
    <div v-if="!sidebarOpen && !isMobile" class="collapsed-icons">
      <router-link v-for="bar in hotBars.slice(0, 5)" :key="bar.id" :to="'/bar/' + bar.id" class="icon-item" :title="bar.name">
        <img :src="bar.avatar || '/images/default-avatar.png'" class="bar-icon" />
      </router-link>
    </div>

    <div v-if="sidebarOpen" class="sidebar-footer">
      <p>© 2026 {{ title }}</p>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { barsApi } from '@/request/api/bars.js'
import { postsApi } from '@/request/api/posts.js'

const props = defineProps({ user: Object, title: String })
defineEmits(['openAuth'])

const allBars = ref([])
const stats = ref({ posts: 0, bars: 0, likes: 0 })
const sidebarOpen = ref(true)
const isMobile = ref(false)

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) sidebarOpen.value = false
  else sidebarOpen.value = true
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const [bars, posts] = await Promise.all([barsApi.getAll(), postsApi.getAll()])
  allBars.value = bars
  if (props.user) {
    const myPosts = posts.filter(p => Number(p.user_id) === Number(props.user.userId || props.user.id))
    stats.value.posts = myPosts.length
    stats.value.likes = myPosts.reduce((s, p) => s + (p.like_count || 0), 0)
  }
  stats.value.bars = allBars.value.length
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const hotBars = computed(() => {
  return [...allBars.value]
      .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
      .slice(0, 5)
})

const myBars = computed(() => {
  if (!props.user) return []
  return allBars.value.slice(0, 3)
})
</script>

<style scoped>
.sidebar {
  width: 250px; min-width: 250px;
  height: calc(100vh - 96px); position: sticky; top: 96px;
  padding: 20px 14px; overflow-y: auto;
  border-right: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; gap: 14px;
  transition: width 0.3s, min-width 0.3s, padding 0.3s;
  z-index: 100;
  background: var(--bg-color);
}
.sidebar-closed {
  width: 64px; min-width: 64px;
  padding: 20px 8px;
}
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }

/* 折叠按钮 */
.collapse-btn {
  position: absolute; top: 10px; right: 10px;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--surface-color); border: 1px solid var(--border-color);
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; transition: var(--transition);
  z-index: 10;
}
.collapse-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }

/* 移动端切换按钮 */
.sidebar-toggle {
  display: none;
  position: fixed; top: 100px; left: 10px; z-index: 110;
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--primary-color); border: none; color: white;
  font-size: 1rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* 移动端遮罩 */
.sidebar-overlay {
  position: fixed; inset: 0; z-index: 99;
  background: rgba(0,0,0,0.5);
}

/* 用户卡片 */
.user-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; background: var(--surface-color);
  border-radius: var(--border-radius); border: 1px solid var(--border-color);
  cursor: pointer; transition: var(--transition);
}
.sidebar-closed .user-card {
  justify-content: center; padding: 12px;
}
.user-card:hover { border-color: var(--primary-color); }
.user-avatar {
  width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
  flex-shrink: 0; border: 2px solid var(--primary-color);
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-color);
}
.sidebar-closed .user-avatar { width: 36px; height: 36px; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-avatar i { font-size: 1.2rem; color: var(--text-secondary); }
.user-info { flex: 1; min-width: 0; }
.username { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
.user-sub { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
.arrow { color: var(--text-secondary); font-size: 0.75rem; }

/* 折叠图标菜单 */
.collapsed-icons {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.icon-item {
  width: 36px; height: 36px; border-radius: 50%; overflow: hidden;
  border: 2px solid transparent; transition: var(--transition);
}
.icon-item:hover { border-color: var(--primary-color); transform: scale(1.1); }
.icon-item .bar-icon { width: 100%; height: 100%; }

/* 菜单 */
.menu-section { display: flex; flex-direction: column; gap: 2px; }
.section-title {
  font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 8px 6px;
}
.menu-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 6px; text-decoration: none; color: var(--text-color);
  font-size: 0.88rem; transition: var(--transition);
}
.menu-item:hover { background: var(--surface-color); color: var(--primary-color); }
.bar-icon { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.bar-count {
  font-size: 0.72rem; color: var(--text-secondary);
  background: var(--surface-color); padding: 2px 8px; border-radius: 10px;
}

.sidebar-footer {
  margin-top: auto; padding: 12px 8px; text-align: center;
  font-size: 0.75rem; color: var(--text-secondary); border-top: 1px solid var(--border-color);
}

/* ====== 移动端适配 ====== */
@media (max-width: 768px) {
  .sidebar-toggle { display: flex; align-items: center; justify-content: center; }

  .sidebar-mobile {
    position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    transform: translateX(0);
    transition: transform 0.3s;
  }
  .sidebar-mobile.sidebar-closed {
    transform: translateX(-100%);
  }
}
</style>