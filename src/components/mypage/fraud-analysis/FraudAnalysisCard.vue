<template>
  <div 
    class="analysis-card" 
    @click="handleClick"
    @keyup.enter="handleClick"
    tabindex="0"
    role="button"
    aria-label="사기위험도 분석 상세보기"
  >
    <div class="card-content">
      <div class="card-header">
        <h4 class="analysis-title">{{ analysis.title }}</h4>
      </div>
      
      <div class="analysis-type">
        {{ buildingType }}
      </div>
      
      <div class="analysis-date">분석일: {{ formattedDate }}</div>
      
      <div class="card-footer">
        <span class="risk-badge" :class="`risk-${analysis.riskLevel}`">
          {{ riskLabel }}
        </span>
        <button class="detail-btn" @click.stop="handleView">
          <span class="detail-text">상세보기</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  analysis: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 건물 유형 라벨
const buildingType = computed(() => {
  if (!props.analysis.buildingType) return '부동산'
  
  const labels = {
    APARTMENT: '아파트',
    VILLA: '빌라',
    OFFICETEL: '오피스텔',
    HOUSE: '단독주택',
    OPEN_ONE_ROOM: '오픈형 원룸',
    SEPARATED_ONE_ROOM: '분리형 원룸',
    TWO_ROOM: '투룸'
  }
  return labels[props.analysis.buildingType] || props.analysis.buildingType
})

// 위험도 라벨
const riskLabel = computed(() => {
  const labels = {
    low: '안전',
    medium: '경고',
    high: '위험'
  }
  return labels[props.analysis.riskLevel] || '분석중'
})

// 날짜 포맷
const formattedDate = computed(() => {
  if (!props.analysis.createdAt) return '-'
  const date = new Date(props.analysis.createdAt)
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
})

const handleClick = () => {
  router.push(`/risk-check/result/${props.analysis.id}`)
}

const handleView = () => {
  router.push(`/risk-check/result/${props.analysis.id}`)
}
</script>

<style scoped>
.analysis-card {
  width: 100%;
  min-height: 176px;
  height: auto;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow:
    0px 10px 15px -3px rgba(0, 0, 0, 0.1),
    0px 4px 6px -4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.analysis-card:hover {
  box-shadow:
    0px 10px 25px -3px rgba(0, 0, 0, 0.15),
    0px 4px 8px -4px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.card-header {
  margin-bottom: 12px;
}

.analysis-title {
  font-family: Roboto;
  font-size: 20px;
  font-weight: 600;
  color: #484b51;
  margin: 0;
  flex: 1;
  line-height: 1.2;
}

.analysis-type {
  font-family: Roboto;
  font-size: 14px;
  font-weight: 400;
  color: #9ca3af;
  margin-bottom: 12px;
  line-height: 1.43;
}

.analysis-date {
  font-family: Roboto;
  font-size: 16px;
  font-weight: 400;
  color: #696e76;
  margin-bottom: 24px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.risk-badge {
  padding: 8px 16px;
  border-radius: 4px;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
}

.risk-low {
  background-color: #dcfce7;
  color: #166534;
}

.risk-medium {
  background-color: #fef9c3;
  color: #854d0e;
}

.risk-high {
  background-color: #fee2e2;
  color: #991b1b;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: transparent;
  color: #484b51;
  border: none;
  border-radius: 8px;
  font-family: Roboto;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn:hover {
  background-color: #f3f4f6;
}

.detail-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}

.detail-btn i {
  font-size: 14px;
  color: #ffbc00;
  line-height: 1;
}

@media (max-width: 768px) {
  .analysis-card {
    padding: 24px;
  }
}
</style>