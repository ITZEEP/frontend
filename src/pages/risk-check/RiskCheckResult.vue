<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import PropertyInfoCard from '@/components/risk-check/result/PropertyInfoCard.vue'
import OverallRiskSection from '@/components/risk-check/result/OverallRiskSection.vue'
import DetailedAnalysis from '@/components/risk-check/result/DetailedAnalysis.vue'
import TransactionNotes from '@/components/risk-check/result/TransactionNotes.vue'
import RecommendedServices from '@/components/risk-check/result/RecommendedServices.vue'


const router = useRouter()

// 분석 결과 데이터 (실제로는 API에서 받아오거나 이전 페이지에서 전달받아야 함)
const analysisResult = ref({
  overallRisk: 'safe', // 'safe', 'warning', 'danger'
  score: 85,
  analysisDate: '2024-01-15',
  propertyInfo: {
    title: '강남구 신사동 오피스텔',
    address: '서울시 강남구 신사동 123-45',
    type: '오피스텔',
    transactionType: '전세',
    price: '5억원',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMR8F3CEHkjY8O48Ua9SO7GjsJrJQReAWTImJ3EsUGWjyYsSjUFFauhow&s',
  },
  detailScores: {
    legal: 85,
    building: 90,
    price: 70,
    location: 95,
    future: 80,
  },
  riskFactors: [
    {
      title: '법적 안전성',
      status: 'safe',
      score: 85,
      items: [
        { name: '소유권 이전', status: 'safe', description: '정상' },
        { name: '압류/가압류', status: 'safe', description: '없음' },
        { name: '근저당 설정', status: 'warning', description: '3억원' },
        { name: '전입신고', status: 'safe', description: '가능' },
      ],
    },
    {
      title: '건물 안전성',
      status: 'safe',
      score: 90,
      items: [
        { name: '건축물 대장', status: 'safe', description: '정상' },
        { name: '위반건축물', status: 'safe', description: '해당없음' },
        { name: '건물 연식', status: 'safe', description: '5년' },
        { name: '관리 상태', status: 'safe', description: '양호' },
      ],
    },
    {
      title: '가격 적정성',
      status: 'warning',
      score: 70,
      items: [
        { name: '시세 대비', status: 'warning', description: '5% 높음' },
        { name: '전세가율', status: 'safe', description: '65%' },
        { name: '가격 추이', status: 'safe', description: '안정적' },
        { name: '보증금 보호', status: 'safe', description: '가능' },
      ],
    },
    {
      title: '입지 평가',
      status: 'safe',
      score: 95,
      items: [
        { name: '교통 접근성', status: 'safe', description: '우수' },
        { name: '생활 편의시설', status: 'safe', description: '우수' },
        { name: '학군', status: 'safe', description: '우수' },
        { name: '주변 환경', status: 'safe', description: '쾌적' },
      ],
    },
  ],
  // recommendations 배열은 제거됨 (사용하지 않음)
})

// 상세 분석 데이터 구조화
const detailedAnalysisData = computed(() => ({
  basicInfo: [
    { name: '소유자 확인', status: 'safe', description: '임대인의 이름과 등기부등본의 소유자 이름이 일치합니다.' },
    { name: '설정일', status: 'unknown', description: '확인할 수 없음' },
  ],
  legalSafety: [
    { name: '가압류', status: 'safe', description: '등기부에 기재된 가압류가 없습니다.' },
    { name: '압류', status: 'safe', description: '등기부에 기재된 압류가 없습니다.' },
    { name: '경매', status: 'safe', description: '등기부에 경매개시결정 등기가 없습니다.' },
    { name: '소송', status: 'unknown', description: '확인할 수 없음' },
  ],
  buildingSafety: [
    { name: '위반건축물', status: 'safe', description: '건축물대장에 위반건축물로 표시되어 있지 않습니다.' },
    { name: '용도변경', status: 'safe', description: '용도변경 이력이 없습니다.' },
  ],
  financialSafety: [
    { name: '근저당', status: 'warning', description: '채권최고액 3억원의 근저당이 설정되어 있습니다.' },
    { name: '전세가율', status: 'safe', description: '전세가율 65%로 적정 수준입니다.' },
  ],
}))

// 점수에 따른 상태 반환
const getScoreStatus = (score) => {
  if (score >= 80) return 'safe'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 뒤로 가기
const goBack = () => {
  router.push('/risk-check')
}


// 다른 매물 분석하기
const analyzeAnother = () => {
  router.push('/risk-check')
}

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
  // 페이지 로드 시 스크롤을 맨 위로
  window.scrollTo(0, 0)
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-[1024px] mx-auto">
      <!-- 헤더 -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="p-1 text-gray-600 hover:text-gray-800 transition-colors">
          <IconChevronLeft class="w-[17.5px] h-7" />
        </button>
        <h1 class="text-3xl font-bold text-gray-warm-700">AI 위험도 분석 결과</h1>
      </div>

      <!-- 매물 정보 카드 -->
      <PropertyInfoCard :property-info="analysisResult.propertyInfo" class="mb-8" />

      <!-- 종합 위험도 -->
      <OverallRiskSection :overall-risk="analysisResult.overallRisk" class="mb-8" />

      <!-- 상세 분석 결과 -->
      <DetailedAnalysis :analysis-data="detailedAnalysisData" class="mb-8" />

      <!-- 거래 시 참고사항 -->
      <TransactionNotes class="mb-8" />

      <!-- 추천 서비스 -->
      <RecommendedServices @analyze-another="analyzeAnother" class="mb-8" />
    </div>
  </div>
</template>

<style scoped></style>
