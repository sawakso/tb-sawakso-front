<template>
  <!-- 移动端遮罩 -->
  <div v-if="isMobile && rightbarOpen" class="rightbar-overlay" @click="closeRightbar"></div>

  <!-- 移动端切换按钮 -->
  <button v-if="isMobile" class="rightbar-toggle" @click="toggleRightbar">
    <i :class="rightbarOpen ? 'fas fa-times' : 'fas fa-chart-bar'"></i>
  </button>

  <!-- 右侧边栏容器（和左边栏结构一致） -->
  <div class="rightbar-wrapper" :class="{ 'rightbar-closed': !rightbarOpen, 'rightbar-mobile': isMobile }">
    <!-- 折叠按钮 - 夹在中间 -->
    <button v-if="!isMobile" class="collapse-btn" @click="toggleRightbar" :title="rightbarOpen ? '收起' : '展开'">
      <i :class="rightbarOpen ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
    </button>

    <aside class="right-sidebar">
      <!-- 运行时钟 -->
      <div class="card clock-card">
        <div class="clock-label">本站已运行</div>
        <div class="clock-timer">
          <div class="timer-block">
            <span class="timer-num">{{ runtime.days }}</span>
            <span class="timer-unit">天</span>
          </div>
          <span v-if="rightbarOpen" class="timer-sep">:</span>
          <div v-if="rightbarOpen" class="timer-block">
            <span class="timer-num">{{ runtime.hours }}</span>
            <span class="timer-unit">时</span>
          </div>
          <span v-if="rightbarOpen" class="timer-sep">:</span>
          <div v-if="rightbarOpen" class="timer-block">
            <span class="timer-num">{{ runtime.minutes }}</span>
            <span class="timer-unit">分</span>
          </div>
          <span v-if="rightbarOpen" class="timer-sep">:</span>
          <div v-if="rightbarOpen" class="timer-block">
            <span class="timer-num">{{ runtime.seconds }}</span>
            <span class="timer-unit">秒</span>
          </div>
        </div>
        <p v-if="rightbarOpen" class="clock-date">{{ date }}</p>
      </div>

      <!-- 本站数据 -->
      <div class="card stats-card" v-if="rightbarOpen">
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
      <button v-if="rightbarOpen" class="explore-btn" @click="randomPost">
        <i class="fas fa-dice-d6"></i> 随机探索
      </button>

      <!-- 折叠时的简化显示 -->
      <div v-if="!rightbarOpen && !isMobile" class="collapsed-icons">
        <div class="collapsed-stat">
          <span class="collapsed-num">{{ stats.posts }}</span>
          <span class="collapsed-label">帖</span>
        </div>
        <div class="collapsed-stat">
          <span class="collapsed-num">{{ stats.users }}</span>
          <span class="collapsed-label">人</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({ posts: 8, bars: 6, users: 9, comments: 10, todayPosts: 2 })
const date = ref('')
const rightbarOpen = ref(true)
const isMobile = ref(false)

const runtime = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer = null

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) rightbarOpen.value = false
  else rightbarOpen.value = true
}

const toggleRightbar = () => {
  rightbarOpen.value = !rightbarOpen.value
}

const closeRightbar = () => {
  rightbarOpen.value = false
}

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
    year: 'numeric', month: 'long', weekday: 'long', day: 'numeric'
  })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  updateRuntime()
  timer = setInterval(updateRuntime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', checkMobile)
})

const randomPost = () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8]
  router.push('/post/' + ids[Math.floor(Math.random() * ids.length)])
}

defineExpose({ rightbarOpen })
</script>

<style scoped>
/* 外层包裹 */
.rightbar-wrapper {
  display: flex;
  align-items: flex-start;
  height: 100%;
}

/* 右侧边栏主体 */
.right-sidebar {
  width: 350px;
  flex-shrink: 0;
  height: 100%;
  padding: 20px 14px;
  overflow-y: auto;
  border-left: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: width 0.3s, padding 0.3s;
  background: var(--bg-color);

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.right-sidebar::-webkit-scrollbar {
  display: none;
}

.rightbar-wrapper.rightbar-closed .right-sidebar {
  width: 64px;
  padding: 20px 8px;
}

/* 折叠按钮 */
.collapse-btn {
  width: 30px;
  height: 90px;
  margin-top: 200px;
  margin-right: -1px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.3s;
  z-index: 10;
  flex-shrink: 0;
  order: -1;
}

.collapse-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--bg-color);
}

.rightbar-wrapper.rightbar-closed .collapse-btn {
  margin-right: 0;
  border-right: 1px solid var(--border-color);
  border-radius: 8px;
}

/* 折叠图标 */
.collapsed-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 20px;
}

.collapsed-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.collapsed-num {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.collapsed-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

/* 移动端切换按钮 */
.rightbar-toggle {
  display: none;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 110;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 移动端遮罩 */
.rightbar-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.5);
}

/* 时钟 */
.clock-card {
  background: linear-gradient(135deg, rgba(94, 129, 255, 0.08), rgba(0, 217, 192, 0.05));
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px 16px;
  text-align: center;
}

.rightbar-closed .clock-card {
  padding: 12px 8px;
}

.clock-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.clock-timer {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2px;
}

.timer-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 42px;
}

.timer-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Source Code Pro', monospace;
  line-height: 1;
}

.timer-unit {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.timer-sep {
  font-size: 1.2rem;
  color: var(--text-secondary);
  padding-bottom: 14px;
}

.clock-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 10px;
}

/* 统计 */
.stats-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 6px;
  background: var(--bg-color);
}

.stat-num {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.stats-today {
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 10px;
}

.stats-today strong {
  color: var(--text-color);
}

.explore-btn {
  width: 100%;
  padding: 14px;
  border: 1px dashed var(--primary-color);
  border-radius: var(--border-radius);
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.95rem;
  transition: var(--transition);
}

.explore-btn:hover {
  background: var(--primary-color);
  color: #fff;
  border-style: solid;
}

/* ====== 移动端 ====== */
@media (max-width: 768px) {
  .rightbar-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 100;
    transform: translateX(0);
    transition: transform 0.3s;
  }

  .rightbar-wrapper.rightbar-closed {
    transform: translateX(100%);
  }

  .rightbar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .collapse-btn {
    display: none;
  }
}
</style>