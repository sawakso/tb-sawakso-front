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

        <!-- 媒体内容（支持多图网格 + 视频） -->
        <div class="post-media" v-if="hasMedia">
          <!-- 多图网格布局 -->
          <div v-if="mediaImages.length > 1" class="detail-media-grid" :class="'detail-grid-' + Math.min(mediaImages.length, 9)">
            <div
                v-for="(url, idx) in mediaImages"
                :key="'img-' + idx"
                class="detail-grid-item"
                @click="openLightbox(idx)"
            >
              <img :src="url" :alt="post.title + ' 图' + (idx + 1)" loading="lazy" />
              <div class="grid-item-overlay"><i class="fas fa-search-plus"></i></div>
            </div>
          </div>

          <!-- 单图 -->
          <div v-else-if="mediaImages.length === 1" class="detail-single-image" @click="openLightbox(0)">
            <img :src="mediaImages[0]" :alt="post.title" />
            <div class="single-overlay"><i class="fas fa-expand"></i> 点击查看大图</div>
          </div>

          <!-- 视频 -->
          <div v-if="mediaVideo" class="detail-video-wrapper">
            <video
                ref="videoRef"
                :src="mediaVideo"
                controls
                :poster="mediaImages[0] || ''"
                class="detail-video-player"
                preload="metadata"
            ></video>
          </div>
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

    <!-- 图片灯箱/放大查看 -->
    <Teleport to="body">
      <div v-if="lightboxVisible" class="lightbox-overlay" @click.self="closeLightbox">
        <div class="lightbox-container">
          <!-- 关闭按钮 -->
          <button class="lightbox-close" @click="closeLightbox">&times;</button>

          <!-- 图片计数 -->
          <div class="lightbox-counter" v-if="mediaImages.length > 1">
            {{ lightboxIndex + 1 }} / {{ mediaImages.length }}
          </div>

          <!-- 上一张 -->
          <button
              v-if="mediaImages.length > 1"
              class="lightbox-arrow lightbox-prev"
              @click.stop="prevImage"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <!-- 主图 -->
          <div class="lightbox-image-wrap">
            <img
                :src="mediaImages[lightboxIndex]"
                :alt="'图片 ' + (lightboxIndex + 1)"
                class="lightbox-image"
                @error="handleLightboxImgError"
            />
          </div>

          <!-- 下一张 -->
          <button
              v-if="mediaImages.length > 1"
              class="lightbox-arrow lightbox-next"
              @click.stop="nextImage"
          >
            <i class="fas fa-chevron-right"></i>
          </button>

          <!-- 底部缩略图条 -->
          <div v-if="mediaImages.length > 1" class="lightbox-thumbs">
            <div
                v-for="(url, idx) in mediaImages"
                :key="'thumb-' + idx"
                class="lightbox-thumb"
                :class="{ active: idx === lightboxIndex }"
                @click.stop="lightboxIndex = idx"
            >
              <img :src="url" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import BarCard from '@/components/BarCard/BarCard.vue'
import CommentList from '@/components/CommentList/CommentList.vue'
import { useUser } from '@/composables/useUser'
import { useUserStore } from '@/stores/user'
import { barsApi } from '@/request/api/bars.js'
import { postsApi } from '@/request/api/posts.js'
import { reactionsApi } from '@/request/api/reactions.js'

const route = useRoute()
const { user } = useUser()
const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const liked = ref(false)
const post = ref(null)
const relatedPosts = ref([])
const allBars = ref([])
const videoRef = ref(null)

// 评论组件引用
const commentListRef = ref(null)

// ====== 灯箱状态 ======
const lightboxVisible = ref(false)
const lightboxIndex = ref(0)

const currentBar = computed(() => {
  if (!post.value) return null
  return allBars.value.find(b => b.id === post.value.bar_id)
})

onMounted(async () => {
  post.value = await postsApi.getById(route.params.id)
  // 将帖子作者信息存入用户缓存池
  userStore.extractAndCacheUsers(post.value)
  const allBarPosts = await postsApi.getAll({ barId: post.value.bar_id })
  // 相关帖子的用户信息也缓存
  userStore.extractAndCacheUsers(allBarPosts)
  relatedPosts.value = allBarPosts.filter(p => p.id !== post.value.id).slice(0, 5)
  allBars.value = await barsApi.getAll()
})

const authorName = computed(() => {
  if (!post.value) return ''
  const u = userStore.getUser(post.value.user_id)
  return u?.nickname || u?.username || `用户${post.value.user_id}`
})

const authorAvatar = computed(() => {
  if (!post.value) return '/images/default-avatar.png'
  const u = userStore.getUser(post.value.user_id)
  return u?.avatar || '/images/default-avatar.png'
})

const barName = computed(() => {
  const b = allBars.value.find(b => b.id === post.value?.bar_id)
  return b?.name || ''
})

