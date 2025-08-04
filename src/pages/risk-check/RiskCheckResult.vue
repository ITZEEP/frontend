<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import PropertyInfoCard from '@/components/risk-check/result/PropertyInfoCard.vue'
import OverallRiskSection from '@/components/risk-check/result/OverallRiskSection.vue'
import DetailedAnalysis from '@/components/risk-check/result/DetailedAnalysis.vue'
import TransactionNotes from '@/components/risk-check/result/TransactionNotes.vue'
import RecommendedServices from '@/components/risk-check/result/RecommendedServices.vue'
import { fraudApi } from '@/apis/fraud'

const router = useRouter()
const route = useRoute()

// 라우트 파라미터 타입 검증
const validateRouteParams = () => {
  const { analysisId, id } = route.params
  
  // analysisId 검증
  if (analysisId && typeof analysisId !== 'string') {
    router.push('/risk-check')
    return false
  }
  
  // id 검증 (숫자로 변환 가능한지 확인)
  if (id && (isNaN(Number(id)) || Number(id) <= 0)) {
    router.push('/risk-check')
    return false
  }
  
  return true
}

// 파라미터 검증
const isValidRoute = validateRouteParams()

// URL 파라미터에서 riskCheckId 가져오기

const analysisId = route.params.analysisId || route.params.id
console.log('Route params:', route.params)
console.log('Analysis ID:', analysisId)
const dataNotFound = ref(false)
const currentAnalysis = ref(null)
const currentProperty = ref(null)
const isLoading = ref(true)

// 분석 결과 가져오기
const fetchAnalysisResult = async () => {
  try {
    console.log('분석 결과 조회 시작 - analysisId:', analysisId)
    
    // API로 상세 조회
    const response = await fraudApi.getRiskCheckDetail(analysisId)
    console.log('API 응답:', response)
    
    if (response.success && response.data) {
      currentAnalysis.value = response.data
      // API 응답에서 매물 정보 구성
      let price = response.data.depositPrice || response.data.sellingPrice || response.data.jeonsePrice || 0
      let priceDisplay = ''
      const transactionType = response.data.transactionType || '매매'
      
      // 가격을 원 단위로 받으므로 만원 단위로 변환
      const priceInManwon = Math.floor(price / 10000)
      
      if (transactionType === '월세') {
        const deposit = response.data.depositPrice || 0
        const monthly = response.data.monthlyRent || 0
        const depositInManwon = Math.floor(deposit / 10000)
        const monthlyInManwon = Math.floor(monthly / 10000)
        
        if (depositInManwon >= 10000) {
          const depositBillion = Math.floor(depositInManwon / 10000)
          priceDisplay = `월세 ${depositBillion}억/${monthlyInManwon}만원`
        } else {
          priceDisplay = `월세 ${depositInManwon}/${monthlyInManwon}만원`
        }
      } else {
        // 전세 또는 매매
        if (priceInManwon >= 10000) {
          const billion = Math.floor(priceInManwon / 10000)
          const remainder = priceInManwon % 10000
          if (remainder === 0) {
            priceDisplay = `${transactionType} ${billion}억원`
          } else {
            priceDisplay = `${transactionType} ${billion}억 ${remainder}만원`
          }
        } else if (priceInManwon > 0) {
          priceDisplay = `${transactionType} ${priceInManwon}만원`
        } else {
          priceDisplay = `${transactionType} -`
        }
      }
      
      currentProperty.value = {
        buildingType: response.data.residenceType || response.data.homeType || '아파트',
        address: response.data.address || '',
        transactionType: response.data.transactionType || '매매',
        price: price,
        priceDisplay: priceDisplay,
        image: response.data.imageUrl || '/property-placeholder.jpg'
      }
    } else {
      console.log('API 응답이 없거나 실패')
      dataNotFound.value = true
    }
  } catch (error) {
    console.error('분석 결과 조회 오류:', error)
    dataNotFound.value = true
  } finally {
    isLoading.value = false
    console.log('로딩 완료 - dataNotFound:', dataNotFound.value)
  }
}

// 컴포넌트 마운트 시 데이터 가져오기
fetchAnalysisResult()

// 한국어 상태를 표준 상태로 매핑하는 유틸리티 함수
const statusMapping = {
  '안전': 'safe',
  '적합': 'safe',
  '양호': 'safe',
  '우수': 'safe',
  '적정': 'safe',
  '주의': 'warning',
  '보통': 'warning',
  '위험': 'danger'
}

function mapStatus(koreanStatus) {
  return statusMapping[koreanStatus] || 'danger'
}

