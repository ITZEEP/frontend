<template>
  <div class="pdf-viewer-container" ref="containerRef">
    <!-- 툴바 -->
    <div class="pdf-toolbar" v-if="!props.hideToolbar">
      <div class="toolbar-group">
        <!-- 페이지 네비게이션 -->
        <button
          @click="previousPage"
          :disabled="currentPage <= 1"
          class="toolbar-btn"
          title="이전 페이지"
        >
          ◀
        </button>

        <div class="page-info">
          <input
            v-model.number="currentPage"
            @change="goToPage"
            type="number"
            :min="1"
            :max="totalPages"
            class="page-input"
          />
          <span class="text-sm text-gray-600">/ {{ totalPages }}</span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="toolbar-btn"
          title="다음 페이지"
        >
          ▶
        </button>
      </div>

      <div class="toolbar-group">
        <!-- 확대/축소 -->
        <button @click="zoomOut" class="toolbar-btn" title="축소">-</button>
        <span class="zoom-info">{{ Math.round(currentScale * 100) }}%</span>
        <button @click="zoomIn" class="toolbar-btn" title="확대">+</button>

        <select v-model="scaleMode" @change="changeScale" class="scale-select">
          <option value="auto">자동 맞춤</option>
          <option value="page-width">너비 맞춤</option>
          <option value="page-fit">페이지 맞춤</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select>
      </div>
    </div>

    <!-- PDF 뷰어 영역 -->
    <div class="pdf-content" :style="{ height: contentHeight }">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p class="mt-4">PDF를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <div class="space-x-2">
          <button @click="retry" class="retry-btn">다시 시도</button>
          <button @click="useFallbackViewer" class="fallback-btn">브라우저 뷰어 사용</button>
        </div>
      </div>

      <!-- Fallback 뷰어 -->
      <div v-else-if="useFallback && pdfBlobUrl" class="fallback-viewer">
        <iframe :src="pdfBlobUrl" class="w-full h-full border-0" title="PDF Viewer" />
      </div>

      <!-- PDF 캔버스 -->
      <div v-else class="pdf-canvas-container">
        <canvas
          ref="canvasRef"
          class="pdf-canvas"
          :style="{ transform: `scale(${renderScale})` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).href

// Props
const props = defineProps({
  source: {
    type: [String, ArrayBuffer, Uint8Array],
    required: true,
  },
  initialPage: {
    type: Number,
    default: 1,
  },
  initialScale: {
    type: Number,
    default: 1.0,
  },
  hideToolbar: {
    type: Boolean,
    default: false,
  },
  height: {
    type: String,
    default: '600px',
  },
})

// Emits
const emit = defineEmits(['loaded', 'page-change', 'error'])

// 반응형 상태
const loading = ref(true)
const error = ref(null)
const pdfDoc = ref(null)
const currentPage = ref(props.initialPage)
const totalPages = ref(0)
const currentScale = ref(props.initialScale)
const scaleMode = ref('auto')
const renderScale = ref(1)

// Fallback 관련
const useFallback = ref(false)
const pdfBlobUrl = ref('')

// DOM 참조
const canvasRef = ref(null)
const containerRef = ref(null)

// 계산된 속성
const contentHeight = computed(() => {
  if (props.hideToolbar) return props.height
  return `calc(${props.height} - 50px)` // 툴바 높이 제외
})

// PDF 로드 함수
const loadPdf = async () => {
  if (!props.source) {
    error.value = 'PDF 소스가 제공되지 않았습니다'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  useFallback.value = false

  try {
    console.log('PDF 로드 시작:', typeof props.source, props.source?.constructor?.name)

    let pdfSource = props.source

    // 데이터 타입별 처리
    if (typeof pdfSource === 'string') {
      if (pdfSource.startsWith('data:application/pdf;base64,')) {
        // Base64 data URL
        const base64 = pdfSource.split(',')[1]
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        pdfSource = bytes
      } else if (pdfSource.startsWith('http')) {
        // URL은 그대로 사용
      } else {
        // Base64 문자열인 경우
        const binaryString = atob(pdfSource)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        pdfSource = bytes
      }
    } else if (pdfSource instanceof ArrayBuffer) {
      // ArrayBuffer를 Uint8Array로 변환
      pdfSource = new Uint8Array(pdfSource)
    }

    // PDF.js로 문서 로드
    const loadingTask = pdfjsLib.getDocument({
      data: pdfSource,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
    })

    // 진행률 추적
    loadingTask.onProgress = (progress) => {
      if (progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100)
        console.log(`PDF 로딩: ${percent}%`)
      }
    }

    pdfDoc.value = await loadingTask.promise
    totalPages.value = pdfDoc.value.numPages

    console.log(`PDF 로드 완료: ${totalPages.value} 페이지`)

    // 첫 페이지 렌더링
    await renderPage(currentPage.value)

    emit('loaded', {
      numPages: totalPages.value,
      currentPage: currentPage.value,
    })
  } catch (err) {
    console.error('PDF 로드 실패:', err)
    error.value = `PDF를 불러올 수 없습니다: ${err.message}`
    emit('error', err)
  } finally {
    loading.value = false
  }
}

