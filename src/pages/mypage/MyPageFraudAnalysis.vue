<template>
  <div class="mypage-fraud-analysis">
    <!-- 페이지 헤더 -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">사기위험도분석</h1>
      </div>
    </header>

    <!-- 메인 콘텐츠 영역 -->
    <main class="main-content">
      <!-- 로딩 상태 (스켈레톤 UI) -->
      <template v-if="loading">
        <div class="analyses-container">
          <FraudAnalysisCardSkeleton v-for="i in 6" :key="`skeleton-${i}`" />
        </div>
      </template>

      <!-- 에러 상태 -->
      <FraudAnalysisError 
        v-else-if="error" 
        :message="errorMessage"
        @retry="fetchAnalyses" 
      />

      <!-- 빈 상태 -->
      <FraudAnalysisEmpty v-else-if="!loading && analyses.length === 0" />

      <!-- 분석 카드 목록 -->
      <div v-else class="analyses-container">
        <FraudAnalysisCard
          v-for="analysis in paginatedAnalyses"
          :key="analysis.id"
          :analysis="analysis"
        />
      </div>

      <!-- 페이지네이션 -->
      <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 네비게이션">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          aria-label="이전 페이지"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          aria-label="다음 페이지"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </nav>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { mypageAPI } from '@/apis/mypage'
import FraudAnalysisCard from '@/components/mypage/fraud-analysis/FraudAnalysisCard.vue'
import FraudAnalysisCardSkeleton from '@/components/mypage/fraud-analysis/FraudAnalysisCardSkeleton.vue'
import FraudAnalysisEmpty from '@/components/mypage/fraud-analysis/FraudAnalysisEmpty.vue'
import FraudAnalysisError from '@/components/mypage/fraud-analysis/FraudAnalysisError.vue'
// 상태 관리
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const analyses = ref([])
const currentPage = ref(1)
const itemsPerPage = 9

// 페이지네이션 계산
const totalPages = computed(() => 
  Math.ceil(analyses.value.length / itemsPerPage)
)

const paginatedAnalyses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return analyses.value.slice(start, end)
})

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 데이터 매핑
const mapAnalysisData = (analysis) => ({
  id: analysis.analysisId,
  title: analysis.address || analysis.propertyAddress || '주소 미정',
  buildingType: analysis.buildingType || analysis.residenceType,
  transactionType: analysis.transactionType,
  depositPrice: analysis.depositPrice,
  monthlyRent: analysis.monthlyRent,
  riskLevel: analysis.riskType === 'SAFE' ? 'low' : 
             analysis.riskType === 'WARN' ? 'medium' : 'high',
  createdAt: analysis.analysisDate,
  score: analysis.riskScore || 0
})

// 데이터 로드
const fetchAnalyses = async () => {
  loading.value = true
  error.value = false
  errorMessage.value = ''
  
  try {
    const response = await mypageAPI.getMyRiskAnalyses(0, 100) // 모든 데이터 가져오기
    
    if (response.success && response.data) {
      analyses.value = response.data.content.map(mapAnalysisData)
    } else {
      throw new Error('데이터를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('Load analyses error:', err)
    error.value = true
    errorMessage.value = err.message || '분석 내역을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트
onMounted(() => {
  fetchAnalyses()
})
</script>

<style scoped>
/* 페이지 전체 스타일 */
.mypage-fraud-analysis {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
}

/* 페이지 헤더 */
.page-header {
  height: 65px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dde1e4;
}

.header-content {
  width: 100%;
  padding: 0 32px;
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.2;
}

/* 메인 콘텐츠 */
.main-content {
  padding: 48px;
  background-color: #ffffff;
}

/* 분석 카드 컨테이너 */
.analyses-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 48px;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #dde1e4;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #666666;
}

.page-btn:hover:not(:disabled) {
  background-color: #fff8e7;
  border-color: #ff8c00;
  color: #ff8c00;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  line-height: 1.4;
  min-width: 60px;
  text-align: center;
}

/* 반응형 디자인 */
@media (min-width: 1400px) {
  .analyses-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1400px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    padding: 32px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .main-content {
    padding: 16px;
  }

  .analyses-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>