// API의 riskType을 UI에서 사용하는 위험도 형태로 변환하는 함수
function mapRiskType(riskType) {
  if (!riskType) return 'safe'
  
  const type = riskType.toUpperCase()
  switch (type) {
    case 'SAFE':
      return 'safe'
    case 'WARN':
    case 'WARNING':
      return 'warning'
    case 'DANGER':
    case 'HIGH':
      return 'danger'
    default:
      return 'safe'
  }
}

// Generate risk factors from the detailed analysis data
function generateRiskFactorsFromDetailedAnalysis() {
  // Now using detailGroups instead of detailedAnalysis
  if (!currentAnalysis.value?.detailGroups || currentAnalysis.value.detailGroups.length === 0) {
    return generateDefaultRiskFactors(currentAnalysis.value?.riskType || 'SAFE')
  }

  // Convert detailGroups to risk factors
  const overallStatus = currentAnalysis.value.riskType?.toLowerCase() || 'safe'
  
  // Extract data from detailGroups (simplified - only one item per group)
  const findInGroups = (groupTitle) => {
    const group = currentAnalysis.value.detailGroups.find(g => g.title === groupTitle)
    if (group && group.items && group.items.length > 0) {
      return group.items[0].content || '확인 중'
    }
    return '확인 중'
  }

  return [
    {
      title: '법적 안전성',
      status: overallStatus === 'danger' ? 'danger' : overallStatus === 'warn' ? 'warning' : 'safe',
      items: [
        {
          name: '법적 분쟁',
          status: 'safe',
          description: '법적 분쟁 사항이 없습니다.'
        },
        {
          name: '위반건축물',
          status: findInGroups('건축물대장').includes('적법') ? 'safe' : 'danger',
          description: findInGroups('건축물대장')
        },
        {
          name: '권리 제한',
          status: findInGroups('을기사항').includes('없어') || findInGroups('을기사항').includes('안전') ? 'safe' : 'warning',
          description: findInGroups('을기사항')
        }
      ]
    },
    {
      title: '건물 안전성',
      status: overallStatus === 'danger' ? 'danger' : overallStatus === 'warn' ? 'warning' : 'safe',
      items: [
        {
          name: '건물 용도',
          status: findInGroups('건축물대장').includes('적합') || findInGroups('건축물대장').includes('적법') ? 'safe' : 'warning',
          description: findInGroups('건축물대장')
        },
        {
          name: '구조 안전성',
          status: 'safe',
          description: '구조적으로 안전한 건물입니다.'
        },
        {
          name: '면적 정보',
          status: 'safe',
          description: '면적 정보가 정확히 기재되어 있습니다.'
        }
      ]
    },
    {
      title: '가격 적정성',
      status: overallStatus === 'danger' ? 'danger' : overallStatus === 'warn' ? 'warning' : 'safe',
      items: [
        {
          name: '시세 대비',
          status: overallStatus === 'safe' ? 'safe' : 'warning',
          description: overallStatus === 'safe' ? '시세 대비 적정한 가격입니다.' : '시세 확인이 필요합니다.'
        },
        {
          name: '시장 비교',
          status: overallStatus === 'safe' ? 'safe' : 'warning',
          description: overallStatus === 'safe' ? '주변 시세와 비교하여 적정합니다.' : '시장 가격 검토가 필요합니다.'
        },
        {
          name: '가격 추이',
          status: 'safe',
          description: '가격이 안정적입니다.'
        }
      ]
    },
    {
      title: '입지 평가',
      status: overallStatus === 'danger' ? 'danger' : overallStatus === 'warn' ? 'warning' : 'safe',
      items: [
        {
          name: '교통 접근성',
          status: 'safe',
          description: '대중교통 접근성이 양호합니다.'
        },
        {
          name: '교육 환경',
          status: 'safe',
          description: '주변 교육 환경이 우수합니다.'
        },
        {
          name: '생활 편의',
          status: 'safe',
          description: '생활 편의시설이 잘 갖춰져 있습니다.'
        }
      ]
    }
  ]
}

// Determine the overall status for a category based on its items
function determineCategoryStatus(statusStrings) {
  if (!statusStrings || statusStrings.length === 0) return 'warning'
  
  const hasWarning = statusStrings.some(status => 
    status && (status.includes('주의') || status.includes('경고'))
  )
  const hasDanger = statusStrings.some(status => 
    status && (status.includes('위험') || status.includes('문제'))
  )
  
  if (hasDanger) return 'danger'
  if (hasWarning) return 'warning'
  return 'safe'
}

