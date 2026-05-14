<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="create-post-modal">
      <div class="modal-header">
        <h3>发布新帖</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- 搜索/选择贴吧 -->
        <div class="form-group bar-select-wrapper">
          <label>选择贴吧</label>
          <div class="bar-search-box" ref="barSearchRef">
            <input
                v-model="barSearchKeyword"
                type="text"
                class="form-input bar-search-input"
                placeholder="搜索贴吧或创建新贴吧..."
                @input="handleBarSearch"
                @focus="showBarDropdown = true"
                @keydown.down.prevent="highlightNextBar"
                @keydown.up.prevent="highlightPrevBar"
                @keydown.enter.prevent="selectHighlightedBar"
                @keydown.escape="showBarDropdown = false"
            />
            <!-- 下拉候选列表 -->
            <div class="bar-dropdown" v-if="showBarDropdown">
              <div v-if="barSearching" class="bar-dropdown-item bar-loading">搜索中...</div>
              <template v-else>
                <div
                    v-for="(bar, idx) in filteredBars"
                    :key="bar.id"
                    class="bar-dropdown-item"
                    :class="{ 'bar-highlighted': idx === barHighlightIndex }"
                    @click="selectBar(bar)"
                    @mousemove="barHighlightIndex = idx"
                >
                  <span class="bar-name">{{ bar.name }}</span>
                  <span class="bar-meta" v-if="bar.post_count !== undefined">{{ bar.post_count }} 帖子</span>
                </div>
                <!-- 创建新贴吧 -->
                <div
                    v-if="barSearchKeyword.trim()"
                    class="bar-dropdown-item bar-create-option"
                    @click="showCreateBarModal = true; showBarDropdown = false"
                >
                  <i class="fas fa-plus-circle"></i>
                  创建贴吧「{{ barSearchKeyword.trim() }}」
                </div>
                <div v-else-if="filteredBars.length === 0 && !barSearching" class="bar-dropdown-item bar-empty">
                  无匹配结果，输入名称可创建新贴吧
                </div>
              </template>
            </div>
          </div>
          <!-- 已选中的贴吧标签 -->
          <div class="selected-bar-tag" v-if="form.bar_id && selectedBarName">
            <span class="tag-text"><i class="fas fa-check-circle"></i> {{ selectedBarName }}</span>
            <button class="tag-remove" @click="clearBarSelection" title="更换贴吧">&times;</button>
          </div>
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
            <span class="upload-hint">图片最多 3 张（单张 ≤10MB），视频 1 个（≤10MB）</span>
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

    <!-- 创建贴吧内嵌弹窗 -->
    <div class="modal-overlay create-bar-overlay" v-if="showCreateBarModal" @click.self="showCreateBarModal = false">
      <div class="create-bar-modal">
        <h4>创建新贴吧</h4>
        <div class="create-bar-form">
          <label>贴吧名称</label>
          <input
              v-model="newBarName"
              type="text"
              class="form-input"
              placeholder="输入贴吧名称"
              maxlength="30"
              ref="newBarInputRef"
          />
          <label>简介（可选）</label>
          <textarea
              v-model="newBarDesc"
              class="form-textarea"
              placeholder="简单描述这个贴吧..."
              rows="3"
              maxlength="200"
          ></textarea>
        </div>
        <div class="create-bar-actions">
          <button class="btn-cancel" @click="showCreateBarModal = false">取消</button>
          <button class="btn-submit" :disabled="!newBarName.trim() || creatingBar" @click="handleCreateBar">
            {{ creatingBar ? '创建中...' : '确认创建' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
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

// 表单数据
const form = ref({
  title: '',
  content: '',
  bar_id: props.defaultBarId || ''
})

// ========== 贴吧搜索/选择/创建 ==========
const barSearchRef = ref(null)
const barSearchKeyword = ref('')
const filteredBars = ref([])
const showBarDropdown = ref(false)
const barSearching = ref(false)
const barHighlightIndex = ref(-1)
let searchTimer = null
const allBarsCache = [] // 缓存全量列表用于本地过滤

// 已选中的贴吧名称
const selectedBarName = computed(() => {
  if (!form.value.bar_id) return ''
  const found = filteredBars.value.find(b => Number(b.id) === Number(form.value.bar_id))
  if (found) return found.name
  // 在缓存中找
  const cached = allBarsCache.find(b => Number(b.id) === Number(form.value.bar_id))
  return cached?.name || ''
})

// 加载热门贴吧（打开弹窗时）
watch(() => props.visible, async (val) => {
  if (val) {
    // 如果有默认 barId，先获取名称
    if (props.defaultBarId && !form.value.bar_id) {
      form.value.bar_id = props.defaultBarId
    }
    // 预加载热门贴吧
    try {
      const list = await barsApi.search('')
      filteredBars.value = Array.isArray(list) ? list : []
      allBarsCache.push(...filteredBars.value)
      // 如果有默认 barId，确保它在列表中以便显示名称
      if (props.defaultBarId && !filteredBars.value.find(b => Number(b.id) === Number(props.defaultBarId))) {
        try {
          const barDetail = await barsApi.getById(props.defaultBarId)
          if (barDetail) {
            filteredBars.value.unshift(barDetail)
            allBarsCache.push(barDetail)
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) {
      console.error('加载贴吧失败:', e)
    }
  }
})

// 搜索防抖
const handleBarSearch = () => {
  showBarDropdown.value = true
  const q = barSearchKeyword.value.trim()
  barHighlightIndex.value = -1

  clearTimeout(searchTimer)
  if (!q) {
    // 无关键词 → 显示热门贴吧（从缓存取）
    filteredBars.value = allBarsCache.slice(0, 20).sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
    barSearching.value = false
    return
  }

  barSearching.value = true
  searchTimer = setTimeout(async () => {
    try {
      const results = await barsApi.search(q)
      filteredBars.value = Array.isArray(results) ? results : []
      // 同时更新缓存
      for (const b of filteredBars.value) {
        if (!allBarsCache.find(c => c.id === b.id)) allBarsCache.push(b)
      }
    } catch (e) {
      filteredBars.value = []
    } finally {
      barSearching.value = false
    }
  }, 300)
}

// 键盘导航
const highlightNextBar = () => {
  if (!showBarDropdown.value) { showBarDropdown.value = true; return }
  const maxIdx = filteredBars.value.length - 1
  barHighlightIndex.value = barHighlightIndex.value < maxIdx ? barHighlightIndex.value + 1 : maxIdx
}
const highlightPrevBar = () => {
  if (!showBarDropdown.value) return
  barHighlightIndex.value = barHighlightIndex.value > 0 ? barHighlightIndex.value - 1 : -1
}

const selectHighlightedBar = () => {
  const idx = barHighlightIndex.value
  if (idx >= 0 && idx < filteredBars.value.length) {
    selectBar(filteredBars.value[idx])
  }
}

// 选择一个贴吧
const selectBar = (bar) => {
  form.value.bar_id = bar.id
  barSearchKeyword.value = bar.name
  showBarDropdown.value = false
  // 更新缓存
  if (!allBarsCache.find(b => b.id === bar.id)) allBarsCache.push(bar)
  if (!filteredBars.value.find(b => b.id === bar.id)) filteredBars.value.push(bar)
}

// 清除选择
const clearBarSelection = () => {
  form.value.bar_id = ''
  barSearchKeyword.value = ''
  nextTick(() => showBarDropdown.value = true)
}

// 点击外部关闭下拉
const closeBarDropdown = (e) => {
  if (barSearchRef.value && !barSearchRef.value.contains(e.target)) {
    showBarDropdown.value = false
  }
}

// 监听点击外部
if (typeof window !== 'undefined') {
  // 延迟绑定，避免 SSR 问题
  setTimeout(() => {
    document.addEventListener('click', closeBarDropdown)
  }, 0)
}

// ========== 创建新贴吧 ==========
const showCreateBarModal = ref(false)
const newBarName = ref('')
const newBarDesc = ref('')
const newBarInputRef = ref(null)
const creatingBar = ref(false)

watch(showCreateBarModal, async (val) => {
  if (val) {
    newBarName.value = barSearchKeyword.value.trim()
    newBarDesc.value = ''
    await nextTick()
    newBarInputRef.value?.focus()
  }
})

const handleCreateBar = async () => {
  const name = newBarName.value.trim()
  if (!name) return

  creatingBar.value = true
  try {
    const res = await barsApi.create({ name, description: newBarDesc.value.trim() })
    const newBar = res.data || res

    // 自动选中新创建的贴吧
    selectBar(newBar)

    // 插入到候选列表头部
    filteredBars.value.unshift(newBar)
    if (!allBarsCache.find(b => b.id === newBar.id)) allBarsCache.push(newBar)

    showCreateBarModal.value = false
    alert(`贴吧「${name}」创建成功！`)
  } catch (e) {
    console.error('创建贴吧失败:', e)
    alert(e.response?.data?.message || '创建失败，请重试')
  } finally {
    creatingBar.value = false
  }
}

// 媒体文件状态
const images = ref([])       // [{ file: File, preview: string }]
const videoFile = ref(null)   // File | null
const videoPreview = ref('')  // blob URL

// 文件输入框引用
const imageInputRef = ref(null)
const videoInputRef = ref(null)

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
    // 校验大小：10MB（与后端一致）
    if (file.size > 10 * 1024 * 1024) {
      alert(`图片 "${file.name}" 超过 10MB 限制`)
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

  if (file.size > 10 * 1024 * 1024) {
    alert('视频不能超过 10MB')
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
  barSearchKeyword.value = ''
  showBarDropdown.value = false
  showCreateBarModal.value = false
  emit('close')
}
const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    // ========== 第一步：先创建帖子（不包含媒体） ==========
    const postPayload = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      bar_id: Number(form.value.bar_id)
    }

    const postResult = await postsApi.create(postPayload)
    const postId = postResult.data?.id || postResult.id

    if (!postId) {
      throw new Error('创建帖子失败，未获取到帖子ID')
    }

    // ========== 第二步：上传所有媒体文件（带上 postId） ==========
    const uploadTasks = []

    for (const img of images.value) {
      uploadTasks.push(uploadWithPostId(img.file, postId))
    }
    if (videoFile.value) {
      uploadTasks.push(uploadWithPostId(videoFile.value, postId))
    }

    let uploadResults = []
    if (uploadTasks.length > 0) {
      uploading.value = true
      try {
        uploadResults = await Promise.all(uploadTasks)
      } catch (e) {
        console.error('媒体上传失败:', e)
        // 上传失败时删除已创建的帖子
        try {
          await postsApi.delete(postId)
        } catch (deleteErr) {
          console.error('清理帖子失败:', deleteErr)
        }
        alert(`上传失败: ${e.response?.data?.message || e.message || '网络异常'}`)
        return
      } finally {
        uploading.value = false
      }
    }

    // ========== 第三步：组装媒体数据并更新帖子 ==========
    const imageResults = uploadResults.filter(r => r.data?.type === 'image')
    const videoResult = uploadResults.find(r => r.data?.type === 'video')

    console.log('[CreatePost] 原始上传结果:', JSON.stringify(uploadResults))
    console.log('[CreatePost] imageResults:', JSON.stringify(imageResults))
    console.log('[CreatePost] videoResult:', videoResult ? JSON.stringify(videoResult.data) : 'none')

    const updatePayload = {}

    if (imageResults.length > 0) {
      updatePayload.images = JSON.stringify(imageResults.map(r => r.data.url))
      updatePayload.media_type = 'image'
      updatePayload.media_url = imageResults.map(r => r.data.url).join(',')
    }

    if (videoResult) {
      updatePayload.video = videoResult.data.url
      updatePayload.media_type = updatePayload.media_type === 'image' ? 'mixed' : 'video'
      // 如果有图片也有视频，用 | 分隔
      if (updatePayload.media_url) {
        updatePayload.media_url += '|' + videoResult.data.url
      } else {
        updatePayload.media_url = videoResult.data.url
      }
    }

    console.log('[CreatePost] 最终 updatePayload:', JSON.stringify(updatePayload))

    // 更新帖子（如果有媒体文件）
    if (Object.keys(updatePayload).length > 0) {
      try {
        // 后端 PUT 接口要求必须传 title + content（通用编辑接口）
        const fullPayload = {
          title: form.value.title.trim(),
          content: form.value.content.trim(),
          ...updatePayload
        }
        console.log('[CreatePost] 最终 fullPayload:', JSON.stringify(fullPayload))
        const updateRes = await postsApi.update(postId, fullPayload)
        console.log('[CreatePost] ✅ 帖子媒体更新成功! 返回:', JSON.stringify(updateRes))
      } catch (updateErr) {
        console.error('[CreatePost] ❌ 更新帖子媒体失败!', updateErr)
        console.error('[CreatePost] ❌ 错误状态码:', updateErr.response?.status)
        console.error('[CreatePost] ❌ 错误响应体:', JSON.stringify(updateErr.response?.data))
        alert(`⚠️ 帖子已发布，但媒体信息更新失败:\n状态码: ${updateErr.response?.status || '未知'}\n原因: ${updateErr.response?.data?.message || updateErr.message || '未知错误'}`)
      }
    }

    // 清除帖子列表缓存
    request.clearCache('/posts')

    emit('created', { id: postId, ...postPayload, ...updatePayload })
    close()
    await router.push(`/post/${postId}`)

  } catch (e) {
    console.error('发帖失败:', e)
    alert(e.response?.data?.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 辅助函数：上传文件并传入 postId
const uploadWithPostId = (file, postId) => {
  console.log('[Upload] 即将上传文件:', file.name, 'size:', file.size, 'postId:', postId)
  return postsApi.uploadMedia(file, postId)
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

/* ====== 贴吧搜索选择器 ====== */
.bar-select-wrapper { position: relative; margin-bottom: 16px; }
.bar-search-box { position: relative; }
.bar-search-input {
  width: 100%; padding: 10px 14px;
  background: var(--bg-color); border: 2px solid var(--border-color);
  border-radius: 8px; color: var(--text-color);
  font-size: 0.9rem; outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.bar-search-input:focus {
  border-color: var(--primary-color);
}
/* 下拉候选 */
.bar-dropdown {
  position: absolute;
  top: 100%;
  left: 0; right: 0;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  margin-top: 4px;
}
.bar-dropdown-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; cursor: pointer;
  transition: background 0.15s;
  font-size: 0.88rem;
  color: var(--text-color);
}
.bar-dropdown-item:hover,
.bar-dropdown-item.bar-highlighted {
  background: rgba(94, 129, 255, 0.08);
}
.bar-dropdown-item.bar-highlighted {
  background: rgba(选中, 129, 255, 0.08); /* fallback */
  background: rgba(94, 129, 255, 0.1);
}
.bar-name { font-weight: 500; }
.bar-meta {
  font-size: 0.75rem; color: var(--text-secondary);
  flex-shrink: 0; margin-left: 8px;
}
.bar-loading,
.bar-empty {
  justify-content: center; color: var(--text-secondary);
  font-size: 0.82rem; cursor: default;
}
.bar-loading:hover,
.bar-empty:hover { background: transparent; }
.bar-create-option {
  color: var(--primary-color);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
  gap: 8px;
}
.bar-create-option i { font-size: 0.85rem; }
.bar-create-option:hover {
  background: rgba(94, 129, 255, 0.06);
}
/* 已选标签 */
.selected-bar-tag {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 8px; padding: 5px 12px;
  background: rgba(94, 129, 255, 0.08);
  border-radius: 16px; font-size: 0.85rem;
  color: var(--primary-color);
}
.tag-text i { margin-right: 4px; }
.tag-remove {
  background: none; border: none; color: var(--text-secondary);
  font-size: 1.1rem; cursor: pointer; line-height: 1;
  padding: 0 2px;
}
.tag-remove:hover { color: #ef4444; }

/* ====== 创建贴吧内嵌弹窗 ====== */
.create-bar-overlay {
  z-index: 1100;
}
.create-bar-modal {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  width: 420px; max-width: 90vw;
  padding: 24px;
}
.create-bar-modal h4 {
  margin: 0 0 16px; font-size: 1rem; color: var(--text-color);
}
.create-bar-form .form-group { margin-bottom: 14px; }
.create-bar-form label {
  display: block; font-size: 0.84rem; font-weight: 500;
  color: var(--text-secondary); margin-bottom: 5px;
}
.create-bar-form .form-textarea { min-height: 60px; font-size: 0.85rem; }
.create-bar-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 18px;
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
