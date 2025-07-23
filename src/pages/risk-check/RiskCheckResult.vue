<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import PropertyInfoCard from '@/components/risk-check/result/PropertyInfoCard.vue'
import OverallRiskSection from '@/components/risk-check/result/OverallRiskSection.vue'
import DetailedAnalysis from '@/components/risk-check/result/DetailedAnalysis.vue'
import TransactionNotes from '@/components/risk-check/result/TransactionNotes.vue'
import RecommendedServices from '@/components/risk-check/result/RecommendedServices.vue'

import propertyData from '@/mocks/risk/propertyMockData.json'
import riskAnalysisData from '@/mocks/risk/riskAnalysisMockData.json'

const router = useRouter()
const route = useRoute()

const analysisId = route.params.analysisId || null
const propertyId = Number(route.params.id || 1)

let currentAnalysis, currentProperty
let dataNotFound = false

if (analysisId) {
  // analysesByHistory에서 기본 정보 가져오기
  const historyData = riskAnalysisData.analysesByHistory?.[analysisId]
  if (historyData) {
    // propertyId를 이용해 전체 분석 데이터 가져오기
    currentAnalysis = riskAnalysisData.analysesByProperty?.find(
      (a) => a.propertyId === historyData.propertyId,
    )
    if (!currentAnalysis) {
      // analysesByProperty에 없으면 historyData를 사용하되, 기본 riskFactors 생성
      currentAnalysis = historyData
    }
    currentProperty =
      propertyData.properties.find((p) => p.id === historyData.propertyId)
    
    if (!currentProperty) {
      dataNotFound = true
    }
  } else {
    // 잘못된 analysisId로 접근한 경우
    dataNotFound = true
  }
} else {
  currentAnalysis =
    riskAnalysisData.analysesByProperty?.find((a) => a.propertyId === propertyId)
  currentProperty =
    propertyData.properties.find((p) => p.id === propertyId)
  
  // 데이터를 찾을 수 없는 경우
  if (!currentAnalysis || !currentProperty) {
    dataNotFound = true
  }
}
const analysisResult = ref({
  overallRisk: currentAnalysis?.overallRisk || 'safe',
  analysisDate: currentAnalysis?.analysisDate || '2024-01-15',
  note: currentAnalysis?.note || '',
  propertyInfo: {
    title: currentProperty?.title || '',
    address: currentProperty?.address || '',
    type: currentProperty?.type || '',
    transactionType: currentProperty?.transactionType || '',
    price: currentProperty?.priceDisplay || '',
    image: currentProperty?.image || '',
  },
  riskFactors: currentAnalysis?.riskFactors
    ? [
        {
          title: '법적 안전성',
          status: 'safe',
          items: currentAnalysis.riskFactors.legalSafety.map((item) => ({
            name: item.item,
            status: item.status === '안전' ? 'safe' : item.status === '주의' ? 'warning' : 'danger',
            description: item.description,
          })),
        },
        {
          title: '건물 안전성',
          status: 'safe',
          items: currentAnalysis.riskFactors.buildingSafety.map((item) => ({
            name: item.item,
            status:
              item.status === '안전' || item.status === '적합' || item.status === '양호'
                ? 'safe'
                : item.status === '주의'
                  ? 'warning'
                  : 'danger',
            description: item.description,
          })),
        },
        {
          title: '가격 적정성',
          status: 'safe',
          items: currentAnalysis.riskFactors.priceAdequacy.map((item) => ({
            name: item.item,
            status:
              item.status === '안전' || item.status === '적정'
                ? 'safe'
                : item.status === '주의'
                  ? 'warning'
                  : 'danger',
            description: item.description,
          })),
        },
        {
          title: '입지 평가',
          status: 'safe',
          items: currentAnalysis.riskFactors.locationEvaluation.map((item) => ({
            name: item.item,
            status:
              item.status === '우수' || item.status === '양호'
                ? 'safe'
                : item.status === '보통'
                  ? 'warning'
                  : 'danger',
            description: item.description,
          })),
        },
      ]
    : generateDefaultRiskFactors(currentAnalysis?.overallRisk || 'safe'),
})

