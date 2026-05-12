<template>
  <div class="comment-section">
    <h3 class="comment-title">评论 ({{ commentList.length }})</h3>

    <div class="comment-input-box">
      <img :src="userAvatar" class="input-avatar" />
      <div class="input-area">
        <textarea v-model="newComment" placeholder="说点什么..." rows="3"></textarea>
        <div class="input-actions">
          <button class="submit-btn" :disabled="!newComment.trim()" @click="submitComment">发表</button>
        </div>
      </div>
    </div>

    <div class="comment-list" v-if="topLevelComments.length > 0">
      <CommentItem
          v-for="comment in topLevelComments"
          :key="comment.id"
          :comment="comment"
          :allComments="commentList"
          :activeReplyId="activeReplyId"
          @react="handleReact"
          @reply="handleReply"
          @toggleReply="handleToggleReply"
      />
    </div>

    <p v-else class="no-comment">暂无评论，来说两句吧</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CommentItem from './CommentItem.vue'
import { commentsApi } from '@/request/api/comments.js'

const props = defineProps({ postId: Number })

const newComment = ref('')
const activeReplyId = ref(null)
const commentsData = ref([])

const commentList = computed(() => commentsData.value)

const topLevelComments = computed(() => {
  return commentsData.value.filter(c => !c.parent_id)
})

const userAvatar = computed(() => '/images/user.png')

onMounted(async () => {
  console.log('CommentList postId:', props.postId)
  const data = await commentsApi.getByPostId(props.postId)
  console.log('评论数据:', data)
  commentsData.value = data
})
const handleReact = (commentId, type) => {
  const comment = commentsData.value.find(c => c.id === commentId)
  if (!comment) return
  if (comment.myReaction === type) {
    comment.myReaction = null
    if (type === 'like') comment.like_count--
    if (type === 'dislike') comment.dislike_count--
    if (type === 'question') comment.question_count--
  } else {
    if (comment.myReaction === 'like') comment.like_count--
    if (comment.myReaction === 'dislike') comment.dislike_count--
    if (comment.myReaction === 'question') comment.question_count--
    comment.myReaction = type
    if (type === 'like') comment.like_count++
    if (type === 'dislike') comment.dislike_count++
    if (type === 'question') comment.question_count++
  }
}

const handleReply = (comment, content) => {
  const newId = Math.max(...commentsData.value.map(c => c.id), 0) + 1
  commentsData.value.push({
    id: newId, post_id: props.postId, user_id: 1, content,
    parent_id: comment.parent_id || comment.id,
    reply_to: comment.user_id,
    create_time: new Date().toISOString(),
    like_count: 0, dislike_count: 0, question_count: 0
  })
  activeReplyId.value = null
}

const handleToggleReply = (commentId) => { activeReplyId.value = commentId }

const submitComment = () => {
  if (!newComment.value.trim()) return
  const newId = Math.max(...commentsData.value.map(c => c.id), 0) + 1
  commentsData.value.push({
    id: newId, post_id: props.postId, user_id: 1,
    content: newComment.value.trim(),
    parent_id: null, reply_to: null,
    create_time: new Date().toISOString(),
    like_count: 0, dislike_count: 0, question_count: 0
  })
  newComment.value = ''
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--primary-color);
}
.input-area {
  flex: 1;
}
.input-area textarea {
  width: 100%;
  padding: 12px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  font-size: 0.9rem;
  resize: vertical;
  outline: none;
  transition: var(--transition);
}
.input-area textarea:focus {
  border-color: var(--primary-color);
}
.input-area textarea::placeholder {
  color: var(--text-secondary);
}
.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}
.cancel-reply {
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.cancel-reply:hover {
  color: var(--text-color);
}
.submit-btn {
  padding: 6px 20px;
  background: var(--primary-color);
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
}
.submit-btn:hover:not(:disabled) {
  background: var(--secondary-color);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-list {
  border-top: 1px solid var(--border-color);
}
.no-comment {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 0;
  font-size: 0.9rem;
}
</style>