// 페이지 렌더링
const renderPage = async (pageNum) => {
  if (!pdfDoc.value || !canvasRef.value) return

  try {
    console.log(`페이지 ${pageNum} 렌더링 시작`)

    const page = await pdfDoc.value.getPage(pageNum)
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    // 뷰포트 계산
    const viewport = page.getViewport({ scale: 1.0 })

    // 스케일 계산
    let scale = currentScale.value

    if (scaleMode.value === 'auto' || scaleMode.value === 'page-width') {
      if (containerRef.value) {
        const containerWidth = containerRef.value.clientWidth - 40 // 패딩
        scale = containerWidth / viewport.width
      }
    } else if (scaleMode.value === 'page-fit') {
      if (containerRef.value) {
        const containerWidth = containerRef.value.clientWidth - 40
        const containerHeight = containerRef.value.clientHeight - 100 // 툴바 등 고려
        scale = Math.min(containerWidth / viewport.width, containerHeight / viewport.height)
      }
    } else if (!isNaN(parseFloat(scaleMode.value))) {
      scale = parseFloat(scaleMode.value)
    }

    currentScale.value = scale
    const scaledViewport = page.getViewport({ scale })

    // 캔버스 설정
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height
    canvas.style.width = scaledViewport.width + 'px'
    canvas.style.height = scaledViewport.height + 'px'

    // 렌더링
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    }

    await page.render(renderContext).promise

    console.log(`페이지 ${pageNum} 렌더링 완료`)

    emit('page-change', pageNum)
  } catch (err) {
    console.error(`페이지 ${pageNum} 렌더링 실패:`, err)
    error.value = `페이지 ${pageNum} 렌더링에 실패했습니다`
  }
}

// 페이지 네비게이션
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

const goToPage = () => {
  if (currentPage.value >= 1 && currentPage.value <= totalPages.value) {
    renderPage(currentPage.value)
  } else {
    currentPage.value = Math.max(1, Math.min(totalPages.value, currentPage.value))
  }
}

// 확대/축소
const zoomIn = () => {
  currentScale.value = Math.min(currentScale.value * 1.25, 5)
  scaleMode.value = currentScale.value.toString()
  renderPage(currentPage.value)
}

const zoomOut = () => {
  currentScale.value = Math.max(currentScale.value / 1.25, 0.25)
  scaleMode.value = currentScale.value.toString()
  renderPage(currentPage.value)
}

const changeScale = () => {
  renderPage(currentPage.value)
}

// 재시도
const retry = () => {
  error.value = null
  useFallback.value = false
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = ''
  }
  loadPdf()
}

// Fallback 뷰어
const useFallbackViewer = () => {
  useFallback.value = true
  error.value = null

  try {
    let pdfData = props.source

    if (typeof pdfData === 'string') {
      if (pdfData.startsWith('data:application/pdf;base64,')) {
        pdfBlobUrl.value = pdfData
      } else {
        pdfBlobUrl.value = `data:application/pdf;base64,${pdfData}`
      }
    } else if (pdfData instanceof ArrayBuffer || pdfData instanceof Uint8Array) {
      const blob = new Blob([pdfData], { type: 'application/pdf' })
      pdfBlobUrl.value = URL.createObjectURL(blob)
    }

    console.log('Fallback 뷰어 활성화')
  } catch (err) {
    console.error('Fallback 뷰어 설정 실패:', err)
    error.value = 'PDF를 표시할 수 없습니다'
  }
}

// 리사이즈 핸들러
const handleResize = () => {
  if (
    scaleMode.value === 'auto' ||
    scaleMode.value === 'page-width' ||
    scaleMode.value === 'page-fit'
  ) {
    renderPage(currentPage.value)
  }
}

// 생명주기
onMounted(() => {
  loadPdf()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (pdfDoc.value) {
    pdfDoc.value.destroy()
  }

  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
  }
})

// 감시자
watch(
  () => props.source,
  () => {
    if (props.source) {
      loadPdf()
    }
  },
  { immediate: false },
)

watch(
  () => props.initialPage,
  (newPage) => {
    currentPage.value = newPage
    if (pdfDoc.value) {
      renderPage(currentPage.value)
    }
  },
)
</script>

<style scoped>
.pdf-viewer-container {
  @apply w-full bg-white border border-gray-300 rounded-lg shadow-sm;
}

.pdf-toolbar {
  @apply flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg;
}

.toolbar-group {
  @apply flex items-center space-x-2;
}

.toolbar-btn {
  @apply px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-info {
  @apply flex items-center space-x-2;
}

.page-input {
  @apply w-16 px-2 py-1 text-center border border-gray-300 rounded;
}

.zoom-info {
  @apply px-2 py-1 text-sm text-gray-600;
}

.scale-select {
  @apply px-2 py-1 border border-gray-300 rounded;
}

.pdf-content {
  @apply relative overflow-auto bg-gray-100;
}

.loading-container {
  @apply flex flex-col items-center justify-center h-full;
}

.loader {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin;
}

.error-container {
  @apply flex flex-col items-center justify-center h-full p-8 text-center;
}

.retry-btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}

.fallback-btn {
  @apply px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600;
}

.fallback-viewer {
  @apply w-full h-full;
}

.pdf-canvas-container {
  @apply flex justify-center p-4;
}

.pdf-canvas {
  @apply shadow-lg border border-gray-300;
}
</style>