// ====== 多图/视频 URL 解析 ======
// media_url 新格式: "url1,url2,url3" (纯图片) 或 "url1,url2|videoUrl" (图+视频)
const parsedMedia = computed(() => {
  if (!post.value?.media_url) return { images: [], video: null }
  const url = post.value.media_url

  // 含 | 表示有视频
  if (url.includes('|')) {
    const parts = url.split('|')
    return {
      images: parts[0] ? parts[0].split(',').filter(Boolean) : [],
      video: parts[1] || null
    }
  }
  // 纯逗号分隔 = 多图
  if (url.includes(',')) {
    return { images: url.split(',').filter(Boolean), video: null }
  }
  // 单 URL（旧格式）
  return { images: [url], video: null }
})

const mediaImages = computed(() => parsedMedia.value.images)
const mediaVideo = computed(() => parsedMedia.value.video)
const hasMedia = computed(() =>
  post.value?.media_type && (mediaImages.value.length > 0 || mediaVideo.value)
)

// ====== 灯箱操作 ======
const openLightbox = (index = 0) => {
  lightboxIndex.value = index
  lightboxVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxVisible.value = false
  document.body.style.overflow = ''
}

const prevImage = () => {
  lightboxIndex.value = (lightboxIndex.value - 1 + mediaImages.value.length) % mediaImages.value.length
}

const nextImage = () => {
  lightboxIndex.value = (lightboxIndex.value + 1) % mediaImages.value.length
}

const handleLightboxImgError = (e) => {
  e.target.src = '/images/default-avatar.png'
}

// 键盘导航
const handleKeydown = (e) => {
  if (!lightboxVisible.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

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

/* ====== 帖子详情媒体区域 ====== */
.post-media {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}

/* --- 多图网格 --- */
.detail-media-grid {
  display: grid;
  gap: 4px;
  background: #111;
  border-radius: 10px;
  padding: 4px;
  max-height: 500px;
  overflow: hidden;
}

/* 根据数量动态调整网格 */
.detail-grid-2,
.detail-grid-3,
.detail-grid-4,
.detail-grid-5,
.detail-grid-6,
.detail-grid-7,
.detail-grid-8,
.detail-grid-9 {
  grid-template-columns: repeat(3, 1fr);
}

.detail-grid-2 .detail-grid-item:first-child { grid-column: span 2; grid-row: span 2; }
.detail-grid-3 .detail-grid-item:first-child { grid-column: span 2; grid-row: span 2; }
.detail-grid-4 .detail-grid-item:first-child { grid-column: span 2; grid-row: span 2; }

.detail-grid-5 .detail-grid-item:nth-child(-n+2),
.detail-grid-8 .detail-grid-item:nth-child(1),
.detail-grid-9 .detail-grid-item:nth-child(1) {
  grid-column: span 2; grid-row: span 2;
}

/* 超过9张时限制显示高度，允许滚动 */
.detail-grid-5,
.detail-grid-6,
.detail-grid-7,
.detail-grid-8,
.detail-grid-9 {
  max-height: 600px;
  overflow-y: auto;
}

.detail-grid-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 4px;
  min-height: 100px;
  aspect-ratio: 1;
  background: #1a1a2e;
}

.detail-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}
.detail-grid-item:hover img { transform: scale(1.06); }

.grid-item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s;
  color: white;
  font-size: 1.5rem;
  opacity: 0;
}
.detail-grid-item:hover .grid-item-overlay {
  background: rgba(0,0,0,0.3);
  opacity: 1;
}

/* --- 单图 --- */
.detail-single-image {
  position: relative;
  cursor: pointer;
  border-radius: 10px;
  overflow: hidden;
  background: #1a1a2e;
  max-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-single-image img {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  transition: transform 0.3s;
}
.detail-single-image:hover img { transform: scale(1.02); }

.single-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.55);
  color: white;
  font-size: 0.78rem;
  padding: 5px 12px;
  border-radius: 14px;
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.25s;
}
.detail-single-image:hover .single-overlay { opacity: 1; }

/* --- 视频播放器 --- */
.detail-video-wrapper {
  margin-top: 12px;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
}
.detail-video-player {
  width: 100%;
  max-height: 500px;
  display: block;
  border-radius: 10px;
  outline: none;
  /* 自定义视频控件颜色 */
  --controls-bg: rgba(26,26,46,0.85);
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

/* ====== 灯箱样式 ====== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-container {
  position: relative;
  width: 90vw;
  max-width: 1100px;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 2.2rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  z-index: 10;
}
.lightbox-close:hover { opacity: 1; }

.lightbox-counter {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.75);
  font-size: 0.88rem;
}

.lightbox-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}
.lightbox-arrow:hover { background: rgba(255,255,255,0.28); }
.lightbox-prev { left: -24px; }
.lightbox-next { right: -24px; }

.lightbox-image-wrap {
  max-width: 100%;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  /* 淡入动画 */
  animation: imageIn 0.3s ease;
}
@keyframes imageIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* 底部缩略图 */
.lightbox-thumbs {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  max-width: 70vw;
  overflow-x: auto;
  padding: 6px;
}
.lightbox-thumbs::-webkit-scrollbar { height: 4px; }
.lightbox-thumbs::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }

.lightbox-thumb {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.45;
  transition: all 0.2s;
  flex-shrink: 0;
}
.lightbox-thumb.active {
  border-color: var(--primary-color);
  opacity: 1;
}
.lightbox-thumb:hover { opacity: 0.85; }
.lightbox-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
