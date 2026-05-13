<template>
  <aside class="right-sidebar">
    <!-- 运行时钟 -->
    <div class="card clock-card">
      <div class="clock-label">本站已运行</div>
      <div class="clock-timer">
        <div class="timer-block">
          <span class="timer-num">{{ runtime.days }}</span>
          <span class="timer-unit">天</span>
        </div>
        <span class="timer-sep">:</span>
        <div class="timer-block">
          <span class="timer-num">{{ runtime.hours }}</span>
          <span class="timer-unit">时</span>
        </div>
        <span class="timer-sep">:</span>
        <div class="timer-block">
          <span class="timer-num">{{ runtime.minutes }}</span>
          <span class="timer-unit">分</span>
        </div>
        <span class="timer-sep">:</span>
        <div class="timer-block">
          <span class="timer-num">{{ runtime.seconds }}</span>
          <span class="timer-unit">秒</span>
        </div>
      </div>
      <p class="clock-date">{{ date }}</p>
    </div>

    <!-- 本站数据 -->
    <div class="card stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-num">{{ stats.posts }}</span>
          <span class="stat-label">帖子</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.bars }}</span>
          <span class="stat-label">贴吧</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.users }}</span>
          <span class="stat-label">用户</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.comments }}</span>
          <span class="stat-label">评论</span>
        </div>
      </div>
      <p class="stats-today">今日新增 <strong>{{ stats.todayPosts }}</strong> 帖</p>
    </div>

    <!-- 随机探索 -->
    <button class="explore-btn" @click="randomPost">
      <i class="fas fa-dice-d6"></i> 随机探索
    </button>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({ posts: 8, bars: 6, users: 9, comments: 10, todayPosts: 2 })
const date = ref('')

const runtime = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const updateRuntime = () => {
  const start = new Date('2026-05-12T09:26:00')
  const diff = Math.floor((Date.now() - start.getTime()) / 1000)

  runtime.value = {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60
  }

  const now = new Date()
  date.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', week: 'long', day: 'numeric'
  })
}

onMounted(() => {
  updateRuntime()
  timer = setInterval(updateRuntime, 1000)
})

onUnmounted(() => clearInterval(timer))

const randomPost = () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8]
  router.push('/post/' + ids[Math.floor(Math.random() * ids.length)])
}
</script>

<style scoped>
.right-sidebar {
  width: 260px; min-width: 260px;
  height: calc(100vh - 96px); position: sticky; top: 96px;
  padding: 20px 16px; overflow-y: auto;
  border-left: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  display: flex; flex-direction: column; gap: 14px;
}

/* 时钟卡片 */
.clock-card {
  background: linear-gradient(135deg, rgba(94,129,255,0.08), rgba(0,217,192,0.05));
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px 16px;
  text-align: center;
}
.clock-label {
  font-size: 0.75rem; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: 12px;
}
.clock-timer {
  display: flex; justify-content: center; align-items: flex-end; gap: 2px;
}
.timer-block {
  display: flex; flex-direction: column; align-items: center;
  min-width: 42px;
}
.timer-num {
  font-size: 1.6rem; font-weight: 700; color: var(--primary-color);
  font-family: 'Source Code Pro', monospace;
  line-height: 1;
}
.timer-unit {
  font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;
}
.timer-sep {
  font-size: 1.2rem; color: var(--text-secondary); padding-bottom: 14px;
}
.clock-date {
  font-size: 0.8rem; color: var(--text-secondary); margin-top: 10px;
}

/* 统计卡片 */
.stats-card {
  background: var(--surface-color); border: 1px solid var(--border-color);
  border-radius: var(--border-radius); padding: 14px;
}
.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
.stat-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 4px; border-radius: 6px;
  background: var(--bg-color);
}
.stat-num {
  font-size: 1.2rem; font-weight: 700; color: var(--primary-color);
}
.stat-label {
  font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;
}
.stats-today {
  text-align: center; font-size: 0.78rem; color: var(--text-secondary); margin-top: 10px;
}
.stats-today strong { color: var(--text-color); }

/* 随机探索 */
.explore-btn {
  width: 100%; padding: 14px; border: 1px dashed var(--primary-color);
  border-radius: var(--border-radius); background: transparent;
  color: var(--primary-color); cursor: pointer; font-size: 0.95rem;
  transition: var(--transition);
}
.explore-btn:hover {
  background: var(--primary-color); color: #fff; border-style: solid;
}
</style>