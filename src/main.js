import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 1. 先加载变量 (这是所有样式的根基)
import './styles/variables.css'
// 2. 加载重置样式 (清除浏览器默认边距)
import './styles/reset.css'
// 3. 加载全局布局样式
import './styles/common.css'

import '@fortawesome/fontawesome-free/css/all.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化应用
app.mount('#app')

// 在应用挂载后初始化用户状态（支持演示模式）
import { useUserStore } from './stores/user'
const userStore = useUserStore()
userStore.initUser()
