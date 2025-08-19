<template>
  <div v-if="loading">
    <ContractsCardSkeleton />
  </div>
  <div v-else class="card-content">
    <div v-if="contracts.length === 0" class="empty-state">
      <i class="fas fa-file-contract text-5xl text-gray-300 mb-4"></i>
      <p class="text-sm text-gray-600">등록된 계약서가 없습니다.</p>
    </div>

    <div v-else>
      <div v-for="(contract, index) in contracts.slice(0, 3)" :key="index" class="contract-item">
        <div class="contract-header">
          <h4 class="contract-title">{{ contract.title }}</h4>
          <span class="contract-status" :class="`status-${contract.status}`">
            {{ getStatusLabel(contract.status) }}
          </span>
        </div>

        <div class="text-sm text-gray-600 mb-3">
          {{ formatDate(contract.createdAt) }}
        </div>

        <div class="contract-actions">
          <button 
            class="view-btn"
            @click="handleView(contract)"
          >
            <i v-if="contract.status === 'COMPLETED' || contract.status === 'completed'" class="fas fa-file-pdf"></i>
            <i v-else class="fas fa-comments"></i>
            <span>{{ contract.status === 'COMPLETED' || contract.status === 'completed' ? '계약서 보기' : '채팅방 이동' }}</span>
          </button>
          <button 
            v-if="contract.fileUrl"
            class="download-btn"
            @click="handleDownload(contract)"
          >
            <i class="fas fa-download"></i>
            <span>다운로드</span>
          </button>
        </div>
      </div>
    </div>

    <div class="view-all-section">
      <router-link to="/mypage/contracts" class="view-all-button"> 전체보기 </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ContractsCardSkeleton from '@/components/mypage/skeleton/ContractsCardSkeleton.vue'

const router = useRouter()

defineProps({
  contracts: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const handleView = (contract) => {
  // 완료된 계약서는 완료 페이지로
  if (contract.status === 'COMPLETED' || contract.status === 'completed') {
    if (contract.fileUrl) {
      // PDF 다운로드
      handleDownload(contract)
    }
  } else if (contract.chatRoomId || contract.contractId) {
    // 채팅방으로 이동
    router.push(`/contract/${contract.chatRoomId || contract.contractId}`)
  }
}

const handleDownload = (contract) => {
  if (!contract.fileUrl) return
  
  // PDF 다운로드
  const link = document.createElement('a')
  link.href = contract.fileUrl
  link.download = `계약서_${contract.contractId}.pdf`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const getStatusLabel = (status) => {
  const labels = {
    STEP0: '사전조사',
    STEP1: '정보확인',
    STEP2: '금액조율',
    ROUND0: '1차 특약조율',
    ROUND1: '2차 특약조율',
    ROUND2: '3차 특약조율',
    ROUND3: '최종 특약선택',
    STEP4: '적법성 검사',
    COMPLETED: '완료',
  }
  return labels[status] || labels[status?.toUpperCase()] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '오늘'
  } else if (days === 1) {
    return '어제'
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return date.toLocaleDateString('ko-KR')
  }
}
</script>

<style scoped>
.card-content {
  @apply flex-1 flex flex-col;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-10 text-center;
}

.contract-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-4 flex flex-col;
  min-height: 126px;
}

.contract-item:last-of-type {
  @apply mb-0;
}

.contract-header {
  @apply w-full flex justify-between items-center mb-2;
}

.contract-title {
  @apply text-sm font-medium text-gray-700 flex-1 mr-2 truncate;
  max-width: 200px;
}

.contract-status {
  @apply text-xs font-medium px-2 py-1 rounded;
}

.status-completed,
.status-COMPLETED {
  @apply bg-green-100 text-green-800;
}

.status-progress {
  @apply bg-yellow-100 text-yellow-900;
}

.status-draft,
.status-STEP0 {
  @apply bg-indigo-100 text-indigo-800;
}

.status-STEP1,
.status-STEP2 {
  @apply bg-blue-100 text-blue-800;
}

.status-ROUND0,
.status-ROUND1,
.status-ROUND2,
.status-ROUND3 {
  @apply bg-purple-100 text-purple-800;
}

.status-STEP4 {
  @apply bg-emerald-100 text-emerald-800;
}

.status-cancelled {
  @apply bg-red-100 text-red-800;
}

.contract-actions {
  @apply w-full flex gap-2;
}

.view-btn,
.download-btn {
  @apply flex-1 h-8 border-none rounded text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1;
}

.view-btn {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.view-btn i {
  @apply text-xs;
}

.download-btn {
  @apply bg-yellow-100 text-gray-700 ml-2 hover:bg-yellow-200;
}

.download-btn i {
  @apply text-xs;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.view-all-button {
  @apply w-full h-10 border border-yellow-primary rounded bg-white text-base text-yellow-primary no-underline px-4 py-2 flex justify-center items-center cursor-pointer transition-all duration-200 hover:bg-yellow-50;
}
</style>
