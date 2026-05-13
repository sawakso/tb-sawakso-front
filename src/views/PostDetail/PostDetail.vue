<template>
  <div class="post-layout">
    <!-- 左侧边栏 -->
    <Sidebar
        :user="user"
        :title="title"
        @openAuth="showAuth = true"
    />

    <!-- 中间主内容 -->
    <main class="main-content">
      <!-- 返回 + 面包屑 -->
      <div class="content-top">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <div class="breadcrumb">
          <router-link to="/">首页</router-link>
          <span>/</span>
          <router-link :to="'/bar/' + post?.bar_id">{{ barName }}</router-link>
          <span>/</span>
          <span>帖子详情</span>
        </div>
      </div>

      <!-- 帖子内容 -->
      <article v-if="post" class="post-detail">
        <h1 class="post-title">{{ post.title }}</h1>

        <div class="post-author-bar">
          <img :src="authorAvatar" class="author-avatar" />
          <div class="author-info">
            <span class="author-name">{{ authorName }}</span>
            <span class="post-time">{{ timeAgo }}</span>
          </div>
          <button class="follow-btn" v-if="user">
            <i class="fas fa-plus"></i> 关注
          </button>
        </div>

        <!-- 媒体内容 -->
        <div class="post-media" v-if="post.media_type">
          <img
              v-if="post.media_type === 'image'"
              :src="post.media_url"
              :alt="post.title"
              class="media-full"
              @error="e => e.target.style.display = 'none'"
          />
          <video
              v-else-if="post.media_type === 'video'"
              :src="post.media_url"
              controls
              class="media-full"
          ></video>
        </div>

        <!-- 正文 -->
        <div class="post-content" v-html="renderedContent"></div>

        <!-- 操作栏 -->
        <div class="post-actions">
          <button class="action-btn" @click="handleLike">
            <i :class="['fas', 'fa-heart', liked && 'liked']"></i>
            <span>{{ post.like_count }}</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-star"></i>
            <span>收藏</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-share"></i>
            <span>分享</span>
          </button>
        </div>
      </article>

      <!-- 评论区 -->
      <CommentList v-if="post" :postId="post.id" ref="commentListRef" @needLogin="showAuth = true" />
    </main>

    <!-- 右侧边栏 -->
    <aside class="right-sidebar">
      <!-- 吧信息 -->
      <BarCard v-if="currentBar" :bar="currentBar" />

      <!-- 相关帖子 -->
      <div class="card">
        <h4>相关帖子</h4>
        <div class="related-posts">
          <router-link
              v-for="rp in relatedPosts"
              :key="rp.id"
              :to="'/post/' + rp.id"
              class="related-item"
          >
            <span class="related-title">{{ rp.title }}</span>
            <span class="related-meta">
              <i class="fas fa-eye"></i> {{ rp.view_count }}
              <i class="fas fa-comment"></i> {{ rp.comment_count }}
            </span>
          </router-link>
          <p v-if="relatedPosts.length === 0" class="no-related">暂无相关帖子</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import BarCard from '@/components/BarCard/BarCard.vue'
import CommentList from '@/components/CommentList/CommentList.vue'
import { useUser } from '@/composables/useUser'
import { barsApi } from '@/request/api/bars.js'
import { postsApi } from '@/request/api/posts.js'
import { reactionsApi } from '@/request/api/reactions.js'

const route = useRoute()
const { user } = useUser()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const liked = ref(false)
const post = ref(null)
const relatedPosts = ref([])
const allBars = ref([])

// 评论组件引用
const commentListRef = ref(null)

const currentBar = computed(() => {
  if (!post.value) return null
  return allBars.value.find(b => b.id === post.value.bar_id)
})

onMounted(async () => {
  post.value = await postsApi.getById(route.params.id)
  const allBarPosts = await postsApi.getAll({ barId: post.value.bar_id })
  relatedPosts.value = allBarPosts.filter(p => p.id !== post.value.id).slice(0, 5)
  allBars.value = await barsApi.getAll()
})

const authorName = computed(() => {
  if (!post.value) return ''
  return post.value.nickname || post.value.username || `用户${post.value.user_id}`
})

const authorAvatar = computed(() => {
  if (!post.value) return '/images/default-avatar.png'
  return post.value.avatar || '/images/default-avatar.png'
})

const barName = computed(() => {
  const b = allBars.value.find(b => b.id === post.value?.bar_id)
  return b?.name || ''
})

const timeAgo = computed(() => {
  if (!post.value) return ''
  const diff = Math.floor((Date.now() - new Date(post.value.create_time).getTime()) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  return Math.floor(diff / 86400) + '天前'
})

const renderedContent = computed(() => {
  if (!post.value) return ''
  return post.value.content
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\n/g, '<br>')
})

const handleLike = async () => {
  if (!user.value) { showAuth.value = true; return }
  try {
    const res = await reactionsApi.toggle({
      target_type: 'post',
      target_id: post.value.id,
      reaction_type: 'like'
    })
    // 更新本地状态和计数
    if (res.action === 'removed' || (res.action && res.action !== 'added' && res.action !== 'switched')) {
      liked.value = false
      post.value.like_count = Math.max((post.value.like_count || 0) - 1, 0)
    } else {
      liked.value = true
      post.value.like_count = (post.value.like_count || 0) + 1
    }
  } catch (e) {
    console.error('点赞失败:', e)
  }
}
</script>

<style scoped>
.post-layout {
  display: flex;
  min-height: calc(100vh - 96px);
}

/* 中间主内容 */
.main-content {
  flex: 1;
  padding: 30px 40px;
  max-width: 900px;
}

.content-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.back-btn {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
}
.back-btn:hover { border-color: var(--primary-color); }
.breadcrumb {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.breadcrumb a { color: var(--primary-color); text-decoration: none; }
.breadcrumb span { margin: 0 6px; }

/* 帖子 */
.post-detail {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 30px;
}
.post-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
}
.post-author-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}
.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
}
.author-info { flex: 1; }
.author-name { font-weight: 600; display: block; }
.post-time { font-size: 0.8rem; color: var(--text-secondary); }
.follow-btn {
  padding: 6px 16px;
  border: 1px solid var(--primary-color);
  border-radius: 16px;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.85rem;
}

.media-full {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 20px;
  background: #1a1a2e;
  display: block;
  min-height: 200px;
}

.post-content {
  line-height: 1.8;
  font-size: 0.95rem;
}
.post-content :deep(h2) { margin: 20px 0 10px; }
.post-content :deep(h3) { margin: 16px 0 8px; }
.post-content :deep(pre) {
  background: #1a1a2e;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

/* 操作栏 */
.post-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
}
.action-btn:hover { border-color: var(--primary-color); color: var(--text-color); }
.liked { color: var(--secondary-color); }

/* 右侧边栏 */
.right-sidebar {
  width: 280px;
  min-width: 280px;
  padding: 30px 20px;
  border-left: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 96px;
  height: calc(100vh - 96px);
  overflow-y: auto;
}
.card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  margin-bottom: 20px;
}
.card h4 {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}
.related-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 0;
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}
.related-item:last-child { border-bottom: none; }
.related-item:hover .related-title { color: var(--primary-color); }
.related-title {
  font-size: 0.88rem;
  color: var(--text-color);
  line-height: 1.4;
}
.related-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 10px;
}
.related-meta i {
  font-size: 0.7rem;
  margin-right: 2px;
}
.no-related {
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 8px 0;
}
</style>