<template>
  <aside class="sidebar">
    <!-- 用户卡片（点击进个人中心） -->
    <div class="user-card" @click="user ? $router.push('/profile') : $emit('openAuth')">
      <div class="user-avatar">
        <img v-if="user" :src="user.avatar || '/images/default-avatar.png'" alt="avatar" />
        <i v-else class="fas fa-user"></i>
      </div>
      <div class="user-info">
        <p class="username">{{ user ? user.username : '未登录' }}</p>
        <p class="user-sub">{{ user ? '查看个人中心' : '点击登录账号' }}</p>
      </div>
      <i class="fas fa-chevron-right arrow"></i>
    </div>

    <!-- 我的贴吧（登录后显示） -->
    <div class="menu-section" v-if="user && myBars.length > 0">
      <h3 class="section-title">我的贴吧</h3>
      <router-link v-for="bar in myBars" :key="bar.id" :to="'/bar/' + bar.id" class="menu-item">
        <img :src="bar.avatar || '/images/default-avatar.png'" class="bar-icon" />
        <span>{{ bar.name }}</span>
      </router-link>
    </div>

    <!-- 热门贴吧 -->
    <div class="menu-section">
      <h3 class="section-title">{{ user ? '热门贴吧' : '推荐贴吧' }}</h3>
      <router-link v-for="bar in hotBars" :key="bar.id" :to="'/bar/' + bar.id" class="menu-item">
        <img :src="bar.avatar || '/images/default-avatar.png'" class="bar-icon" />
        <span>{{ bar.name }}</span>
        <span class="bar-count">{{ bar.member_count || bar.memberCount }}</span>
      </router-link>
    </div>

    <div class="sidebar-footer">
      <p>© 2026 {{ title }}</p>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { barsApi } from '@/request/api/bars.js'
import { postsApi } from '@/request/api/posts.js'

const props = defineProps({ user: Object, title: String })
defineEmits(['openAuth'])

const allBars = ref([])
const stats = ref({ posts: 0, bars: 0, likes: 0 })

onMounted(async () => {
  const [bars, posts] = await Promise.all([barsApi.getAll(), postsApi.getAll()])
  allBars.value = bars

  // 统计当前用户数据
  if (props.user) {
    const myPosts = posts.filter(p => Number(p.user_id) === Number(props.user.userId || props.user.id))
    stats.value.posts = myPosts.length
    stats.value.likes = myPosts.reduce((s, p) => s + (p.like_count || 0), 0)
  }
  stats.value.bars = allBars.value.length
})

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
}
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }

/* 用户卡片 */
.user-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; background: var(--surface-color);
  border-radius: var(--border-radius); border: 1px solid var(--border-color);
  cursor: pointer; transition: var(--transition);
}
.user-card:hover { border-color: var(--primary-color); }
.user-avatar {
  width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
  flex-shrink: 0; border: 2px solid var(--primary-color);
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-color);
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-avatar i { font-size: 1.2rem; color: var(--text-secondary); }
.user-info { flex: 1; min-width: 0; }
.username { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
.user-sub { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
.arrow { color: var(--text-secondary); font-size: 0.75rem; }

/* 统计数据 */
.user-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.stat-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 4px; background: var(--surface-color);
  border-radius: var(--border-radius); border: 1px solid var(--border-color);
  cursor: pointer; transition: var(--transition);
}
.stat-item:hover { border-color: var(--primary-color); }
.stat-num { font-weight: 700; font-size: 0.95rem; color: var(--primary-color); }
.stat-label { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }

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
.bar-icon {
  width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
}
.bar-count {
  font-size: 0.72rem; color: var(--text-secondary);
  background: var(--surface-color); padding: 2px 8px; border-radius: 10px;
}

.sidebar-footer {
  margin-top: auto; padding: 12px 8px; text-align: center;
  font-size: 0.75rem; color: var(--text-secondary); border-top: 1px solid var(--border-color);
}
</style>