const analysisResult = computed(() => {
  if (!currentAnalysis.value) return null
  
  return {
    overallRisk: mapRiskType(currentAnalysis.value.riskType),
    analysisDate: currentAnalysis.value.analyzedAt || new Date().toISOString(),
    note: currentAnalysis.value.summary || '',
    propertyInfo: {
      title: currentProperty.value?.buildingType || currentAnalysis.value?.buildingInfo?.buildingType || currentAnalysis.value?.homeType || '아파트',
      address: currentProperty.value?.address || currentAnalysis.value?.address || '',
      type: currentProperty.value?.buildingType || currentAnalysis.value?.buildingInfo?.buildingType || currentAnalysis.value?.homeType || '아파트',
      transactionType: currentProperty.value?.transactionType || currentAnalysis.value?.transactionType || '매매',
      price: currentProperty.value?.priceDisplay || '',
      image: currentProperty.value?.image || currentAnalysis.value?.propertyImageUrl || '/property-placeholder.jpg',
    },
    riskFactors: generateRiskFactorsFromDetailedAnalysis(),
  }
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
  // detailGroups를 사용하여 데이터 구성
  if (!currentAnalysis.value?.detailGroups || currentAnalysis.value.detailGroups.length === 0) {
    const riskStatus =
      currentAnalysis.value?.riskType === 'SAFE'
        ? 'safe'
        : currentAnalysis.value?.riskType === 'WARN'
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

  // detailGroups에서 데이터 추출 (simplified - only one item per group)
  const findInGroups = (groupTitle) => {
    const group = currentAnalysis.value.detailGroups.find(g => g.title === groupTitle)
    if (group && group.items && group.items.length > 0) {
      return group.items[0].content || '확인 중'
    }
    return '확인 중'
  }

  return {
    basicInfo: [
      {
        name: '소유자 및 주소 확인',
        status: findInGroups('갑기본정보').includes('일치') ? 'safe' : 'warning',
        description: findInGroups('갑기본정보'),
      },
    ],
    legalSafety: [
      {
        name: '법적 분쟁',
        status: 'safe',
        description: '법적 분쟁이 없습니다.',
      },
      {
        name: '위반건축물',
        status: findInGroups('건축물대장').includes('적법') ? 'safe' : 'danger',
        description: findInGroups('건축물대장'),
      },
    ],
    buildingSafety: [
      {
        name: '건물 상태',
        status: findInGroups('건축물대장').includes('적합') || findInGroups('건축물대장').includes('적법') ? 'safe' : 'warning',
        description: findInGroups('건축물대장'),
      },
      {
        name: '면적 정보',
        status: 'safe',
        description: '면적 정보가 정확히 기재되어 있습니다.',
      },
    ],
    financialSafety: [
      {
        name: '근저당',
        status: findInGroups('을기사항').includes('없어') || findInGroups('을기사항').includes('안전') ? 'safe' : 'warning',
        description: findInGroups('을기사항'),
      },
      {
        name: '시세 대비 가격',
        status: 'safe',
        description: '시세 대비 적정한 가격입니다.',
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
  // 스크롤 관련 스타일 초기화
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'
  window.scrollTo(0, 0)
})

// dataNotFound 상태를 감시하여 리다이렉션 처리
watch(dataNotFound, (newValue) => {
  if (newValue) {
    console.log('데이터를 찾을 수 없어 리다이렉션합니다.')
    router.push('/risk-check')
  }
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="py-8 min-h-0 px-4">
    <div class="max-w-[1024px] mx-auto">
      <!-- 헤더 -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="p-1 text-gray-600 hover:text-gray-800 transition-colors">
          <IconChevronLeft class="w-[17.5px] h-7" />
        </button>
        <h1 class="text-3xl font-bold text-gray-warm-700">AI 위험도 분석 결과</h1>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">분석 결과를 불러오고 있습니다...</p>
      </div>

      <!-- 데이터 없음 상태 -->
      <div v-else-if="dataNotFound" class="text-center py-32">
        <p class="text-gray-600 mb-4">분석 결과를 찾을 수 없습니다.</p>
        <button @click="goBack" class="text-primary-600 hover:text-primary-700">
          돌아가기
        </button>
      </div>

      <!-- 분석 결과 표시 -->
      <template v-else-if="analysisResult">
        <!-- 매물 정보 카드 -->
        <PropertyInfoCard :property-info="analysisResult.propertyInfo" class="mb-8" />

        <!-- 종합 위험도 -->
        <OverallRiskSection :overall-risk="analysisResult.overallRisk" class="mb-8" />

        <!-- 상세 분석 결과 -->
        <DetailedAnalysis 
          :analysis-data="detailedAnalysisData" 
          :detail-groups="currentAnalysis.detailGroups"
          class="mb-8" />

        <!-- 거래 시 참고사항 -->
        <TransactionNotes class="mb-8" />

        <!-- 추천 서비스 -->
        <RecommendedServices @analyze-another="analyzeAnother" class="mb-8" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
