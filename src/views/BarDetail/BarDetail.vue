<template>
  <div class="bar-layout">
    <Sidebar
        :user="user"
        :title="title"
        @openAuth="showAuth = true"
    />

    <main class="main-content">
      <!-- 吧信息头部 -->
      <div class="bar-header" v-if="bar">
        <img :src="bar.avatar || '/images/default-bar-background.jpg'" class="bar-cover" />
        <div class="bar-info">
          <h1>{{ bar.name }}</h1>
          <p class="bar-desc">{{ bar.description }}</p>
          <div class="bar-stats">
            <span><i class="fas fa-users"></i> {{ bar.member_count }} 成员</span>
            <span><i class="fas fa-file-alt"></i> {{ bar.post_count }} 帖子</span>
          </div>
          <button class="join-btn" @click="toggleJoin">
            <i :class="joined ? 'fas fa-check' : 'fas fa-plus'"></i>
            {{ joined ? '已关注' : '关注本吧' }}
          </button>
        </div>
      </div>

      <!-- 排序切换 -->
      <div class="sort-tabs">
        <button :class="{ active: sortBy === 'latest' }" @click="sortBy = 'latest'">最新</button>
        <button :class="{ active: sortBy === 'hot' }" @click="sortBy = 'hot'">最热</button>
      </div>

      <!-- 帖子列表 -->
      <div class="post-list">
        <PostCard
            v-for="post in sortedPosts"
            :key="post.id"
            :post="post"
            @click="$router.push('/post/' + post.id)"
        />
      </div>
      <p v-if="sortedPosts.length === 0" class="no-posts">暂无帖子</p>
    </main>

    <!-- 右侧边栏 -->
    <aside class="right-sidebar">
      <div class="card">
        <h4>吧主</h4>
        <div class="owner-info">
          <img src="/images/user.png" class="owner-avatar" />
          <span>sawakso</span>
        </div>
      </div>

      <div class="card">
        <h4>友情贴吧</h4>
        <div class="friend-bars">
          <router-link
              v-for="fb in friendBars"
              :key="fb.id"
              :to="'/bar/' + fb.id"
              class="friend-item"
          >
            <img :src="fb.avatar || '/images/default-avatar.png'" />
            <span>{{ fb.name }}</span>
          </router-link>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PostCard from '@/components/PostCard/PostCard.vue'
import { useUser } from '@/composables/useUser'
import { barsApi } from '@/request/api/bars.js'
import { postsApi } from '@/request/api/posts.js'

const route = useRoute()
const { user } = useUser()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const joined = ref(false)
const sortBy = ref('latest')
const bar = ref(null)
const barPosts = ref([])
const friendBars = ref([])

const fetchBar = async (id) => {
  const allBars = await barsApi.getAll()
  bar.value = allBars.find(b => b.id === Number(id))
  barPosts.value = await postsApi.getAll({ barId: id })
  friendBars.value = allBars.filter(b => b.id !== Number(id)).slice(0, 5)
}

onMounted(() => fetchBar(route.params.id))
watch(() => route.params.id, fetchBar)

const sortedPosts = computed(() => {
  const list = [...barPosts.value]
  if (sortBy.value === 'latest') return list.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
  return list.sort((a, b) => b.view_count - a.view_count)
})

const toggleJoin = () => { joined.value = !joined.value }
</script>

<style scoped>
.bar-layout { display: flex; min-height: calc(100vh - 96px); }

.main-content { flex: 1; padding: 30px 40px; max-width: 750px; }

.bar-header {
  margin-bottom: 24px;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
}
.bar-cover { width: 100%; height: 160px; object-fit: cover; }
.bar-info { padding: 20px; }
.bar-info h1 { font-size: 1.4rem; margin-bottom: 8px; }
.bar-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 12px; }
.bar-stats { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px; }
.bar-stats i { margin-right: 4px; font-size: 0.8rem; }
.join-btn {
  padding: 8px 24px; background: var(--primary-color); border: none;
  border-radius: 20px; color: white; cursor: pointer; font-size: 0.9rem; transition: var(--transition);
}
.join-btn:hover { background: var(--secondary-color); }

.sort-tabs {
  display: flex; gap: 0; margin-bottom: 20px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; width: fit-content;
}
.sort-tabs button {
  padding: 8px 20px; border: none; background: transparent; color: var(--text-secondary);
  cursor: pointer; font-size: 0.9rem; transition: var(--transition); border-right: 1px solid var(--border-color);
}
.sort-tabs button:last-child { border-right: none; }
.sort-tabs button.active { background: var(--primary-color); color: white; }
.sort-tabs button:hover:not(.active) { color: var(--text-color); }

.post-list { display: flex; flex-direction: column; gap: 16px; }
.no-posts { text-align: center; color: var(--text-secondary); padding: 60px 0; }

.right-sidebar {
  width: 260px; min-width: 260px; padding: 30px 16px; border-left: 1px solid var(--border-color);
  backdrop-filter: blur(10px); position: sticky; top: 96px; height: calc(100vh - 96px); overflow-y: auto;
}
.card {
  background: var(--surface-color); border: 1px solid var(--border-color);
  border-radius: var(--border-radius); padding: 16px; margin-bottom: 16px;
}
.card h4 {
  font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);
}
.owner-info { display: flex; align-items: center; gap: 10px; }
.owner-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color); }
.friend-bars { display: flex; flex-direction: column; gap: 6px; }
.friend-item {
  display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 6px;
  text-decoration: none; color: var(--text-color); font-size: 0.85rem; transition: var(--transition);
}
.friend-item:hover { background: var(--surface-color); color: var(--primary-color); }
.friend-item img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
</style>