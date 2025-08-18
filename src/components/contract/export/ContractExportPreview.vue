<template>
  <div class="contract-export-preview">
    <!-- 미리보기 헤더 -->
    <div class="preview-header">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold">계약서 미리보기</h3>
        <span class="text-sm text-gray-500">(서명 전 버전)</span>
      </div>
      <button 
        @click="closePreview" 
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
      >
        닫기
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center h-96">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">계약서를 불러오는 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center h-96">
      <div class="text-center text-red-600">
        <p class="text-xl mb-2">⚠️</p>
        <p>{{ error }}</p>
        <button 
          @click="retryLoad" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    </div>

    <!-- PDF 미리보기 -->
    <div v-else-if="pdfData" class="pdf-container">
      <!-- URL인 경우 직접 iframe으로 표시 -->
      <iframe 
        v-if="isPdfUrl"
        :src="pdfData"
        class="w-full h-[600px] border-0"
        title="PDF Viewer"
        type="application/pdf"
      />
      <!-- ArrayBuffer나 base64인 경우 PdfViewer 컴포넌트 사용 -->
      <PdfViewer
        v-else
        :source="pdfData"
        :initial-scale="1"
        @loaded="handlePdfLoaded"
        @page-change="handlePageChange"
        @error="handlePdfError"
        class="h-[600px]"
      />
      
      <!-- 안내 메시지 -->
      <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        <p>📋 서명이 완료되면 비밀번호로 보호된 최종 계약서를 다운로드할 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import PdfViewer from '@/components/common/PdfViewer.vue'
import { createTempPdfUrl } from '@/apis/contractChatApi'
import api from '@/apis'

const props = defineProps({
  contractChatId: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  // 미리보기 전용 모드 (다운로드 불가)
  previewOnly: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// 상태 관리
const loading = ref(false)
const error = ref(null)
const pdfData = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const isPdfUrl = ref(false)

// PDF 불러오기
const loadPDF = async () => {
  loading.value = true
  error.value = null
  
  try {
    // preview-url 엔드포인트에서 S3 key 받기 (createTempPdfUrl 사용)
    const s3Url = await createTempPdfUrl(props.contractChatId)
    console.log('S3 URL received from createTempPdfUrl:', s3Url)
    
    if (s3Url) {
      // S3 URL을 직접 iframe에서 사용
      pdfData.value = s3Url
      isPdfUrl.value = true
      console.log('Using S3 URL for iframe display:', s3Url)
    } else {
      throw new Error('S3 URL을 받을 수 없습니다')
    }
  } catch (err) {
    console.error('PDF 로드 실패:', err)
    error.value = err.message || '계약서를 불러오는데 실패했습니다'
  } finally {
    loading.value = false
  }
}

// PDF 로드 완료
const handlePdfLoaded = (data) => {
  console.log('PDF loaded:', data)
  if (data && data.numPages) {
    totalPages.value = data.numPages
    currentPage.value = data.currentPage || 1
  }
}

// 페이지 변경 처리
const handlePageChange = (newPage) => {
  console.log('Page changed to:', newPage)
  currentPage.value = newPage
}

// PDF 에러 처리
const handlePdfError = (err) => {
  console.error('PDF 에러:', err)
  error.value = 'PDF를 표시하는데 문제가 발생했습니다: ' + (err.message || err)
}


// 미리보기 닫기
const closePreview = () => {
  emit('close')
}

// 재시도
const retryLoad = () => {
  loadPDF()
}

// visible prop 변경 감지
watch(() => props.visible, (newVal) => {
  if (newVal && !pdfData.value) {
    loadPDF()
  }
})

// 컴포넌트 마운트 시 자동 로드 (visible이 true인 경우)
onMounted(() => {
  if (props.visible) {
    loadPDF()
  }
})

// 컴포넌트 언마운트 시 메모리 정리
onUnmounted(() => {
  // PdfViewer 컴포넌트가 자체적으로 정리를 수행함
})
</script>

<style scoped>
.contract-export-preview {
  @apply bg-white rounded-lg shadow-lg overflow-hidden;
  width: 100%;
  max-width: 900px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  @apply flex justify-between items-center p-4 border-b;
}

.pdf-container {
  @apply flex-1 overflow-auto p-4 bg-gray-50;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pdf-viewer {
  @apply shadow-md;
  max-width: 100%;
  height: auto;
}

.page-navigation {
  @apply flex items-center justify-center mt-4 p-3 bg-white rounded shadow;
}
</style>