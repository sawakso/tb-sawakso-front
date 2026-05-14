<template>
  <article class="post-card" @click="$emit('click')">
    <div class="post-author">
      <img :src="avatar" class="author-avatar" />
      <span class="author-name">{{ username }}</span>
      <span class="post-time">{{ timeAgo }}</span>
    </div>

    <div class="post-body">
      <h3 class="post-title">{{ post.title }}</h3>

      <!-- 媒体内容：图片 / 视频 / 多图 -->
      <div class="post-media" v-if="hasMedia">
        <!-- 多图网格 -->
        <div v-if="mediaImages.length > 1" class="media-grid" :class="'grid-' + Math.min(mediaImages.length, 4)">
          <div v-for="(url, idx) in displayedImages" :key="'img-' + idx" class="grid-item">
            <img :src="url" :alt="post.title + ' 图' + (idx + 1)" loading="lazy" @error="handleImgError" />
          </div>
          <!-- 超出部分显示数量 -->
          <div v-if="mediaImages.length > 4" class="grid-item grid-more">
            <span>+{{ mediaImages.length - 4 }}</span>
          </div>
        </div>

        <!-- 单图 -->
        <div v-else-if="mediaImages.length === 1" class="media-image" :style="{ aspectRatio: mediaRatio }">
          <img :src="mediaImages[0]" :alt="post.title" @error="handleImgError" />
        </div>

        <!-- 视频（无图或图+视频时优先展示视频封面） -->
        <div v-else-if="mediaVideo" class="media-video" :style="{ aspectRatio: mediaRatio }">
          <video :src="mediaVideo" muted preload="metadata"></video>
          <div class="video-play"><i class="fas fa-play-circle"></i></div>
          <span v-if="mediaImages.length > 0" class="video-badge"><i class="fas fa-images"></i> {{ mediaImages.length }}</span>
        </div>
      </div>

      <!-- 无媒体时显示文字摘要 -->
      <p v-else class="post-excerpt">{{ excerpt }}</p>
    </div>

    <div class="post-meta">
      <span class="meta-bar"><i class="fas fa-th-large"></i> {{ barName }}</span>
      <span class="meta-item"><i class="fas fa-eye"></i> {{ post.view_count }}</span>
      <span class="meta-item"><i class="fas fa-heart"></i> {{ post.like_count }}</span>
      <span class="meta-item"><i class="fas fa-comment"></i> {{ post.comment_count }}</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({ post: Object })
defineEmits(['click'])

const userStore = useUserStore()

const avatar = computed(() => {
  const u = userStore.getUser(props.post.user_id)
  return u?.avatar || '/images/default-avatar.png'
})

const username = computed(() => {
  const u = userStore.getUser(props.post.user_id)
  return u?.nickname || u?.username || `用户${props.post.user_id}`
})

const excerpt = computed(() => {
  const text = props.post.content || ''
  return text.replace(/[#*`\n]/g, '').slice(0, 120) + '...'
})

const barName = computed(() => {
  return props.post.bar_name || '未知贴吧'
})

// ====== 多图/视频 URL 解析 ======
// media_url 新格式: "url1,url2,url3" (纯图片) 或 "url1,url2|videoUrl" (图+视频)
// 旧格式: "single_url"
const parsedMedia = computed(() => {
  const url = props.post.media_url
  if (!url) return { images: [], video: null }

  // 新格式：包含 | 分隔符表示有视频
  if (url.includes('|')) {
    const parts = url.split('|')
    const imagePart = parts[0]
    const videoPart = parts[1]
    return {
      images: imagePart ? imagePart.split(',').filter(Boolean) : [],
      video: videoPart || null
    }
  }

  // 逗号分隔的多图（新格式纯图片）
  if (url.includes(',')) {
    return { images: url.split(',').filter(Boolean), video: null }
  }

  // 旧格式单 URL
  return { images: [url], video: null }
})

const mediaImages = computed(() => parsedMedia.value.images)
const mediaVideo = computed(() => parsedMedia.value.video)

// 卡片最多显示 4 张图
const displayedImages = computed(() => mediaImages.value.slice(0, 4))

// 是否有媒体内容（宽松判断：有图或有视频都算）
const hasMedia = computed(() => mediaImages.value.length > 0 || mediaVideo.value)

// 帖子主要类型（用于确定卡片展示优先级）
// 有视频 → 展示视频封面；有多图 → 展示图片网格；单图 → 展示大图
const primaryType = computed(() => {
  if (mediaVideo.value && mediaImages.value.length === 0) return 'video-only'
  if (mediaVideo.value && mediaImages.value.length > 0) return 'mixed'
  if (mediaImages.value.length > 1) return 'multi-image'
  if (mediaImages.value.length === 1) return 'single-image'
  return null
})

const mediaRatio = computed(() => {
  const w = props.post.media_width
  const h = props.post.media_height
  if (!w || !h) return '16/9'
  const r = w / h
  if (r > 1.5) return '16/9'
  if (r < 0.8) return '3/4'
  return '4/3'
})

const timeAgo = computed(() => {
  const diff = Math.floor((Date.now() - new Date(props.post.create_time).getTime()) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  return Math.floor(diff / 86400) + '天前'
})

const handleImgError = (e) => {
  e.target.src = '/images/default-avatar.png'
}
</script>

<style scoped>
.post-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 20px;
}
.post-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.author-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
}
.author-name { font-weight: 500; font-size: 0.9rem; color: var(--text-color); }
.post-time { margin-left: auto; font-size: 0.8rem; color: var(--text-secondary); }
.post-title {
  font-size: 1.15rem; font-weight: 600; color: var(--text-color);
  margin-bottom: 10px; line-height: 1.4;
}
.post-excerpt { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

/* ====== 媒体区域通用 ====== */
.post-media {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

/* ====== 单图 ====== */
.media-image {
  background: #1a1a2e;
  max-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-image img { width: 100%; height: 100%; object-fit: cover; }

/* ====== 视频预览 ====== */
.media-video {
  position: relative;
  background: #000;
  max-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-video video { width: 100%; height: 100%; object-fit: cover; }
.video-play {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem; color: white; opacity: 0.85;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
  transition: opacity 0.2s;
}
.post-card:hover .video-play { opacity: 1; }
.video-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.65);
  color: white;
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
}
.video-badge i { margin-right: 3px; }

/* ====== 多图网格 ====== */
.media-grid {
  display: grid;
  gap: 3px;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
  max-height: 280px;
}

/* 网格布局：根据图片数量决定排列方式 */
.grid-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
.grid-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.grid-3 .grid-item:first-child { grid-row: span 2; }
.grid-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.grid-item {
  position: relative;
  overflow: hidden;
  background: #111;
  min-height: 80px;
}
.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.grid-item:hover img { transform: scale(1.05); }

.grid-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.65);
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
}

/* 链接类型 */
.media-link {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: 8px;
  margin-bottom: 12px; font-size: 0.85rem; color: var(--primary-color); overflow: hidden;
}
.media-link span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.post-meta {
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  font-size: 0.82rem; color: var(--text-secondary);
  margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);
}
.meta-bar { color: var(--primary-color); font-weight: 500; }
.meta-item { display: flex; align-items: center; gap: 4px; }
.meta-item i { font-size: 0.75rem; }
</style>
