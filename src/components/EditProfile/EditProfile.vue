<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <h3>编辑资料</h3>

      <div class="edit-avatar">
        <img :src="previewAvatar" />
        <label class="change-avatar">
          <input type="file" accept="image/*" @change="handleAvatar" hidden />
          <span>更换头像</span>
        </label>
      </div>

      <div class="edit-field">
        <label>昵称</label>
        <input v-model="form.nickname" placeholder="输入昵称" maxlength="20" />
      </div>

      <div class="edit-field">
        <label>个人简介</label>
        <textarea v-model="form.bio" placeholder="介绍一下自己..." maxlength="200" rows="3"></textarea>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="save-btn" :disabled="!form.nickname.trim()" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/request/api/user.js'

const props = defineProps({ user: Object })
const emit = defineEmits(['close', 'update'])

const form = ref({ nickname: '', bio: '', avatar: null })
const previewAvatar = ref('')

onMounted(() => {
  if (props.user) {
    form.value.nickname = props.user.nickname || props.user.username || ''
    form.value.bio = props.user.bio || ''
    previewAvatar.value = props.user.avatar || '/images/default-avatar.png'
    form.value.avatar = null
  }
})

const handleAvatar = (e) => {
  const file = e.target.files[0]
  if (!file) return
  form.value.avatar = file
  previewAvatar.value = URL.createObjectURL(file)
}

const save = async () => {
  const res = await userApi.updateProfile({ nickname: form.value.nickname, bio: form.value.bio })

  if (form.value.avatar) {
    const avatarRes = await userApi.uploadAvatar(form.value.avatar)
    // 更新本地存储
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    savedUser.avatar = avatarRes.data?.avatar || avatarRes.avatar
    savedUser.nickname = form.value.nickname
    localStorage.setItem('user', JSON.stringify(savedUser))
  } else {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    savedUser.nickname = form.value.nickname
    localStorage.setItem('user', JSON.stringify(savedUser))
  }

  emit('update')
  emit('close')
  window.location.reload()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); display: flex;
  align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.modal-box {
  width: 400px; max-width: 90vw;
  background: var(--bg-color); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 30px;
}
.modal-box h3 { font-size: 1.2rem; margin-bottom: 24px; text-align: center; }

.edit-avatar {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;
}
.edit-avatar img {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
  border: 3px solid var(--primary-color); margin-bottom: 10px;
}
.change-avatar { font-size: 0.85rem; color: var(--primary-color); cursor: pointer; }
.change-avatar:hover { text-decoration: underline; }

.edit-field { margin-bottom: 20px; }
.edit-field label {
  display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;
}
.edit-field input, .edit-field textarea {
  width: 100%; padding: 10px 14px; background: var(--surface-color);
  border: 1px solid var(--border-color); border-radius: 8px;
  color: var(--text-color); font-size: 0.95rem; outline: none; resize: vertical;
}
.edit-field input:focus, .edit-field textarea:focus { border-color: var(--primary-color); }

.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.cancel-btn {
  padding: 8px 20px; border: 1px solid var(--border-color); border-radius: 8px;
  background: transparent; color: var(--text-color); cursor: pointer;
}
.save-btn {
  padding: 8px 20px; border: none; border-radius: 8px;
  background: var(--primary-color); color: #fff; cursor: pointer;
}
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>