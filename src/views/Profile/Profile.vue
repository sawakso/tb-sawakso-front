<template>
  <div class="profile-layout">
    <Sidebar :user="user" :title="title" @openAuth="showAuth = true" />

    <main class="main-content">
      <!-- 用户头部 -->
      <div class="profile-header">
        <div class="profile-left">
          <img :src="userStore.userInfo?.avatar || '/images/default-avatar.png'" class="profile-avatar" />
          <div class="mini-stats">
            <span @click="tab = 'following'"><strong>{{ userStore.followStats.following }}</strong> 关注</span>
            <span @click="tab = 'followers'"><strong>{{ userStore.followStats.followers }}</strong> 粉丝</span>
          </div>
        </div>
        <div class="profile-center">
          <h1>{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</h1>
          <p class="profile-username">@{{ userStore.userInfo?.username }}</p>
        </div>
        <button class="edit-btn" @click="showEdit = true">
          <i class="fas fa-edit"></i> 编辑资料
        </button>
      </div>

      <!-- 数据统计 — 可点击切换 -->
      <div class="stats-row">
        <div class="stat-card" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
          <span class="stat-num">{{ userStore.myPosts.length }}</span>
          <span class="stat-label">帖子</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'comments' }" @click="tab = 'comments'">
          <span class="stat-num">{{ userStore.myComments.length }}</span>
          <span class="stat-label">回复</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'likes' }" @click="tab = 'likes'">
          <span class="stat-num">{{ userStore.totalLikes }}</span>
          <span class="stat-label">获赞</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'bars' }" @click="tab = 'bars'">
          <span class="stat-num">{{ userStore.myBars.length }}</span>
          <span class="stat-label">关注的吧</span>
        </div>
      </div>

      <!-- 二级菜单（获赞时展开） -->
      <div class="sub-tabs" v-if="tab === 'likes'">
        <button :class="{ active: likeTab === 'posts' }" @click="likeTab = 'posts'">帖子获赞</button>
        <button :class="{ active: likeTab === 'comments' }" @click="likeTab = 'comments'">评论获赞</button>
      </div>

      <!-- 我的帖子 -->
      <div v-if="tab === 'posts'" class="tab-content">
        <PostCard v-for="p in userStore.myPosts" :key="p.id" :post="p" @click="$router.push('/post/' + p.id)" />
        <p v-if="userStore.myPosts.length === 0" class="empty">暂无帖子</p>
      </div>

      <!-- 我的回复 -->
      <div v-if="tab === 'comments'" class="tab-content">
        <div v-for="c in userStore.myComments" :key="c.id" class="comment-row" @click="$router.push('/post/' + c.post_id)">
          <p class="comment-text">{{ c.content }}</p>
          <span class="comment-meta">回复于 · {{ c.post_title || '未知帖子' }}</span>
        </div>
        <p v-if="userStore.myComments.length === 0" class="empty">暂无回复</p>
      </div>

      <!-- 关注的吧 -->
      <div v-if="tab === 'bars'" class="tab-content bars-grid">
        <BarCard v-for="b in userStore.myBars" :key="b.id" :bar="b" :showJoin="false" />
        <p v-if="userStore.myBars.length === 0" class="empty">还没关注任何吧</p>
      </div>

      <!-- 获赞 -->
      <div v-if="tab === 'likes'" class="tab-content">
        <template v-if="likeTab === 'posts'">
          <PostCard v-for="p in userStore.likedPosts" :key="p.id" :post="p" @click="$router.push('/post/' + p.id)" />
          <p v-if="userStore.likedPosts.length === 0" class="empty">暂无帖子获赞</p>
        </template>
        <template v-if="likeTab === 'comments'">
          <div v-for="c in userStore.likedComments" :key="c.id" class="comment-row" @click="$router.push('/post/' + c.post_id)">
            <p class="comment-text">{{ c.content }}</p>
            <span class="comment-meta">获赞 {{ c.like_count }} · {{ c.post_title || '未知帖子' }}</span>
          </div>
          <p v-if="userStore.likedComments.length === 0" class="empty">暂无评论获赞</p>
        </template>
      </div>

      <!-- 我关注的人 -->
      <div v-if="tab === 'following'" class="tab-content">
        <div v-for="u in userStore.followingList" :key="u.id" class="user-row">
          <img :src="u.avatar || '/images/default-avatar.png'" class="user-row-avatar" />
          <span class="user-row-name">{{ u.nickname || u.username }}</span>
          <button class="unfollow-btn" @click="handleUnfollowUser(u)">取消关注</button>
        </div>
        <p v-if="userStore.followingList.length === 0" class="empty">还没关注任何人</p>
      </div>

      <!-- 关注我的人 -->
      <div v-if="tab === 'followers'" class="tab-content">
        <div v-for="u in userStore.followerList" :key="u.id" class="user-row">
          <img :src="u.avatar || '/images/default-avatar.png'" class="user-row-avatar" />
          <span class="user-row-name">{{ u.nickname || u.username }}</span>
        </div>
        <p v-if="userStore.followerList.length === 0" class="empty">暂无粉丝</p>
      </div>
    </main>
    <EditProfile
        v-if="showEdit"
        :user="userStore.userInfo"
        @close="showEdit = false"
        @update="handleUpdateProfile"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PostCard from '@/components/PostCard/PostCard.vue'
