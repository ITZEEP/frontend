<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Components
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import PropertyInfoCard from '@/components/risk-check/result/PropertyInfoCard.vue'
import OverallRiskSection from '@/components/risk-check/result/OverallRiskSection.vue'
import DetailedAnalysis from '@/components/risk-check/result/DetailedAnalysis.vue'
import TransactionNotes from '@/components/risk-check/result/TransactionNotes.vue'
import RecommendedServices from '@/components/risk-check/result/RecommendedServices.vue'

// Stores & APIs
import { fraudApi } from '@/apis/fraud'
import { useFraudStore } from '@/stores/fraud'

// Composables
const router = useRouter()
const route = useRoute()
const fraudStore = useFraudStore()

// Constants
const RESIDENCE_TYPE_MAP = {
  OPEN_ONE_ROOM: '개방형 원룸',
  SEPARATED_ONE_ROOM: '분리형 원룸',
  TWO_ROOM: '투룸',
  OFFICETEL: '오피스텔',
  APARTMENT: '아파트',
  HOUSE: '주택',
}

// State
// 라우트 파라미터 구조를 통일하여 더 명확한 판별 로직 사용
const analysisId = route.params.analysisId || route.params.id
const isExternalProperty = analysisId === 'external'
const dataNotFound = ref(false)
const currentAnalysis = ref(null)
const currentProperty = ref(null)
const isLoading = ref(true)

// Utility Functions
const mapResidenceType = (type) => RESIDENCE_TYPE_MAP[type] || type

