<template>
  <div class="contract-password-download">
    <div class="download-card">
      <!-- 헤더 -->
      <div class="card-header">
        <h3 class="text-lg font-semibold">최종 계약서 다운로드</h3>
        <span class="text-sm text-gray-500">서명 완료</span>
      </div>

      <!-- 컨텐츠 -->
      <div class="card-body">
        <!-- 계약서 정보 -->
        <div class="contract-info">
          <div class="info-item">
            <span class="label">계약서 번호:</span>
            <span class="value">{{ contractId }}</span>
          </div>
          <div class="info-item">
            <span class="label">생성일:</span>
            <span class="value">{{ formatDate(createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">서명 완료일:</span>
            <span class="value">{{ formatDate(signedAt) }}</span>
          </div>
        </div>

        <!-- 비밀번호 입력 폼 -->
        <div v-if="!downloadUrl" class="password-form">
          <label class="block mb-2 text-sm font-medium">
            다운로드 비밀번호를 입력하세요
          </label>
          <div class="flex gap-2">
            <input
              v-model="password"
              type="password"
              placeholder="비밀번호 입력"
              class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="verifyPassword"
            />
            <button
              @click="verifyPassword"
              :disabled="!password || verifying"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ verifying ? '확인 중...' : '확인' }}
            </button>
          </div>
          <p v-if="error" class="mt-2 text-sm text-red-600">
            {{ error }}
          </p>
          <p class="mt-2 text-xs text-gray-500">
            * 비밀번호는 계약 당사자에게 별도로 전달됩니다
          </p>
        </div>

        <!-- 다운로드 준비 완료 -->
        <div v-else class="download-ready">
          <div class="success-message">
            <span class="text-green-600 text-lg">✓</span>
            <p class="text-green-700">비밀번호가 확인되었습니다</p>
          </div>
          
          <button
            @click="downloadFile"
            class="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            최종 계약서 다운로드
          </button>
          
          <p class="mt-3 text-xs text-gray-500 text-center">
            다운로드 링크는 24시간 동안 유효합니다
          </p>
        </div>

        <!-- 추가 옵션 -->
        <div class="additional-options">
          <button
            @click="requestNewPassword"
            class="text-sm text-blue-600 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { verifyContractPassword, getDownloadUrl } from '@/apis/contractApi'

const props = defineProps({
  contractId: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: ''
  },
  signedAt: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['download', 'password-reset'])

// 상태 관리
const password = ref('')
const downloadUrl = ref(null)
const verifying = ref(false)
const error = ref(null)

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 비밀번호 확인
const verifyPassword = async () => {
  if (!password.value) return
  
  verifying.value = true
  error.value = null
  
  try {
    // API 호출하여 비밀번호 확인
    const response = await verifyContractPassword(props.contractId, password.value)
    
    if (response.success) {
      // 다운로드 URL 받기
      downloadUrl.value = response.data.downloadUrl
    } else {
      error.value = '비밀번호가 일치하지 않습니다'
    }
  } catch (err) {
    console.error('비밀번호 확인 실패:', err)
    error.value = '비밀번호 확인 중 오류가 발생했습니다'
  } finally {
    verifying.value = false
  }
}

// 파일 다운로드
const downloadFile = () => {
  if (!downloadUrl.value) return
  
  // 새 창에서 다운로드
  const link = document.createElement('a')
  link.href = downloadUrl.value
  link.download = `contract_${props.contractId}_signed.pdf`
  link.click()
  
  emit('download')
}

// 비밀번호 재설정 요청
const requestNewPassword = () => {
  emit('password-reset')
}
</script>

<style scoped>
.contract-password-download {
  @apply w-full max-w-md mx-auto;
}

.download-card {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}

.card-header {
  @apply flex justify-between items-center p-4 bg-gray-50 border-b;
}

.card-body {
  @apply p-6 space-y-6;
}

.contract-info {
  @apply space-y-2 p-4 bg-gray-50 rounded;
}

.info-item {
  @apply flex justify-between text-sm;
}

.info-item .label {
  @apply text-gray-600;
}

.info-item .value {
  @apply font-medium text-gray-900;
}

.password-form {
  @apply space-y-3;
}

.download-ready {
  @apply text-center;
}

.success-message {
  @apply flex items-center justify-center gap-2 p-4 bg-green-50 rounded;
}

.additional-options {
  @apply text-center pt-4 border-t;
}
</style>