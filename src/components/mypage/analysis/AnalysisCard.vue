<template>
  <div v-if="loading">
    <AnalysisCardSkeleton />
  </div>
  <div v-else class="card-content">
    <div v-if="analyses.length === 0" class="empty-state">
      <i class="fas fa-shield-alt text-5xl text-gray-300 mb-4"></i>
      <p class="text-sm text-gray-600">분석 이력이 없습니다.</p>
    </div>

    <div v-else>
      <div
        v-for="(analysis, index) in analyses.slice(0, 3)"
        :key="index"
        class="analysis-item"
      >
        <div class="analysis-header">
          <h4 class="analysis-title">{{ analysis.title }}</h4>
        </div>

        <div class="text-sm text-gray-600 mb-3">
          분석일: {{ formatDate(analysis.createdAt) }}
        </div>

        <div class="analysis-actions">
          <span class="risk-badge" :class="`risk-${analysis.riskLevel}`">
            {{ getRiskLabel(analysis.riskLevel) }}
          </span>
          <button class="detail-btn" @click="$emit('view-detail', analysis)">
            상세보기
          </button>
        </div>
      </div>
    </div>

    <div class="view-all-section">
      <router-link to="/mypage/fraud-analysis" class="view-all-button">
        전체보기
      </router-link>
    </div>
  </div>
</template>

<script setup>
import AnalysisCardSkeleton from '@/components/mypage/skeleton/AnalysisCardSkeleton.vue'

defineProps({
  analyses: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-detail'])

const getRiskLabel = (level) => {
  const labels = {
    low: '안전',
    medium: '경고',
    high: '위험',
  }
  return labels[level] || '분석중'
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

.analysis-item {
  @apply w-full border border-gray-300 rounded-lg p-4 mb-6 flex flex-col;
  min-height: 118px;
}

.analysis-header {
  @apply w-full flex justify-between items-center mb-2;
}

.analysis-title {
  @apply text-sm font-medium text-gray-700 flex-1 break-words;
}

.analysis-actions {
  @apply w-full flex justify-between items-center;
}

.risk-badge {
  @apply text-xs font-medium px-2 py-1 rounded;
}

.risk-low {
  @apply bg-green-100 text-green-800;
}

.risk-medium {
  @apply bg-yellow-100 text-yellow-900;
}

.risk-high {
  @apply bg-red-100 text-red-800;
}

.detail-btn {
  @apply bg-gray-100 border-none rounded text-xs font-medium text-gray-700 px-3 py-1 cursor-pointer transition-all duration-200 hover:bg-gray-200 flex items-center justify-center;
  width: 88.64px;
  height: 24px;
}

.view-all-section {
  @apply mt-6 mb-2;
}

.view-all-button {
  @apply w-full h-10 border border-yellow-primary rounded bg-white text-base text-yellow-primary no-underline px-4 py-2 flex justify-center items-center cursor-pointer transition-all duration-200 hover:bg-yellow-50;
}
</style>