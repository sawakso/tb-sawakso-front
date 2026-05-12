<template>
  <div class="bar-card" @click="goToBar">
    <!-- 吧头像 -->
    <div class="bar-avatar">
      <img
          :src="bar.avatar || '/images/default-avatar.png'"
          :alt="bar.name"
          @error="e => e.target.src = '/images/default-avatar.png'"
      />
    </div>

    <!-- 吧信息 -->
    <div class="bar-info">
      <h4 class="bar-name">{{ bar.name }}</h4>
      <p class="bar-desc">{{ bar.description || '暂无简介' }}</p>
      <div class="bar-stats">
        <span><i class="fas fa-users"></i> {{ bar.memberCount || 0 }}</span>
        <span><i class="fas fa-file-alt"></i> {{ bar.postCount || 0 }}</span>
      </div>
    </div>

    <!-- 关注按钮 -->
    <button class="join-btn" @click.stop="handleJoin" v-if="showJoin">
      <i :class="joined ? 'fas fa-check' : 'fas fa-plus'"></i>
      {{ joined ? '已关注' : '关注' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  bar: {
    type: Object,
    required: true
  },
  showJoin: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const joined = ref(false)

const goToBar = () => {
  router.push('/bar/' + props.bar.id)
}

const handleJoin = () => {
  joined.value = !joined.value
}
</script>

<style scoped>
.bar-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
}
.bar-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

/* 吧头像 */
.bar-avatar {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--primary-color);
  flex-shrink: 0;
}
.bar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 吧信息 */
.bar-info {
  flex: 1;
  min-width: 0;
}
.bar-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 4px;
}
.bar-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-stats {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.bar-stats i {
  font-size: 0.7rem;
  margin-right: 3px;
}

/* 关注按钮 */
.join-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  border: 1px solid var(--primary-color);
  border-radius: 16px;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.8rem;
  transition: var(--transition);
  align-self: center;
}
.join-btn:hover {
  background: var(--primary-color);
  color: white;
}
</style>