import BarCard from '@/components/BarCard/BarCard.vue'
import EditProfile from '@/components/EditProfile/EditProfile.vue'
import { useUser } from '@/composables/useUser'
import { useUserStore } from '@/stores/user.js'

const { user } = useUser()
const userStore = useUserStore()
const title = import.meta.env.VITE_APP_TITLE

const showAuth = ref(false)
const showEdit = ref(false)
const tab = ref('posts')
const likeTab = ref('posts')

// 取关用户（调用 store action）
const handleUnfollowUser = async (targetUser) => {
  try {
    await userStore.unfollowUser(targetUser)
  } catch (e) {
    console.error('取关失败:', e)
  }
}

// 编辑资料后刷新
const handleUpdateProfile = async () => {
  showEdit.value = false
  await userStore.fetchProfile()
}

onMounted(async () => {
  showEdit.value = false
  // 一键加载所有个人中心数据
  await userStore.fetchAllProfileData()
})
</script>

<style scoped>
.profile-layout { display: flex; min-height: calc(100vh - 96px); }
.main-content { flex: 1; padding: 30px 40px; max-width: 800px; }

.profile-header {
  display: flex; align-items: center; gap: 24px;
  padding: 30px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: var(--border-radius);
  margin-bottom: 20px;
}
.profile-left {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); }
.mini-stats {
  display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-secondary);
}
.mini-stats span { cursor: pointer; }
.mini-stats span:hover { color: var(--primary-color); }
.mini-stats strong { color: var(--text-color); }
.profile-center { flex: 1; }
.profile-center h1 { font-size: 1.3rem; margin-bottom: 2px; }
.profile-username { color: var(--text-secondary); font-size: 0.85rem; }
.edit-btn {
  margin-left: auto; padding: 8px 20px; border: 1px solid var(--primary-color);
  border-radius: 20px; background: transparent; color: var(--primary-color);
  cursor: pointer; font-size: 0.9rem; transition: var(--transition);
}
.edit-btn:hover { background: var(--primary-color); color: #fff; }

.stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.stat-card {
  display: flex; flex-direction: column; align-items: center; padding: 14px 8px;
  background: var(--surface-color); border: 1px solid var(--border-color);
  border-radius: var(--border-radius); cursor: pointer; transition: var(--transition);
}
.stat-card:hover, .stat-card.active { border-color: var(--primary-color); }
.stat-card.active { background: rgba(94, 129, 255, 0.08); }
.stat-num { font-size: 1.4rem; font-weight: 700; color: var(--primary-color); }
.stat-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }

.sub-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.sub-tabs button {
  padding: 6px 18px; border: 1px solid var(--border-color); border-radius: 16px;
  background: var(--surface-color); color: var(--text-secondary); cursor: pointer;
  font-size: 0.85rem; transition: var(--transition);
}
.sub-tabs button.active { background: var(--primary-color); color: #fff; border-color: var(--primary-color); }

.tab-content { display: flex; flex-direction: column; gap: 16px; }

.comment-row {
  padding: 14px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: var(--border-radius);
  cursor: pointer; transition: var(--transition);
}
.comment-row:hover { border-color: var(--primary-color); }
.comment-text { font-size: 0.9rem; margin-bottom: 6px; }
.comment-meta { font-size: 0.8rem; color: var(--text-secondary); }

.bars-grid { display: flex; flex-direction: column; gap: 12px; }
.empty { text-align: center; color: var(--text-secondary); padding: 60px 0; }

.user-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: var(--border-radius);
}
.user-row-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.user-row-name { flex: 1; font-weight: 500; }
.unfollow-btn {
  padding: 4px 14px; border: 1px solid var(--border-color);
  border-radius: 14px; background: transparent; color: var(--text-secondary);
  cursor: pointer; font-size: 0.8rem;
}
.unfollow-btn:hover { border-color: var(--secondary-color); color: var(--secondary-color); }
</style>
