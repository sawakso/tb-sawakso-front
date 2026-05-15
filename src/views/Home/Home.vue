<template>
  <div class="home-layout">
    <Sidebar
        :user="user"
        :title="title"
        @openAuth="showAuth = true"
    />
    <main class="main-content" ref="mainContentRef">
      <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @click="goToPost(post.id)"
          @delete="handleDeletePost"
      />
    </main>
    <RightSidebar />
    <!-- 👇 加上登录弹窗 -->
    <AuthModal
        v-if="showAuth"
        @close="showAuth = false"
        @loginSuccess="showAuth = false"
    />
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
import AuthModal from "@/components/AuthModal/AuthModal.vue";

const router = useRouter()
const { user } = useUser()
const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const posts = ref([])

onMounted(async () => {
  posts.value = await postsApi.getAll()
  userStore.extractAndCacheUsers(posts.value)
})

const goToPost = (id) => router.push('/post/' + id)

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
.home-layout {
  display: flex;
  height: calc(100vh - 96px);
  overflow: hidden;
  gap: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 30px 40px;
  overflow-y: auto;

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main-content::-webkit-scrollbar {
  display: none;
}
</style>