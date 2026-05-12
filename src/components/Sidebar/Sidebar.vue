<template>
  <aside class="sidebar">
    <!-- 用户卡片 -->
    <div class="user-card" v-if="user">
      <div class="user-avatar">
        <img :src="user.avatar || '/assets/images/default-avatar.png'" alt="avatar" />
      </div>
      <div class="user-info">
        <p class="username">{{ user.username }}</p>
        <p class="user-bio">{{ user.bio || '这个人很懒，什么都没写' }}</p>
      </div>
    </div>

    <!-- 未登录 -->
    <div class="user-card login-placeholder" v-else @click="$emit('openAuth')">
      <div class="user-avatar">
        <img src="/src/assets/images/default-avatar.png" alt="avatar" />
      </div>
      <div class="user-info">
        <p class="username">未登录</p>
        <p class="user-bio">点击登录账号</p>
      </div>
    </div>

    <!-- 用户数据 -->
    <div class="user-stats" v-if="user">
      <div class="stat-item">
        <span class="stat-num">0</span>
        <span class="stat-label">帖子</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">0</span>
        <span class="stat-label">关注</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">0</span>
        <span class="stat-label">粉丝</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">0</span>
        <span class="stat-label">获赞</span>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="menu-section">
      <h3 class="section-title">快捷入口</h3>
      <router-link to="/" class="menu-item" :class="{ active: $route.path === '/' }">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/bars" class="menu-item" :class="{ active: $route.path === '/bars' }">
        <i class="fas fa-th-large"></i>
        <span>全部贴吧</span>
      </router-link>
      <router-link to="/ranking" class="menu-item" :class="{ active: $route.path === '/ranking' }">
        <i class="fas fa-fire"></i>
        <span>热门排行</span>
      </router-link>
      <router-link to="/messages" class="menu-item" :class="{ active: $route.path === '/messages' }">
        <i class="fas fa-bell"></i>
        <span>消息中心</span>
      </router-link>
      <router-link to="/history" class="menu-item" :class="{ active: $route.path === '/history' }">
        <i class="fas fa-clock"></i>
        <span>浏览历史</span>
      </router-link>
    </div>

    <!-- 热门贴吧 -->
    <div class="menu-section">
      <h3 class="section-title">热门贴吧</h3>
      <router-link
          v-for="bar in hotBars"
          :key="bar.id"
          :to="'/bar/' + bar.id"
          class="menu-item"
      >
        <i :class="bar.icon || 'fas fa-hashtag'"></i>
        <span>{{ bar.name }}</span>
        <span class="bar-count">{{ bar.memberCount }}</span>
      </router-link>
    </div>

    <!-- 底部 -->
    <div class="sidebar-footer">
      <p>© 2026 {{ title }}</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { bars } from '@/data/bars.js'

const props = defineProps({
  user: Object,
  title: String
})

defineEmits(['openAuth'])

// 热门贴吧，按成员数排序取前5个
const hotBars = computed(() => {
  return [...bars].sort((a, b) => b.memberCount - a.memberCount).slice(0, 5)
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  min-width: 250px;
  height: calc(100vh - 96px);
  position: sticky;
  top: 96px;
  padding: 20px 14px;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

/* ===== 用户卡片 ===== */
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}
.login-placeholder {
  cursor: pointer;
  transition: var(--transition);
}
.login-placeholder:hover {
  border-color: var(--primary-color);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--primary-color);
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}
.user-bio {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 3px;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 统计数据 ===== */
.user-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}
.stat-num {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--primary-color);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* ===== 菜单区域 ===== */
.menu-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 8px 6px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: var(--transition);
}
.menu-item:hover {
  background: var(--surface-color);
  color: var(--text-color);
}
.menu-item.active {
  background: var(--surface-color);
  color: var(--primary-color);
}
.menu-item i {
  width: 18px;
  text-align: center;
  font-size: 0.85rem;
}
.menu-item span {
  flex: 1;
}
.bar-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  background: var(--surface-color);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ===== 底部 ===== */
.sidebar-footer {
  margin-top: auto;
  padding: 12px 8px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}
</style>