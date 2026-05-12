<template>
  <header class="header" :class="{ 'header-hidden': !isHeaderVisible }">
    <!-- 左侧：Logo -->
    <div class="logo" @click="navigateToHome">
      <span class="logo-bracket">{</span>
      <span class="logo-text">{{ title }}</span>
      <span class="logo-bracket">}</span>
    </div>

    <!-- 中间：导航菜单 -->
    <nav class="nav">
      <ul>
        <li><router-link to="/" :class="{ active: $route.path === '/' }">首页</router-link></li>
        <li><router-link to="/bars" :class="{ active: $route.path === '/bars' }">帖吧</router-link></li>
        <li><router-link to="/ranking" :class="{ active: $route.path === '/ranking' }">排行榜</router-link></li>
        <li><router-link to="/history" :class="{ active: $route.path === '/history' }">浏览历史</router-link></li>
        <li><router-link to="/messages" :class="{ active: $route.path === '/messages' }">消息</router-link></li>
      </ul>
    </nav>

    <!-- 右侧：搜索框 + 登录 + 主题 -->
    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索帖子..."
            @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>

      <!-- 登录按钮 -->
      <button v-if="!user" class="login-btn" @click="$emit('openAuth')">
        <i class="fas fa-user"></i> 登录
      </button>
      <UserMenu v-else :user="user" @logout="emit('logout')" />

      <!-- 发帖按钮 -->
      <button class="post-btn" @click="handleCreatePost">
        <i class="fas fa-plus"></i>
        <span>发帖</span>
      </button>

      <!-- 主题切换 -->
      <div class="theme-toggle" @click="$emit('toggleTheme')">
        <i :class="themeIcon"></i>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserMenu from '@/components/UserMenu/UserMenu.vue'
import { useScrollHide } from '@/composables/useScrollHide'

const props = defineProps({
  title: String,
  user: Object,
  isDarkTheme: Boolean
})

const emit = defineEmits(['openAuth', 'toggleTheme', 'logout', 'search', 'createPost'])
const router = useRouter()

const { isHeaderVisible } = useScrollHide()
const searchKeyword = ref('')

const themeIcon = computed(() => props.isDarkTheme ? 'fas fa-moon' : 'fas fa-sun')

const navigateToHome = () => router.push('/')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    emit('search', searchKeyword.value.trim())
    router.push({ path: '/search', query: { q: searchKeyword.value.trim() } })
  }
}

const handleCreatePost = () => {
  if (!props.user) {
    emit('openAuth')
    return
  }
  emit('createPost')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 60px;
  width: 100%;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}

.header-hidden {
  transform: translateY(-100%);
}

/* ===== Logo ===== */
.logo {
  font-family: 'Source Code Pro', monospace;
  font-size: 1.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}
.logo:hover { opacity: 0.8; }
.logo-bracket { color: var(--primary-color); }
.logo-text { margin: 0 6px; color: var(--text-color); }

/* ===== 导航菜单 ===== */
.nav {
  flex-shrink: 0;
}
.nav ul {
  display: flex;
  list-style: none;
  gap: 28px;
}
.nav a {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition);
  position: relative;
  padding: 5px 0;
  white-space: nowrap;
}
.nav a:hover { color: var(--text-color); }
.nav a.active { color: var(--primary-color); }
.nav a.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  border-radius: 1px;
}

/* ===== 右侧区域 ===== */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* ===== 搜索框 ===== */
.search-box {
  display: flex;
  align-items: center;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 6px 6px 6px 16px;
  transition: var(--transition);
  width: 120px;
}
.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(94, 129, 255, 0.1);
  width: 300px;
}
.search-icon {
  color: var(--text-secondary);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-size: 0.9rem;
  padding: 6px 10px;
  min-width: 0;
}
.search-box input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}
.search-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: var(--transition);
  opacity: 0;
  transform: scale(0.8);
}
.search-box:focus-within .search-btn,
.search-box:hover .search-btn {
  opacity: 1;
  transform: scale(1);
}
.search-btn:hover {
  background: var(--secondary-color);
}

/* ===== 登录按钮 ===== */
.login-btn {
  padding: 8px 18px;
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
  white-space: nowrap;
}
.login-btn:hover {
  background: var(--primary-color);
  color: white;
}

/* ===== 发帖按钮 ===== */
.post-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;
}
.post-btn:hover {
  background: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 129, 255, 0.3);
}
.post-btn i {
  font-size: 0.8rem;
}

/* ===== 主题切换 ===== */
.theme-toggle {
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-secondary);
  transition: var(--transition);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--surface-color);
  flex-shrink: 0;
}
.theme-toggle:hover {
  color: var(--text-color);
  background-color: rgba(148, 163, 184, 0.15);
}

/* ===== 移动端适配 ===== */
@media (max-width: 1200px) {
  .header { padding: 18px 30px; gap: 16px; }
  .nav ul { gap: 18px; }
  .search-box { width: 180px; }
  .search-box:focus-within { width: 200px; }
}

@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    padding: 14px 20px;
    gap: 12px;
  }
  .nav { order: 3; width: 100%; overflow-x: auto; }
  .nav ul { gap: 16px; padding-bottom: 4px; }
  .nav a { font-size: 0.85rem; }
  .search-box { width: 140px; }
  .post-btn span { display: none; }
}
</style>