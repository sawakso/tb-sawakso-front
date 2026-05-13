<template>
  <div id="app">
    <canvas ref="bgCanvas" id="bgCanvas"></canvas>
    <div class="container">
      <Navbar
          :title="title"
          :user="user"
          :isDarkTheme="isDarkTheme"
          @openAuth="showAuth = true"
          @toggleTheme="toggleTheme"
          @createPost="showCreatePost = true"
      />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <AuthModal v-if="showAuth" @close="showAuth = false" @loginSuccess="onLoginSuccess" />
      <CreatePost v-if="showCreatePost" :visible="showCreatePost" @close="showCreatePost = false" />
      <Footer :title="title" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, computed } from 'vue'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar/Navbar.vue'
import Footer from '@/components/Footer/Footer.vue'
import AuthModal from '@/components/AuthModal/AuthModal.vue'
import CreatePost from '@/components/CreatePost/CreatePost.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo)

const title = ref(import.meta.env.VITE_APP_TITLE)
const isDarkTheme = ref(true)
const showAuth = ref(false)
const showCreatePost = ref(false)
const bgCanvas = ref(null)

const onLoginSuccess = (data) => {
  showAuth.value = false
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  document.body.classList.toggle('light-theme', !isDarkTheme.value)
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

provide('theme', isDarkTheme)
provide('toggleTheme', toggleTheme)

// Canvas 动画
let animationId = null, particles = []
let removeResizeListener = null

//
// function initCanvas() {
//   const canvas = bgCanvas.value
//   if (!canvas) return
//   const ctx = canvas.getContext('2d')
//   const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
//   const createParticles = () => {
//     particles = []
//     for (let i = 0; i < Math.floor((canvas.width * canvas.height) / 15000); i++) {
//       particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2 + 0.5, speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3, opacity: Math.random() * 0.5 + 0.2 })
//     }
//   }
//   const drawParticles = () => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     const c = !isDarkTheme.value ? '0, 0, 0' : '255, 255, 255'
//     const len = particles.length
//
//     particles.forEach((p, i) => {
//       ctx.beginPath()
//       ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
//       ctx.fillStyle = `rgba(${c}, ${p.opacity})`
//       ctx.fill()
//
//       for (let j = i + 1; j < len; j++) {
//         const o = particles[j]
//         const dx = p.x - o.x
//         const dy = p.y - o.y
//         const d = Math.sqrt(dx * dx + dy * dy)
//         if (d < 100) {
//           ctx.beginPath()
//           ctx.strokeStyle = `rgba(${c}, ${0.1 * (1 - d / 100)})`
//           ctx.lineWidth = 0.5
//           ctx.moveTo(p.x, p.y)
//           ctx.lineTo(o.x, o.y)
//           ctx.stroke()
//         }
//       }
//
//       p.x += p.speedX
//       p.y += p.speedY
//       if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
//       if (p.y < 0 || p.y > canvas.height) p.speedY *= -1
//     })
//     animationId = requestAnimationFrame(drawParticles)
//   }
//   const handleResize = () => {
//     resizeCanvas()
//     createParticles()
//   }
//   window.addEventListener('resize', handleResize)
//   removeResizeListener = () => window.removeEventListener('resize', handleResize)
//   resizeCanvas(); createParticles(); drawParticles()
// }
function initCanvas() {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight
  const isDark = isDarkTheme.value

  // 颜色调色板
  const palettes = isDark ? [
    [94, 129, 255],    // 蓝
    [255, 94, 156],    // 粉
    [0, 217, 192],     // 青
    [255, 179, 71],    // 橙
    [186, 85, 211],    // 紫
  ] : [
    [67, 97, 238],
    [247, 37, 133],
    [76, 201, 240],
    [244, 140, 6],
    [147, 51, 234],
  ]

  const randomColor = (alpha = 0.12) => {
    const p = palettes[Math.floor(Math.random() * palettes.length)]
    return { r: p[0], g: p[1], b: p[2], alpha }
  }

  const colorString = (c, a = c.alpha) => `rgba(${c.r},${c.g},${c.b},${a})`

  // 几何图形
  const shapes = []
  const types = ['rect', 'circle', 'triangle']
  for (let i = 0; i < 30; i++) {
    shapes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 120 + 40,
      type: types[Math.floor(Math.random() * 3)],
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      angle: Math.random() * Math.PI * 2,
      dAngle: (Math.random() - 0.5) * 0.0008,
      color: randomColor(),
      glow: Math.random() * 0.15 + 0.05
    })
  }

  // 光点
  const lights = []
  for (let i = 0; i < 20; i++) {
    lights.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      baseAlpha: Math.random() * 0.3 + 0.1
    })
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)
    // 底色
    ctx.fillStyle = isDark ? 'rgba(10,12,18,0.95)' : 'rgba(248,250,252,0.95)'
    ctx.fillRect(0, 0, width, height)

    // 几何图形
    for (const s of shapes) {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.angle)

      const a = s.color.alpha + Math.sin(Date.now() / 3000 + s.size) * s.glow
      ctx.fillStyle = colorString(s.color, Math.max(0.02, a))
      ctx.shadowColor = colorString(s.color, 0.08)
      ctx.shadowBlur = 30

      ctx.beginPath()
      if (s.type === 'rect') {
        ctx.roundRect(-s.size / 2, -s.size / 2, s.size, s.size, s.size * 0.2)
      } else if (s.type === 'circle') {
        ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2)
      } else {
        const h = s.size * 0.866
        ctx.moveTo(0, -h / 2)
        ctx.lineTo(s.size / 2, h / 2)
        ctx.lineTo(-s.size / 2, h / 2)
        ctx.closePath()
      }
      ctx.fill()
      ctx.restore()

      s.x += s.dx; s.y += s.dy; s.angle += s.dAngle
      if (s.x < -s.size || s.x > width + s.size) s.dx *= -1
      if (s.y < -s.size || s.y > height + s.size) s.dy *= -1
    }

    // 光点
    for (const l of lights) {
      const flicker = l.baseAlpha + Math.sin(Date.now() / 2000 + l.r) * 0.1
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0.02, flicker)})`
      ctx.beginPath()
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2)
      ctx.fill()
      l.x += l.dx; l.y += l.dy
      if (l.x < 0 || l.x > width) l.dx *= -1
      if (l.y < 0 || l.y > height) l.dy *= -1
    }

    animationId = requestAnimationFrame(draw)
  }

  const handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)
  removeResizeListener = () => window.removeEventListener('resize', handleResize)

  draw()
}
onMounted(() => {
  if (localStorage.getItem('theme') === 'light') { isDarkTheme.value = false; document.body.classList.add('light-theme') }
  initCanvas()
})
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  removeResizeListener?.()
})

watch(() => router.currentRoute.value.path, () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --primary-color: #5e81ff; --secondary-color: #ff5e9c; --accent-color: #00d9c0;
  --bg-color: rgba(10, 12, 18, 0.95); --surface-color: rgba(30, 33, 46, 0.7);
  --text-color: #e2e8f0; --text-secondary: #94a3b8;
  --border-color: rgba(148, 163, 184, 0.2); --code-color: #00ff9d;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.3); --border-radius: 8px; --transition: all 0.3s ease;
}
.light-theme {
  --primary-color: #4361ee; --secondary-color: #f72585; --accent-color: #4cc9f0;
  --bg-color: rgba(248, 250, 252, 0.95); --surface-color: rgba(255, 255, 255, 0.7);
  --text-color: #1e293b; --text-secondary: #475569;
  --border-color: rgba(148, 163, 184, 0.3); --code-color: #0d9488; --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}
body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  background: transparent;           /* 👈 改：原来是 #0a0c12，改成透明 */
  min-height: 100vh;
  overflow-x: hidden;
  line-height: 1.6;
  transition: var(--transition);
}
#app { width: 100%; min-height: 100vh; position: relative; }
#bgCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;                        /* 👈 改：原来是 -1，改成 0 */
  background: #0a0c12;               /* 👈 新增：canvas 作为背景层 */
}
.light-theme #bgCanvas {
  background: #f8fafc;               /* 👈 新增：亮色主题的背景 */
}
.container {
  max-width: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 1;                        /* 在 canvas 上面 */
}
</style>