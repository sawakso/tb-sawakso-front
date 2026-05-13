<template>
  <div class="comment-section">
    <h3 class="comment-title">评论 ({{ commentList.length }})</h3>

    <div class="comment-input-box" v-if="user">
      <img :src="userAvatar" class="input-avatar" />
      <div class="input-area">
        <textarea v-model="newComment" placeholder="说点什么..." rows="3"></textarea>
        <div class="input-actions">
          <button class="submit-btn" :disabled="!newComment.trim() || submitting" @click="submitComment">
            {{ submitting ? '发表中...' : '发表' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="login-hint" @click="$emit('needLogin')">
      <i class="fas fa-sign-in-alt"></i> 登录后参与评论
    </div>

    <div class="comment-list" v-if="topLevelComments.length > 0">
      <CommentItem
          v-for="comment in topLevelComments"
          :key="comment.id"
          :comment="comment"
          :allComments="commentList"
          :activeReplyId="activeReplyId"
          :currentUserId="currentUserId"
          @react="handleReact"
          @reply="handleReply"
          @toggleReply="handleToggleReply"
      />
    </div>

    <p v-else class="no-comment">暂无评论，来说两句吧</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CommentItem from './CommentItem.vue'
import { commentsApi } from '@/request/api/comments.js'
import { reactionsApi } from '@/request/api/reactions.js'
import { useUser } from '@/composables/useUser'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

defineEmits(['needLogin'])

const { user } = useUser()
const userStore = useUserStore()
const newComment = ref('')
const activeReplyId = ref(null)
const commentsData = ref([])
const submitting = ref(false)

const currentUserId = computed(() => user.value?.id)

const commentList = computed(() => commentsData.value)

const topLevelComments = computed(() => {
  return commentsData.value.filter(c => !c.parent_id)
})

const userAvatar = computed(() => user.value?.avatar || '/images/user.png')

// 加载评论
const fetchComments = async () => {
  const data = await commentsApi.getByPostId(props.postId)
  commentsData.value = Array.isArray(data) ? data : []
  // 将评论中的用户信息填充到缓存池
  userStore.extractAndCacheUsers(commentsData.value)
}

onMounted(fetchComments)

watch(() => props.postId, (newVal) => {
  if (newVal) fetchComments()
})

// 提供外部刷新方法（父组件可调用）
defineExpose({ refresh: fetchComments })

// 发表顶级评论
const submitComment = async () => {
  if (!newComment.value.trim() || submitting.value) return
  if (!user.value) {
    // 未登录，通知父组件弹出登录框
    return
  }

  submitting.value = true
  try {
    await commentsApi.create(props.postId, {
      content: newComment.value.trim()
    })
    newComment.value = ''
    await fetchComments()
  } catch (e) {
    console.error('评论失败:', e)
    alert(e.response?.data?.message || '评论失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 回复某条评论
const handleReply = async (targetComment, content) => {
  if (!content.trim() || !user.value) return

  submitting.value = true
  try {
    await commentsApi.create(props.postId, {
      content: content.trim(),
      parent_id: targetComment.parent_id || targetComment.id,
      reply_to: targetComment.user_id
    })
    activeReplyId.value = null
    await fetchComments()
  } catch (e) {
    console.error('回复失败:', e)
    alert(e.response?.data?.message || '回复失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 态度（赞/踩/问号）
const handleReact = async (commentId, type) => {
  if (!user.value) return

  try {
    await reactionsApi.toggle({
      target_type: 'comment',
      target_id: commentId,
      reaction_type: type
    })
    // 刷新评论列表以获取最新计数
    await fetchComments()
  } catch (e) {
    console.error('态度操作失败:', e)
  }
}

const handleToggleReply = (commentId) => {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId
}
</script>

<style scoped>
.comment-section {
  margin-top: 30px;
}
.comment-title {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: var(--text-color);
}

/* 输入框 */
.comment-input-box {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.input-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid var(--primary-color);
}
.input-area { flex: 1; }
.input-area textarea {
  width: 100%; padding: 12px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px; color: var(--text-color);
  font-size: 0.9rem; resize: vertical;
  outline: none; transition: border-color 0.2s;
  box-sizing: border-box; font-family: inherit;
}
.input-area textarea:focus { border-color: var(--primary-color); }
.input-area textarea::placeholder { color: var(--text-secondary); }
.input-actions {
  display: flex; justify-content: flex-end;
  align-items: center; gap: 12px; margin-top: 8px;
}
.submit-btn {
  padding: 6px 20px; background: var(--primary-color); border: none;
  border-radius: 20px; color: white; cursor: pointer;
  font-size: 0.9rem; transition: all 0.2s;
}
.submit-btn:hover:not(:disabled) { background: var(--secondary-color); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.login-hint {
  text-align: center; padding: 20px;
  background: var(--surface-color); border: 1px dashed var(--border-color);
  border-radius: 8px; color: var(--text-secondary);
  cursor: pointer; font-size: 0.9rem; margin-bottom: 24px;
  transition: all 0.2s;
}
.login-hint:hover { border-color: var(--primary-color); color: var(--primary-color); }

.comment-list {
  border-top: 1px solid var(--border-color);
}
.no-comment {
  text-align: center; color: var(--text-secondary);
  padding: 40px 0; font-size: 0.9rem;
}
</style>
