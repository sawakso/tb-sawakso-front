<template>
  <div class="profile-layout">
    <Sidebar :user="user" :title="title" @openAuth="showAuth = true" />

    <main class="main-content">
      <!-- 用户头部 -->
      <div class="profile-header">
        <img :src="profile.avatar || '/images/default-avatar.png'" class="profile-avatar" />
        <div class="profile-center">
          <h1>{{ profile.nickname || profile.username }}</h1>
          <p class="profile-username">@{{ profile.username }}</p>
          <div class="follow-inline">
            <span class="follow-item" @click="tab = 'following'">
              <span class="follow-num">0</span>
              <span class="follow-dot"></span>
              <span class="follow-label">关注</span>
            </span>
                      <span class="follow-item" @click="tab = 'followers'">
              <span class="follow-num">0</span>
              <span class="follow-dot"></span>
              <span class="follow-label">粉丝</span>
            </span>
          </div>
        </div>
        <button class="edit-btn" @click="showEdit = true">
          <i class="fas fa-edit"></i> 编辑资料
        </button>
      </div>


      <!-- 数据统计 — 可点击切换 -->
      <div class="stats-row">
        <div class="stat-card" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
          <span class="stat-num">{{ myPosts.length }}</span>
          <span class="stat-label">我的帖子</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'comments' }" @click="tab = 'comments'">
          <span class="stat-num">{{ myComments.length }}</span>
          <span class="stat-label">我的回复</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'likes' }" @click="tab = 'likes'">
          <span class="stat-num">{{ totalLikes }}</span>
          <span class="stat-label">获赞</span>
        </div>
        <div class="stat-card" :class="{ active: tab === 'bars' }" @click="tab = 'bars'">
          <span class="stat-num">{{ myBars.length }}</span>
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
        <PostCard v-for="p in myPosts" :key="p.id" :post="p" @click="$router.push('/post/' + p.id)" />
        <p v-if="myPosts.length === 0" class="empty">暂无帖子</p>
      </div>

      <!-- 我的回复 -->
      <div v-if="tab === 'comments'" class="tab-content">
        <div v-for="c in myComments" :key="c.id" class="comment-row" @click="$router.push('/post/' + c.post_id)">
          <p class="comment-text">{{ c.content }}</p>
          <span class="comment-meta">回复于 · {{ getPostTitle(c.post_id) }}</span>
        </div>
        <p v-if="myComments.length === 0" class="empty">暂无回复</p>
      </div>

      <!-- 关注的吧 -->
      <div v-if="tab === 'bars'" class="tab-content bars-grid">
        <BarCard v-for="b in myBars" :key="b.id" :bar="b" :showJoin="false" />
        <p v-if="myBars.length === 0" class="empty">还没关注任何吧</p>
      </div>

      <!-- 获赞 -->
      <div v-if="tab === 'likes'" class="tab-content">
        <!-- 帖子获赞 -->
        <template v-if="likeTab === 'posts'">
          <PostCard v-for="p in likedPosts" :key="p.id" :post="p" @click="$router.push('/post/' + p.id)" />
          <p v-if="likedPosts.length === 0" class="empty">暂无帖子获赞</p>
        </template>
        <!-- 评论获赞 -->
        <template v-if="likeTab === 'comments'">
          <div v-for="c in likedComments" :key="c.id" class="comment-row" @click="$router.push('/post/' + c.post_id)">
            <p class="comment-text">{{ c.content }}</p>
            <span class="comment-meta">获赞 {{ c.like_count }} · {{ getPostTitle(c.post_id) }}</span>
          </div>
          <p v-if="likedComments.length === 0" class="empty">暂无评论获赞</p>
        </template>
      </div>

      <!-- 我关注的人 -->
      <div v-if="tab === 'following'" class="tab-content">
        <div v-for="u in followingList" :key="u.id" class="user-row">
          <img :src="u.avatar || '/images/default-avatar.png'" class="user-row-avatar" />
          <span class="user-row-name">{{ u.username }}</span>
          <button class="unfollow-btn">取消关注</button>
        </div>
        <p v-if="followingList.length === 0" class="empty">还没关注任何人</p>
      </div>

      <!-- 关注我的人 -->
      <div v-if="tab === 'followers'" class="tab-content">
        <div v-for="u in followerList" :key="u.id" class="user-row">
          <img :src="u.avatar || '/images/default-avatar.png'" class="user-row-avatar" />
          <span class="user-row-name">{{ u.username }}</span>
        </div>
        <p v-if="followerList.length === 0" class="empty">暂无粉丝</p>
      </div>
    </main>
    <EditProfile
        v-if="showEdit"
        :user="profile"
        @close="showEdit = false"
        @update="fetchProfile"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PostCard from '@/components/PostCard/PostCard.vue'
