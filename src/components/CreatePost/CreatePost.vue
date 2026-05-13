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
              rows="6"
              maxlength="5000"
          ></textarea>
          <span class="char-count">{{ form.content.length }} / 5000</span>
        </div>

        <!-- 媒体上传区域 -->
        <div class="media-upload-section">
          <div class="media-upload-header">
            <button
                class="upload-btn"
                :disabled="images.length >= 3"
                @click="triggerImageInput"
            >
              <i class="fas fa-image"></i> 添加图片{{ images.length > 0 ? `(${images.length}/3)` : '' }}
            </button>
            <button
                class="upload-btn video-btn"
                :disabled="!!videoFile"
                @click="triggerVideoInput"
            >
              <i class="fas fa-video"></i> {{ videoFile ? '已添加视频' : '添加视频' }}
            </button>
            <span class="upload-hint">图片最多 3 张（单张 ≤5MB），视频 1 个（≤50MB）</span>
          </div>

          <!-- 隐藏的文件输入框 -->
          <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              multiple
              hidden
              @change="handleImageSelect"
          />
          <input
              ref="videoInputRef"
              type="file"
              accept="video/*"
              hidden
              @change="handleVideoSelect"
          />

          <!-- 图片预览区 -->
          <div class="preview-grid" v-if="images.length > 0">
            <div v-for="(img, index) in images" :key="index" class="preview-item">
              <img :src="img.preview" :alt="'图片' + (index + 1)" />
              <button class="remove-btn" @click="removeImage(index)" title="删除">&times;</button>
            </div>
            <!-- 添加更多位 -->
            <div
                v-if="images.length < 3"
                class="preview-item add-more"
                @click="triggerImageInput"
            >
              <i class="fas fa-plus"></i>
            </div>
          </div>

          <!-- 视频预览 -->
          <div class="video-preview" v-if="videoFile">
            <video :src="videoPreview" preload="metadata"></video>
            <div class="video-info">
              <span><i class="fas fa-film"></i> {{ videoFile.name }}</span>
              <span class="video-size">{{ formatSize(videoFile.size) }}</span>
            </div>
            <button class="remove-btn video-remove" @click="removeVideo" title="删除">&times;</button>
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
          <template v-if="uploading">
            <i class="fas fa-spinner fa-spin"></i> 上传中...
          </template>
          <template v-else-if="submitting">
            发布中...
          </template>
          <template v-else>发布</template>
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
import request from '@/request/index'

const props = defineProps({
  visible: Boolean,
  defaultBarId: [Number, String]
})

const emit = defineEmits(['close', 'created'])

const router = useRouter()
const submitting = ref(false)
const uploading = ref(false)
const bars = ref([])

// 表单数据
const form = ref({
  title: '',
  content: '',
  bar_id: props.defaultBarId || ''
})

// 媒体文件状态
const images = ref([])       // [{ file: File, preview: string }]
const videoFile = ref(null)   // File | null
const videoPreview = ref('')  // blob URL

// 文件输入框引用
const imageInputRef = ref(null)
const videoInputRef = ref(null)

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

// ========== 媒体处理 ==========

// 触发图片选择
const triggerImageInput = () => {
  imageInputRef.value?.click()
}

// 触发视频选择
const triggerVideoInput = () => {
  if (videoFile.value) return // 已有视频
  videoInputRef.value?.click()
}

// 处理图片选择
const handleImageSelect = (e) => {
  const files = Array.from(e.target.files || [])
  const remaining = 3 - images.value.length

  if (files.length > remaining) {
    alert(`最多还能添加 ${remaining} 张图片`)
  }

  for (let i = 0; i < Math.min(files.length, remaining); i++) {
    const file = files[i]
    // 校验大小：5MB
    if (file.size > 5 * 1024 * 1024) {
      alert(`图片 "${file.name}" 超过 5MB 限制`)
      continue
    }
    images.value.push({
      file,
      preview: URL.createObjectURL(file)
    })
  }

  // 清空 input 以便重复选择同一文件
  e.target.value = ''
}

// 处理视频选择
const handleVideoSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 50 * 1024 * 1024) {
    alert('视频不能超过 50MB')
    e.target.value = ''
    return
  }

  videoFile.value = file
  videoPreview.value = URL.createObjectURL(file)
  e.target.value = ''
}