function generateDefaultRiskFactors(overallRisk) {
  const riskStatus =
    overallRisk === 'safe' ? 'safe' : overallRisk === 'warning' ? 'warning' : 'danger'

  return [
    {
      title: '법적 안전성',
      status: riskStatus,
      items: [
        {
          name: '소유권 확인',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '소유권이 확인되었습니다.'
              : riskStatus === 'warning'
                ? '소유권 확인이 필요합니다.'
                : '소유권에 문제가 있습니다.',
        },
        {
          name: '법적 제한',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '법적 제한사항이 없습니다.'
              : riskStatus === 'warning'
                ? '일부 제한사항이 있습니다.'
                : '중요한 법적 제한이 있습니다.',
        },
      ],
    },
    {
      title: '건물 안전성',
      status: riskStatus,
      items: [
        {
          name: '건물 상태',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '건물 상태가 양호합니다.'
              : riskStatus === 'warning'
                ? '일부 보수가 필요합니다.'
                : '주요 보수가 필요합니다.',
        },
        {
          name: '위반사항',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '위반사항이 없습니다.'
              : riskStatus === 'warning'
                ? '경미한 위반사항이 있습니다.'
                : '중대한 위반사항이 있습니다.',
        },
      ],
    },
    {
      title: '가격 적정성',
      status: riskStatus,
      items: [
        {
          name: '시세 대비',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '시세 대비 적정합니다.'
              : riskStatus === 'warning'
                ? '시세보다 다소 높습니다.'
                : '시세보다 매우 높습니다.',
        },
        {
          name: '가격 추이',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '가격이 안정적입니다.'
              : riskStatus === 'warning'
                ? '가격 변동이 있습니다.'
                : '가격이 불안정합니다.',
        },
      ],
    },
    {
      title: '입지 평가',
      status: riskStatus,
      items: [
        {
          name: '교통 접근성',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '교통이 매우 편리합니다.'
              : riskStatus === 'warning'
                ? '교통이 보통입니다.'
                : '교통이 불편합니다.',
        },
        {
          name: '생활 편의',
          status: riskStatus,
          description:
            riskStatus === 'safe'
              ? '편의시설이 잘 갖춰져 있습니다.'
              : riskStatus === 'warning'
                ? '기본 편의시설이 있습니다.'
                : '편의시설이 부족합니다.',
        },
      ],
    },
  ]
}

const detailedAnalysisData = computed(() => {
  // detailedAnalysis가 없는 경우 기본값 반환
  if (!currentAnalysis?.detailedAnalysis) {
    const riskStatus =
      currentAnalysis?.overallRisk === 'safe'
        ? 'safe'
        : currentAnalysis?.overallRisk === 'warning'
          ? 'warning'
          : 'danger'
    return {
      basicInfo: [
        { name: '소유자 확인', status: riskStatus, description: '분석 데이터가 없습니다.' },
        { name: '주소 일치', status: riskStatus, description: '분석 데이터가 없습니다.' },
      ],
      legalSafety: [
        { name: '법적 분쟁', status: riskStatus, description: '분석 데이터가 없습니다.' },
        { name: '위반건축물', status: riskStatus, description: '분석 데이터가 없습니다.' },
      ],
      buildingSafety: [
        { name: '건물 용도', status: riskStatus, description: '분석 데이터가 없습니다.' },
        { name: '면적 정보', status: riskStatus, description: '분석 데이터가 없습니다.' },
      ],
      financialSafety: [
        { name: '근저당', status: riskStatus, description: '분석 데이터가 없습니다.' },
        { name: '시세 대비 가격', status: riskStatus, description: '분석 데이터가 없습니다.' },
      ],
    }
  }

  return {
    basicInfo: [
      {
        name: '소유자 확인',
        status: currentAnalysis.detailedAnalysis.basicInfo.ownerInfoMatch.includes('일치')
          ? 'safe'
          : 'warning',
        description: currentAnalysis.detailedAnalysis.basicInfo.ownerInfoMatch,
      },
      {
        name: '주소 일치',
        status: currentAnalysis.detailedAnalysis.basicInfo.addressMatch.includes('일치')
          ? 'safe'
          : 'warning',
        description: currentAnalysis.detailedAnalysis.basicInfo.addressMatch,
      },
    ],
    legalSafety: [
      {
        name: '법적 분쟁',
        status: currentAnalysis.detailedAnalysis.legalRisk.legalProceedingsStatus.includes('없어')
          ? 'safe'
          : 'danger',
        description: currentAnalysis.detailedAnalysis.legalRisk.legalProceedingsStatus,
      },
      {
        name: '위반건축물',
        status: currentAnalysis.detailedAnalysis.legalRisk.violationBuildingStatus.includes('적법')
          ? 'safe'
          : 'danger',
        description: currentAnalysis.detailedAnalysis.legalRisk.violationBuildingStatus,
      },
    ],
    buildingSafety: [
      {
        name: '건물 용도',
        status: currentAnalysis.detailedAnalysis.buildingInfo.buildingPurposeCheck.includes('적합')
          ? 'safe'
          : 'warning',
        description: currentAnalysis.detailedAnalysis.buildingInfo.buildingPurposeCheck,
      },
      {
        name: '면적 정보',
        status: 'safe',
        description: currentAnalysis.detailedAnalysis.buildingInfo.floorAreaInfo,
      },
    ],
    financialSafety: [
      {
        name: '근저당',
        status: currentAnalysis.detailedAnalysis.rightsInfo.mortgageStatus.includes('없어')
          ? 'safe'
          : 'warning',
        description: currentAnalysis.detailedAnalysis.rightsInfo.mortgageStatus,
      },
      {
        name: '시세 대비 가격',
        status: currentAnalysis.detailedAnalysis.rightsInfo.realPriceRatio.includes('적정')
          ? 'safe'
          : 'warning',
        description: currentAnalysis.detailedAnalysis.rightsInfo.realPriceRatio,
      },
    ],
  }
})

const goBack = () => {
  router.push('/risk-check')
}

const analyzeAnother = () => {
  router.push('/risk-check')
}

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
  window.scrollTo(0, 0)
  
  // 데이터를 찾을 수 없는 경우 이전 페이지로 돌아가기
  if (dataNotFound) {
    router.push('/risk-check')
  }
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
