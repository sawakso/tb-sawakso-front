<template>
  <article class="post-card" @click="$emit('click')">
    <div class="post-author">
      <img :src="avatar" class="author-avatar" />
      <span class="author-name">{{ username }}</span>
      <span class="post-time">{{ timeAgo }}</span>
    </div>

    <div class="post-body">
      <h3 class="post-title">{{ post.title }}</h3>

      <div class="post-media" v-if="post.media_type">
        <div v-if="post.media_type === 'image'" class="media-image" :style="{ aspectRatio: mediaRatio }">
          <img :src="post.media_url" :alt="post.title" @error="handleImgError" />
        </div>
        <div v-else-if="post.media_type === 'video'" class="media-video" :style="{ aspectRatio: mediaRatio }">
          <video :src="post.media_url" muted preload="metadata"></video>
          <div class="video-play"><i class="fas fa-play-circle"></i></div>
        </div>
        <div v-else-if="post.media_type === 'link'" class="media-link">
          <i class="fas fa-link"></i>
          <span>{{ post.media_url }}</span>
        </div>
      </div>

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
import { users } from '@/data/user.js'
import { bars } from '@/data/bars.js'

const props = defineProps({ post: Object })
defineEmits(['click'])

const avatar = computed(() => {
  const u = users.find(u => u.id === props.post.user_id)
  return u?.avatar || '/images/default-avatar.png'
})

const username = computed(() => {
  const u = users.find(u => u.id === props.post.user_id)
  return u?.username || '未知用户'
})

const excerpt = computed(() => {
  const text = props.post.content || ''
  return text.replace(/[#*`\n]/g, '').slice(0, 120) + '...'
})

const barName = computed(() => {
  const b = bars.find(b => b.id === props.post.bar_id)
  return b?.name || '未知贴吧'
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
.media-image {
  margin-bottom: 12px; border-radius: 8px; overflow: hidden;
  background: #1a1a2e; max-height: 300px;
  display: flex; align-items: center; justify-content: center;
}
.media-image img { width: 100%; height: 100%; object-fit: cover; }
.media-video {
  position: relative; margin-bottom: 12px; border-radius: 8px; overflow: hidden;
  background: #000; max-height: 300px;
  display: flex; align-items: center; justify-content: center;
}
.media-video video { width: 100%; height: 100%; object-fit: cover; }
.video-play {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem; color: white; opacity: 0.8;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
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