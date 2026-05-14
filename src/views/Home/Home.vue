<template>
  <div class="home-layout">
    <Sidebar
        :user="user"
        :title="title"
        @openAuth="showAuth = true"
    />
    <main class="main-content">
      <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @click="goToPost(post.id)"
          @delete="handleDeletePost"
      />
    </main>
    <RightSidebar />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PostCard from '@/components/PostCard/PostCard.vue'
import RightSidebar from '@/components/RightSidebar/RightSidebar.vue'
import { useUser } from '@/composables/useUser'
import { useUserStore } from '@/stores/user'
import { postsApi } from '@/request/api/posts.js'


const router = useRouter()
const { user } = useUser()
const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const posts = ref([])

onMounted(async () => {
  posts.value = await postsApi.getAll()
  // 将帖子列表中的用户信息填充到 Pinia 缓存池
  userStore.extractAndCacheUsers(posts.value)
})

const goToPost = (id) => router.push('/post/' + id)

const handleCreatePost = () => {
  if (!user.value) { showAuth.value = true; return }
}

const handleDeletePost = async (postId) => {
  if (!confirm('确定要删除这篇帖子吗？删除后无法恢复。')) return
  try {
    await postsApi.delete(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
  } catch (e) {
    console.error('删除失败:', e)
    alert(e.response?.data?.message || '删除失败，请重试')
  }
}
</script>

<style scoped>
.home-layout { display: flex; min-height: calc(100vh - 96px); }
.main-content { flex: 1; padding: 30px 40px; max-width: 900px;}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.content-header h1 { font-size: 1.5rem; color: var(--text-color); }

.post-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
}
.post-btn:hover { background: var(--secondary-color); }

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>