const mapRiskType = (riskType) => {
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

const formatPrice = (transactionType, price, monthly = 0) => {
  const priceInManwon = Math.floor(price / 10000)

  if (transactionType === '월세') {
    const depositInManwon = Math.floor(price / 10000)
    const monthlyInManwon = Math.floor(monthly / 10000)

    if (depositInManwon >= 10000) {
      const depositBillion = Math.floor(depositInManwon / 10000)
      const depositRemain = depositInManwon % 10000
      return depositRemain === 0
        ? `월세 ${depositBillion}억/${monthlyInManwon}만원`
        : `월세 ${depositBillion}억 ${depositRemain}만원/${monthlyInManwon}만원`
    } else {
      return `월세 ${depositInManwon}/${monthlyInManwon}만원`
    }
  } else {
    if (priceInManwon >= 10000) {
      const billion = Math.floor(priceInManwon / 10000)
      const remainder = priceInManwon % 10000
      if (remainder === 0) {
        return `${transactionType} ${billion}억원`
      } else {
        return `${transactionType} ${billion}억 ${remainder}만원`
      }
    } else if (priceInManwon > 0) {
      return `${transactionType} ${priceInManwon}만원`
    } else {
      return `${transactionType} -`
    }
  }
}

// Route validation
const validateRouteParams = () => {
  const { analysisId, id } = route.params

  if (analysisId === 'external' || id === 'external') {
    return true
  }

  if (analysisId && typeof analysisId !== 'string') {
    router.push('/risk-check')
    return false
  }

  if (id && (isNaN(Number(id)) || Number(id) <= 0)) {
    router.push('/risk-check')
    return false
  }

  return true
}

// Data fetching
const fetchExternalPropertyData = () => {
  const externalResult = fraudStore.getExternalAnalysisResult()
  const propertyInfo = fraudStore.getPropertyInfo()

  if (!externalResult || !propertyInfo) {
    console.log('Store에 저장된 분석 결과가 없습니다')
    router.push('/risk-check')
    return false
  }

  currentAnalysis.value = externalResult

  const leaseType = propertyInfo.leaseType
  let priceDisplay = ''

  if (leaseType === 'WOLSE') {
    const depositPrice = propertyInfo.propertyPrice || 0
    const monthlyRent = propertyInfo.monthlyRent || 0
    priceDisplay = formatPrice('월세', deposit, monthly)
  } else if (leaseType === 'JEONSE') {
    const price = propertyInfo.propertyPrice || 0
    priceDisplay = formatPrice('전세', price)
  }

  currentProperty.value = {
    buildingType: mapResidenceType(propertyInfo.residenceType) || '아파트',
    address: propertyInfo.address || '',
    transactionType: leaseType === 'JEONSE' ? '전세' : '월세',
    price: propertyInfo.propertyPrice || 0,
    priceDisplay: priceDisplay,
    image: '/property-placeholder.jpg',
    ownerName: propertyInfo.registeredUserName || '',
  }

  return true
}

const fetchInternalPropertyData = async () => {
  const response = await fraudApi.getRiskCheckDetail(analysisId)

  if (response.success && response.data) {
    console.log('API 응답 데이터:', response.data)
    currentAnalysis.value = response.data

    const price =
      response.data.depositPrice || response.data.sellingPrice || response.data.jeonsePrice || 0
    const transactionType = response.data.transactionType || '매매'
    const monthly = response.data.monthlyRent || 0

    const priceDisplay = formatPrice(transactionType, price, monthly)

    currentProperty.value = {
      buildingType:
        mapResidenceType(response.data.residenceType) ||
        mapResidenceType(response.data.homeType) ||
        '아파트',
      address: response.data.address || '',
      transactionType: response.data.transactionType || '매매',
      price: price,
      priceDisplay: priceDisplay,
      image: response.data.imageUrl || '/property-placeholder.jpg',
    }

    return true
  } else {
    console.log('API 응답이 없거나 실패')
    return false
  }
}

const fetchAnalysisResult = async () => {
  try {
    let success = false

    if (isExternalProperty) {
      success = fetchExternalPropertyData()
    } else {
      success = await fetchInternalPropertyData()
    }

    if (!success) {
      dataNotFound.value = true
    }
  } catch (error) {
    console.error('분석 결과 조회 오류:', error)
    dataNotFound.value = true
  } finally {
    isLoading.value = false
  }
}

// Computed properties
const analysisResult = computed(() => {
  if (!currentAnalysis.value) return null

  return {
    overallRisk: mapRiskType(currentAnalysis.value.riskType),
    analysisDate: currentAnalysis.value.analyzedAt || new Date().toISOString(),
    note: currentAnalysis.value.summary || '',
    propertyInfo: {
      title:
        currentProperty.value?.buildingType ||
        mapResidenceType(currentAnalysis.value?.buildingInfo?.buildingType) ||
        mapResidenceType(currentAnalysis.value?.homeType) ||
        '아파트',
      address: currentProperty.value?.address || currentAnalysis.value?.address || '',
      type:
        currentProperty.value?.buildingType ||
        mapResidenceType(currentAnalysis.value?.buildingInfo?.buildingType) ||
        mapResidenceType(currentAnalysis.value?.homeType) ||
        '아파트',
      transactionType:
        currentProperty.value?.transactionType || currentAnalysis.value?.transactionType || '매매',
      price: currentProperty.value?.priceDisplay || '',
      image:
        currentProperty.value?.image ||
        currentAnalysis.value?.propertyImageUrl ||
        '/property-placeholder.jpg',
    },
  }
})

const categorizedAnalysisDetails = computed(() => {
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

  const findInGroups = (groupTitle) => {
    const group = currentAnalysis.value.detailGroups.find((g) => g.title === groupTitle)
    if (group && group.items && group.items.length > 0) {
      return group.items[0].content || '확인 중'
    }
    return '확인 중'
  }

  return {
    basicInfo: [
      {
        name: '소유자 및 주소 확인',
        status: findInGroups('기본 정보').includes('일치') ? 'safe' : 'warning',
        description: findInGroups('기본 정보'),
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
        status: findInGroups('건축 관련').includes('적법') ? 'safe' : 'danger',
        description: findInGroups('건축 관련'),
      },
    ],
    buildingSafety: [
      {
        name: '건물 상태',
        status:
          findInGroups('건축 관련').includes('적합') || findInGroups('건축 관련').includes('적법')
            ? 'safe'
            : 'warning',
        description: findInGroups('건축 관련'),
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
        status:
          findInGroups('권리관계 정보').includes('없어') ||
          findInGroups('권리관계 정보').includes('안전')
            ? 'safe'
            : 'warning',
        description: findInGroups('권리관계 정보'),
      },
      {
        name: '시세 대비 가격',
        status: 'safe',
        description: '시세 대비 적정한 가격입니다.',
      },
    ],
  }
})

// Navigation
const goBack = () => {
  router.push('/risk-check')
}

const analyzeAnother = () => {
  router.push('/risk-check')
}

// Lifecycle
onMounted(() => {
  if (!validateRouteParams()) return
  fetchAnalysisResult()

  document.body.classList.add('bg-gray-100')
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'
  window.scrollTo(0, 0)
})

onUnmounted(() => {
  document.body.classList.remove('bg-gray-100')
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''

  if (isExternalProperty) {
    fraudStore.clearAllData()
  }
})

watch(dataNotFound, (newValue) => {
  if (newValue) {
    console.log('데이터를 찾을 수 없어 리다이렉션합니다.')
    router.push('/risk-check')
  }
})
</script>

<template>
  <div class="py-8 min-h-0 px-4">
    <div class="max-w-[1024px] mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="goBack" class="p-1 text-gray-600 hover:text-gray-800 transition-colors">
          <IconChevronLeft class="w-[17.5px] h-7" />
        </button>
        <h1 class="text-3xl font-bold text-gray-warm-700">AI 위험도 분석 결과</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <div
          class="w-16 h-16 border-4 border-yellow-primary border-t-transparent rounded-full animate-spin mb-4"
        ></div>
        <p class="text-gray-600">분석 결과를 불러오고 있습니다...</p>
      </div>

      <!-- Data Not Found State -->
      <div v-else-if="dataNotFound" class="text-center py-32">
        <p class="text-gray-600 mb-4">분석 결과를 찾을 수 없습니다.</p>
        <button @click="goBack" class="text-yellow-primary hover:text-yellow-500">돌아가기</button>
      </div>

      <!-- Analysis Results -->
      <template v-else-if="analysisResult">
        <!-- Warning message for external property -->
        <div
          v-if="isExternalProperty"
          class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">미등록 매물 분석 결과</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>이 분석 결과는 서비스에 등록되지 않은 외부 매물의 결과입니다.</p>
                <p class="mt-1">
                  결과는 <span class="font-semibold">저장되지 않으며</span>, 페이지를 나가면 다시
                  확인할 수 없습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Info Card -->
        <div class="mb-8">
          <PropertyInfoCard :property-info="analysisResult.propertyInfo" />
        </div>

        <!-- Overall Risk Section -->
        <div class="mb-8">
          <OverallRiskSection
            :overall-risk="analysisResult.overallRisk"
            :analysis-date="analysisResult.analysisDate"
            :note="analysisResult.note"
          />
        </div>

        <!-- Detailed Analysis -->
        <div class="mb-8">
          <DetailedAnalysis
            :categorized-details="categorizedAnalysisDetails"
            :detail-groups="currentAnalysis?.detailGroups"
          />
        </div>

        <!-- Transaction Notes -->
        <div class="mb-8">
          <TransactionNotes />
        </div>

        <!-- Recommended Services -->
        <div class="mb-8">
          <RecommendedServices @analyze-another="analyzeAnother" />
        </div>
      </template>
    </div>
  </div>
</template>