// 删除某张图片
const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].preview)
  images.value.splice(index, 1)
}

// 删除视频
const removeVideo = () => {
  URL.revokeObjectURL(videoPreview.value)
  videoFile.value = null
  videoPreview.value = ''
}

// 格式化文件大小
const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ========== Markdown 预览 ==========

const renderPreview = computed(() => {
  if (!form.value.content) return ''
  return form.value.content
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\n/g, '<br>')
})

// ========== 提交 ==========

const close = () => {
  // 释放所有预览 URL
  images.value.forEach(img => URL.revokeObjectURL(img.preview))
  if (videoPreview.value) URL.revokeObjectURL(videoPreview.value)

  form.value = { title: '', content: '', bar_id: '' }
  images.value = []
  videoFile.value = null
  videoPreview.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    let payload = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      bar_id: Number(form.value.bar_id)
    }

    // ===== 先并行上传媒体到 R2 =====
    const uploadTasks = []

    for (const img of images.value) {
      uploadTasks.push(postsApi.uploadMedia(img.file))
    }
    if (videoFile.value) {
      uploadTasks.push(postsApi.uploadMedia(videoFile.value))
    }

    let uploadResults = []
    if (uploadTasks.length > 0) {
      uploading.value = true
      try {
        uploadResults = await Promise.all(uploadTasks)
      } catch (e) {
        console.error('媒体上传失败:', e)
        alert('媒体上传失败，请检查网络后重试')
        return
      } finally {
        uploading.value = false
      }
    }

    // ===== 组装媒体字段 =====
    const imageResults = uploadResults.filter(r => r.data?.type === 'image')
    const videoResult = uploadResults.find(r => r.data?.type === 'video')

    if (imageResults.length > 0) {
      payload.images = JSON.stringify(imageResults.map(r => r.data.url))
    }
    if (videoResult) {
      payload.video = videoResult.data.url
    }

    // 发送创建请求
    const res = await postsApi.create(payload)

    // 清除帖子列表缓存
    request.clearCache('/posts')

    emit('created', res.data)

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
  width: 640px;
  max-width: 92vw;
  max-height: 88vh;
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

.form-group { margin-bottom: 16px; }
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
  resize: vertical; min-height: 80px; line-height: 1.6;
  font-family: inherit;
}
.char-count {
  display: block; text-align: right;
  font-size: 0.78rem; color: var(--text-secondary);
  margin-top: 4px;
}

/* ====== 媒体上传区域 ====== */
.media-upload-section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-color);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
}
.media-upload-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border: 1px solid var(--primary-color);
  border-radius: 18px; background: rgba(94, 129, 255, 0.06);
  color: var(--primary-color); cursor: pointer;
  font-size: 0.85rem; transition: all 0.2s;
}
.upload-btn:hover:not(:disabled) {
  background: var(--primary-color); color: #fff;
}
.upload-btn:disabled {
  opacity: 0.45; cursor: not-allowed;
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: transparent;
}
.video-btn {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.video-btn:hover:not(:disabled) {
  background: #8b5cf6; color: #fff;
}
.upload-hint {
  font-size: 0.75rem; color: var(--text-secondary);
  margin-left: auto;
}

/* 图片预览网格 */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.preview-item img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.preview-item.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-color);
  cursor: pointer;
  border-style: dashed;
  transition: border-color 0.2s;
}
.preview-item.add-more:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.preview-item.add-more i {
  font-size: 1.4rem;
  color: var(--text-secondary);
}
.remove-btn {
  position: absolute;
  top: 4px; right: 4px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff; border: none;
  font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 2;
  transition: background 0.15s;
}
.remove-btn:hover {
  background: #ef4444;
}

/* 视频预览 */
.video-preview {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
.video-preview video {
  width: 120px; height: 68px;
  object-fit: cover;
  border-radius: 6px;
  background: #000;
}
.video-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
  color: var(--text-color);
}
.video-info i { color: #8b5cf6; margin-right: 4px; }
.video-size {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.video-remove {
  top: auto; right: 12px;
}

/* 预览区域 */
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
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 28px; border: none; border-radius: 20px;
  background: var(--primary-color); color: white; cursor: pointer;
  font-size: 0.9rem; font-weight: 500; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { background: var(--secondary-color); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* 动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.fa-spin { animation: spin 1s linear infinite; }
</style>
