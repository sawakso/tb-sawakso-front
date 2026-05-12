<template>
  <Teleport to="body">
    <div class="auth-overlay" @click.self="close">
      <div class="auth-modal">
        <button class="close-btn" @click="close">✕</button>

        <h2 class="auth-title">
          {{ isLogin ? (isCodeMode ? '验证码登录' : '密码登录') : '注册' }}
        </h2>

        <p class="switch-text">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <span class="switch-link" @click="toggleMode">
            {{ isLogin ? '立即注册' : '去登录' }}
          </span>
        </p>

        <!-- 密码登录：用户名 -->
        <div class="input-group" v-if="isLogin && !isCodeMode">
          <input v-model="username" type="text" placeholder="请输入用户名" class="auth-input" />
        </div>

        <!-- 验证码登录 / 注册：邮箱 -->
        <div class="input-group" v-if="isCodeMode || !isLogin">
          <input v-model="email" type="email" placeholder="请输入邮箱" class="auth-input" />
        </div>

        <!-- 注册：用户名 -->
        <div class="input-group" v-if="!isLogin">
          <input v-model="username" type="text" placeholder="用户名（3-20位）" class="auth-input" />
        </div>

        <!-- 密码登录 / 注册：密码 -->
        <div class="input-group" v-if="!isCodeMode || !isLogin">
          <input v-model="password" type="password" placeholder="密码（6-20位）" class="auth-input" />
        </div>

        <!-- 注册：确认密码 -->
        <div class="input-group" v-if="!isLogin">
          <input v-model="confirmPassword" type="password" placeholder="确认密码" class="auth-input" />
        </div>

        <!-- 注册：昵称 -->
        <div class="input-group" v-if="!isLogin">
          <input v-model="nickname" type="text" placeholder="昵称（选填）" class="auth-input" />
        </div>

        <!-- 验证码登录 / 注册：验证码 -->
        <div class="input-group code-group" v-if="isCodeMode || !isLogin">
          <input v-model="code" type="text" placeholder="验证码" class="auth-input code-input" />
          <button class="send-code-btn" @click="sendCode" :disabled="codeLoading">{{ codeBtnText }}</button>
        </div>

        <p class="code-toggle" v-if="isLogin">
          <span class="switch-link" @click="toggleCodeMode">
            {{ isCodeMode ? '使用密码登录' : '使用验证码登录' }}
          </span>
        </p>

        <button class="submit-btn" @click="handleSubmit" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>

        <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
        <p class="success-msg" v-if="successMsg">{{ successMsg }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { userApi } from '@/request/api/user'

const emit = defineEmits(['close', 'loginSuccess'])

const isLogin = ref(true)
const isCodeMode = ref(false)
const loading = ref(false)
const codeLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const code = ref('')

const codeBtnText = computed(() => codeLoading.value ? '发送中...' : '发送验证码')

const close = () => emit('close')

const toggleMode = () => { isLogin.value = !isLogin.value; isCodeMode.value = false; clearMsg() }
const toggleCodeMode = () => { isCodeMode.value = !isCodeMode.value; clearMsg() }
const clearMsg = () => { errorMsg.value = ''; successMsg.value = '' }

const sendCode = async () => {
  if (!email.value) { errorMsg.value = '请先输入邮箱'; return }
  clearMsg()
  codeLoading.value = true
  try {
    await userApi.sendCode({ email: email.value, type: !isLogin.value ? 'register' : 'login' })
    successMsg.value = '验证码已发送，请查收邮件'
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '发送失败'
  } finally {
    codeLoading.value = false
  }
}

const handleSubmit = async () => {
  clearMsg()

  // 注册校验
  if (!isLogin.value) {
    if (!email.value) { errorMsg.value = '请输入邮箱'; return }
    if (!username.value.trim()) { errorMsg.value = '请输入用户名'; return }
    if (password.value.length < 6) { errorMsg.value = '密码至少6位'; return }
    if (password.value !== confirmPassword.value) { errorMsg.value = '两次密码不一致'; return }
    if (!code.value) { errorMsg.value = '请输入验证码'; return }
  }

  // 密码登录校验
  if (isLogin.value && !isCodeMode.value) {
    if (!username.value.trim()) { errorMsg.value = '请输入用户名'; return }
    if (!password.value) { errorMsg.value = '请输入密码'; return }
  }

  // 验证码登录校验
  if (isLogin.value && isCodeMode.value) {
    if (!email.value) { errorMsg.value = '请输入邮箱'; return }
    if (!code.value) { errorMsg.value = '请输入验证码'; return }
  }

  loading.value = true
  try {
    if (isLogin.value) {
      const res = isCodeMode.value
          ? await userApi.loginByCode({ email: email.value, code: code.value })
          : await userApi.login({ username: username.value.trim(), password: password.value })

      if (res.code === 200) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify({ ...res.data, id: res.data.userId }))
        successMsg.value = '✅ 登录成功！'
        setTimeout(() => { emit('loginSuccess', res.data); close() }, 800)
      } else {
        errorMsg.value = res.message || '登录失败'
      }
    } else {
      await userApi.register({
        username: username.value.trim(),
        email: email.value,
        password: password.value,
        nickname: nickname.value || username.value.trim(),
        code: code.value,
      })
      successMsg.value = '注册成功，请登录'
      isLogin.value = true
      isCodeMode.value = false
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.auth-modal { background: var(--surface-color); backdrop-filter: blur(20px); border: 1px solid var(--border-color); border-radius: 16px; padding: 40px; width: 400px; max-width: 90vw; max-height: 90vh; overflow-y: auto; position: relative; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.close-btn { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer; }
.close-btn:hover { color: var(--text-color); }
.auth-title { font-size: 1.8rem; color: var(--text-color); margin-bottom: 8px; text-align: center; }
.switch-text { text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px; }
.switch-link { color: var(--primary-color); cursor: pointer; }
.switch-link:hover { text-decoration: underline; }
.input-group { margin-bottom: 14px; }
.auth-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; background: var(--bg-color); color: var(--text-color); outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.auth-input:focus { border-color: var(--primary-color); }
.code-group { display: flex; gap: 12px; }
.code-input { flex: 1; }
.send-code-btn { white-space: nowrap; padding: 12px 16px; border: 1px solid var(--primary-color); border-radius: 10px; background: transparent; color: var(--primary-color); cursor: pointer; font-size: 13px; transition: all 0.2s; }
.send-code-btn:hover { background: var(--primary-color); color: white; }
.send-code-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.code-toggle { text-align: right; margin-bottom: 16px; font-size: 0.85rem; }
.submit-btn { width: 100%; padding: 14px; border: none; border-radius: 10px; background: var(--primary-color); color: white; font-size: 16px; cursor: pointer; transition: all 0.2s; }
.submit-btn:hover { opacity: 0.9; transform: translateY(-2px); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { color: #ff6b6b; font-size: 0.85rem; margin-top: 12px; text-align: center; }
.success-msg { color: #51cf66; font-size: 0.85rem; margin-top: 12px; text-align: center; }
</style>