import BarCard from '@/components/BarCard/BarCard.vue'
import EditProfile from '@/components/EditProfile/EditProfile.vue'
import { useUser } from '@/composables/useUser'
import { postsApi } from '@/request/api/posts.js'
import { commentsApi } from '@/request/api/comments.js'
import { barsApi } from '@/request/api/bars.js'
import { userApi } from '@/request/api/user.js'

const router = useRouter()
const { user } = useUser()
const title = import.meta.env.VITE_APP_TITLE
const showAuth = ref(false)
const showEdit = ref(false)
const tab = ref('posts')
const likeTab = ref('posts')

const profile = ref({})
const myPosts = ref([])
const myComments = ref([])
const myBars = ref([])
const likedPosts = ref([])
const likedComments = ref([])
const allPosts = ref([])

const followingList = ref([])
const followerList = ref([])

const fetchProfile = async () => {
  const data = await userApi.getMe()
  profile.value = data.data || data  // id 在 data.data.id
  // 同步到 composable
  if (user.value) {
    user.value.avatar = profile.value.avatar
    user.value.nickname = profile.value.nickname
  }
}

const totalLikes = computed(() => {
  const postLikes = myPosts.value.reduce((s, p) => s + (p.like_count || 0), 0)
  const commentLikes = myComments.value.reduce((s, c) => s + (c.like_count || 0), 0)
  return postLikes + commentLikes
})

const getPostTitle = (postId) => {
  const p = allPosts.value.find(p => p.id === postId)
  return p?.title || '未知帖子'
}

onMounted(async () => {
  showEdit.value = false
  if (!user.value) { router.push('/'); return }

  await fetchProfile()
  const userId = profile.value.userId || profile.value.id

  // 并行获取所有数据
  allPosts.value = await postsApi.getAll()

  myPosts.value = allPosts.value.filter(p => Number(p.user_id) === Number(userId))

  const commentsPromises = allPosts.value.map(p =>
      fetch(`https://tb-api.sawakso.com/api/posts/${p.id}/comments`).then(r => r.json())
  )
  const commentsArrays = await Promise.all(commentsPromises)
  const allComments = commentsArrays.flat()

  myComments.value = allComments.filter(c => Number(c.user_id) === Number(userId))
  likedPosts.value = myPosts.value.filter(p => p.like_count > 0)
  likedComments.value = myComments.value.filter(c => c.like_count > 0)

  const allBars = await barsApi.getAll()
  myBars.value = allBars.slice(0, 4)

  await nextTick()
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
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-color); }
.profile-info h1 { font-size: 1.4rem; margin-bottom: 4px; }
.profile-username { color: var(--text-secondary); font-size: 0.9rem; }
.profile-join { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
.edit-btn {
  margin-left: auto; padding: 8px 20px; border: 1px solid var(--primary-color);
  border-radius: 20px; background: transparent; color: var(--primary-color);
  cursor: pointer; font-size: 0.9rem; transition: var(--transition);
}
.edit-btn:hover { background: var(--primary-color); color: #fff; }

/* 统计卡片 */
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

/* 二级菜单 */
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
/* 关注/粉丝 */
.follow-inline {
  display: flex; gap: 6px; font-size: 0.85rem; margin-top: 6px;
}
.follow-item {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 14px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  cursor: pointer; transition: var(--transition);
  user-select: none;
}
.follow-item:hover {
  border-color: var(--primary-color);
  background: rgba(94, 129, 255, 0.06);
}
.follow-item:active {
  transform: scale(0.96);
}
.follow-num {
  font-weight: 700; color: var(--text-color); font-size: 0.9rem;
}
.follow-dot {
  width: 4px; height: 4px; border-radius: 50%; background: var(--primary-color);
}
.follow-label {
  color: var(--text-secondary); font-size: 0.8rem;
}
</style>