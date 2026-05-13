<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="create-post-modal">
      <div class="modal-header">
        <h3>发布新帖</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- 选择贴吧 -->
        <div class="form-group">
          <label>选择贴吧</label>
          <select v-model="form.bar_id" class="form-select">
            <option value="" disabled>请选择贴吧</option>
            <option v-for="bar in bars" :key="bar.id" :value="bar.id">{{ bar.name }}</option>
          </select>
        </div>

        <!-- 标题 -->
        <div class="form-group">
          <label>标题</label>
          <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="请输入帖子标题"
              maxlength="100"
          />
        </div>

        <!-- 内容 -->
        <div class="form-group">
          <label>内容</label>
          <textarea
              v-model="form.content"
              class="form-textarea"
              placeholder="支持 Markdown：**粗体**、### 标题、```代码块```"
              rows="8"
              maxlength="5000"
          ></textarea>
          <span class="char-count">{{ form.content.length }} / 5000</span>
        </div>

        <!-- 媒体 URL（可选） -->
        <div class="form-group">
          <label>媒体链接（可选）</label>
          <input
              v-model="form.media_url"
              type="text"
              class="form-input"
              placeholder="图片或视频 URL，留空则不添加"
          />
        </div>

        <!-- 媒体类型 -->
        <div class="form-group" v-if="form.media_url">
          <label>媒体类型</label>
          <div class="media-type-options">
            <label class="radio-label">
              <input type="radio" v-model="form.media_type" value="image" />
              <span>图片</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.media_type" value="video" />
              <span>视频</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.media_type" value="link" />
              <span>链接</span>
            </label>
          </div>
        </div>

        <!-- 预览 -->
        <div class="preview-section" v-if="form.title || form.content">
          <h4>预览</h4>
          <div class="preview-card">
            <h2 v-if="form.title">{{ form.title }}</h2>
            <div class="preview-content" v-html="renderPreview"></div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="close">取消</button>
        <button
            class="btn-submit"
            :disabled="!canSubmit || submitting"
            @click="handleSubmit"
        >
          {{ submitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '@/request/api/posts.js'
import { barsApi } from '@/request/api/bars.js'

const props = defineProps({
  visible: Boolean,
  defaultBarId: [Number, String]
})

const emit = defineEmits(['close', 'created'])

const router = useRouter()
const submitting = ref(false)
const bars = ref([])

const form = ref({
  title: '',
  content: '',
  bar_id: props.defaultBarId || '',
  media_type: 'image',
  media_url: ''
})

// 加载贴吧列表
watch(() => props.visible, async (val) => {
  if (val && bars.value.length === 0) {
    bars.value = await barsApi.getAll()
  }
  if (props.defaultBarId) {
    form.value.bar_id = props.defaultBarId
  }
})

const canSubmit = computed(() => {
  return form.value.title.trim() && form.value.content.trim() && form.value.bar_id
})

const renderPreview = computed(() => {
  if (!form.value.content) return ''
  return form.value.content
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\n/g, '<br>')
})

const close = () => {
  form.value = { title: '', content: '', bar_id: '', media_type: 'image', media_url: '' }
  emit('close')
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      bar_id: Number(form.value.bar_id)
    }
    // 只有填写了媒体 URL 才带上媒体字段
    if (form.value.media_url?.trim()) {
      payload.media_type = form.value.media_type
      payload.media_url = form.value.media_url.trim()
    }

    const res = await postsApi.create(payload)

    // 清除帖子列表缓存
    request.clearCache('/posts')

    emit('created', res.data)

    // 跳转到新帖子详情
    close()
    await router.push(`/post/${res.data.id}`)
  } catch (e) {
    console.error('发帖失败:', e)
    alert(e.response?.data?.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.create-post-modal {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  width: 620px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-color); }
.close-btn {
  background: none; border: none; color: var(--text-secondary);
  font-size: 1.5rem; cursor: pointer; line-height: 1;
}
.close-btn:hover { color: var(--text-color); }

.modal-body { padding: 24px; }

.form-group { margin-bottom: 18px; }
.form-group label {
  display: block; font-size: 0.88rem; font-weight: 500;
  color: var(--text-secondary); margin-bottom: 6px;
}
.form-input, .form-select, .form-textarea {
  width: 100%; padding: 10px 14px;
  background: var(--bg-color); border: 1px solid var(--border-color);
  border-radius: 8px; color: var(--text-color);
  font-size: 0.9rem; outline: none; transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: var(--primary-color);
}
.form-textarea {
  resize: vertical; min-height: 120px; line-height: 1.6;
  font-family: inherit;
}
.char-count {
  display: block; text-align: right;
  font-size: 0.78rem; color: var(--text-secondary);
  margin-top: 4px;
}

.media-type-options {
  display: flex; gap: 16px;
}
.radio-label {
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; font-size: 0.88rem; color: var(--text-color);
}
.radio-label input[type="radio"] { accent-color: var(--primary-color); }

.preview-section { margin-top: 8px; }
.preview-section h4 {
  font-size: 0.85rem; color: var(--text-secondary);
  margin-bottom: 10px; padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}
.preview-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px; padding: 16px;
}
.preview-card h2 { font-size: 1.1rem; margin-bottom: 10px; color: var(--text-color); }
.preview-content {
  font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);
}
.preview-content :deep(h2), .preview-content :deep(h3) { margin: 10px 0 6px; }
.preview-content :deep(pre) {
  background: #1a1a2e; padding: 10px; border-radius: 6px;
  overflow-x: auto; font-size: 0.82rem;
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px; border-top: 1px solid var(--border-color);
}
.btn-cancel {
  padding: 8px 22px; border: 1px solid var(--border-color);
  border-radius: 20px; background: transparent;
  color: var(--text-secondary); cursor: pointer;
  font-size: 0.9rem; transition: all 0.2s;
}
.btn-cancel:hover { border-color: var(--text-color); color: var(--text-color); }
.btn-submit {
  padding: 8px 28px; border: none; border-radius: 20px;
  background: var(--primary-color); color: white; cursor: pointer;
  font-size: 0.9rem; font-weight: 500; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { background: var(--secondary-color); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
