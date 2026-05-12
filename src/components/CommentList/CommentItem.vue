<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <!-- 头像 -->
    <img :src="authorAvatar" class="comment-avatar" />

    <div class="comment-body">
      <!-- 顶部：用户名 + 时间 -->
      <div class="comment-top">
        <span class="comment-author">{{ authorName }}</span>
        <span v-if="replyToUser" class="reply-tag">
          <i class="fas fa-reply"></i> 回复 @{{ replyToUser }}
        </span>
        <span class="comment-time">{{ timeAgo }}</span>
      </div>

      <!-- 内容 -->
      <p class="comment-content">{{ comment.content }}</p>

      <!-- 操作栏 -->
      <div class="comment-actions">
        <button
            class="action-btn"
            :class="{ active: comment.myReaction === 'like' }"
            @click="emit('react', comment.id, 'like')"
        >
          <i class="fas fa-thumbs-up"></i>
          <span v-if="comment.likeCount">{{ comment.likeCount }}</span>
        </button>

        <button
            class="action-btn"
            :class="{ active: comment.myReaction === 'dislike' }"
            @click="emit('react', comment.id, 'dislike')"
        >
          <i class="fas fa-thumbs-down"></i>
          <span v-if="comment.dislikeCount">{{ comment.dislikeCount }}</span>
        </button>

        <button
            class="action-btn"
            :class="{ active: comment.myReaction === 'question' }"
            @click="emit('react', comment.id, 'question')"
        >
          <i class="fas fa-question"></i>
          <span v-if="comment.questionCount">{{ comment.questionCount }}</span>
        </button>

        <button class="action-btn reply-btn" @click="handleReply">
          <i class="fas fa-comment"></i>
          回复
        </button>
      </div>

      <!-- 子回复（楼中楼） -->
      <div v-if="children && children.length" class="children">
        <CommentItem
            v-for="child in children"
            :key="child.id"
            :comment="child"
            :replyToUser="getUsername(child.reply_to)"
            :children="getChildren(child.id)"
            isReply
            @react="(id, type) => emit('react', id, type)"
            @reply="(comment, content) => emit('reply', comment, content)"
        />
      </div>

      <!-- 回复输入框（当前评论下方展开） -->
      <div v-if="showReplyInput" class="reply-input-box">
        <textarea
            v-model="replyContent"
            :placeholder="'回复 @' + authorName + '...'"
            rows="2"
            ref="replyInputRef"
        ></textarea>
        <div class="reply-input-actions">
          <span class="cancel-reply" @click="cancelReply">取消</span>
          <button class="submit-reply" :disabled="!replyContent.trim()" @click="submitReply">回复</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { users } from '@/data/user.js'

const props = defineProps({
  comment: Object,
  replyToUser: String,
  children: Array,
  isReply: Boolean,
  allComments: Array,
  activeReplyId: Number
})

const emit = defineEmits(['react', 'reply', 'toggleReply'])

const showReplyInput = ref(false)
const replyContent = ref('')
const replyInputRef = ref(null)

const authorAvatar = computed(() => {
  const u = users.find(u => u.id === props.comment.user_id)
  return u?.avatar || '/images/default-avatar.png'
})

const authorName = computed(() => {
  const u = users.find(u => u.id === props.comment.user_id)
  return u?.username || '未知用户'
})

const timeAgo = computed(() => {
  const now = Date.now()
  const postTime = new Date(props.comment.create_time).getTime()
  const diff = Math.floor((now - postTime) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  return Math.floor(diff / 86400) + '天前'
})

const getUsername = (userId) => {
  if (!userId) return ''
  const u = users.find(u => u.id === userId)
  return u?.username || '未知用户'
}

const getChildren = (parentId) => {
  if (!props.allComments) return []
  return props.allComments.filter(c => c.parent_id === parentId)
}

const handleReply = () => {
  const willOpen = !showReplyInput.value
  showReplyInput.value = willOpen
  if (willOpen) {
    emit('toggleReply', props.comment.id)
    nextTick(() => {
      replyInputRef.value?.focus()
    })
  } else {
    emit('toggleReply', null)
    replyContent.value = ''
  }
}

const cancelReply = () => {
  showReplyInput.value = false
  replyContent.value = ''
  emit('toggleReply', null)
}

watch(() => props.activeReplyId, (newId) => {
  if (newId !== props.comment.id) {
    showReplyInput.value = false
    replyContent.value = ''
  }
})
const submitReply = () => {
  if (!replyContent.value.trim()) return
  emit('reply', props.comment, replyContent.value.trim())
  replyContent.value = ''
  showReplyInput.value = false
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}
.comment-item.is-reply {
  margin-left: 40px;
  border-bottom: none;
  padding: 10px 0;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--primary-color);
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.comment-author {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}
.reply-tag {
  font-size: 0.8rem;
  color: var(--primary-color);
}
.reply-tag i {
  font-size: 0.7rem;
}
.comment-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.comment-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 8px;
  word-break: break-word;
}

/* 操作栏 */
.comment-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--transition);
}
.action-btn:hover {
  background: var(--surface-color);
  color: var(--text-color);
}
.action-btn.active {
  color: var(--primary-color);
  background: rgba(94, 129, 255, 0.1);
}
.action-btn i {
  font-size: 0.75rem;
}
.reply-btn {
  margin-left: 8px;
}

.children {
  margin-top: 8px;
  padding-left: 0;
}

/* 回复输入框 */
.reply-input-box {
  margin-top: 8px;
}
.reply-input-box textarea {
  width: 100%;
  padding: 10px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  font-size: 0.85rem;
  resize: vertical;
  outline: none;
}
.reply-input-box textarea:focus {
  border-color: var(--primary-color);
}
.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.cancel-reply {
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.submit-reply {
  padding: 4px 16px;
  background: var(--primary-color);
  border: none;
  border-radius: 14px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--transition);
}
.submit-reply:hover:not(:disabled) {
  background: var(--secondary-color);
}
.submit-reply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>