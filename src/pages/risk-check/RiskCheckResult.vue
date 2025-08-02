<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
  HOUSE: '주택'
}

// State
const isExternalProperty = route.params.analysisId === 'external' || route.params.id === 'external'
const analysisId = route.params.analysisId || route.params.id
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
      return `월세 ${depositBillion}억/${monthlyInManwon}만원`
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
    const deposit = propertyInfo.propertyPrice || 0
    const monthly = propertyInfo.monthlyRent || 0
    priceDisplay = `월세 ${deposit.toLocaleString()}/${monthly.toLocaleString()}만원`
  } else if (leaseType === 'JEONSE') {
    const price = propertyInfo.propertyPrice || 0
    priceDisplay = `전세 ${price.toLocaleString()}만원`
  }
  
  currentProperty.value = {
    buildingType: mapResidenceType(propertyInfo.residenceType) || '아파트',
    address: propertyInfo.address || '',
    transactionType: leaseType === 'JEONSE' ? '전세' : '월세',
    price: propertyInfo.propertyPrice || 0,
    priceDisplay: priceDisplay,
    image: '/property-placeholder.jpg',
    ownerName: propertyInfo.registeredUserName || ''
  }
  
  return true
}

const fetchInternalPropertyData = async () => {
  const response = await fraudApi.getRiskCheckDetail(analysisId)
  
  if (response.success && response.data) {
    currentAnalysis.value = response.data
    
    const price = response.data.depositPrice || response.data.sellingPrice || response.data.jeonsePrice || 0
    const transactionType = response.data.transactionType || '매매'
    const monthly = response.data.monthlyRent || 0
    
    const priceDisplay = formatPrice(transactionType, price, monthly)
    
    currentProperty.value = {
      buildingType: mapResidenceType(response.data.residenceType) || mapResidenceType(response.data.homeType) || '아파트',
      address: response.data.address || '',
      transactionType: response.data.transactionType || '매매',
      price: price,
      priceDisplay: priceDisplay,
      image: response.data.imageUrl || '/property-placeholder.jpg'
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

// Risk factors generation
const generateRiskFactorsFromDetailedAnalysis = () => {
  if (!currentAnalysis.value?.detailGroups || currentAnalysis.value.detailGroups.length === 0) {
    return generateDefaultRiskFactors(currentAnalysis.value?.riskType || 'SAFE')
  }

  const overallStatus = currentAnalysis.value.riskType?.toLowerCase() || 'safe'
  
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
          name: '건물 상태',
          status: findInGroups('건축물대장').includes('적합') || findInGroups('건축물대장').includes('적법') ? 'safe' : 'warning',
          description: findInGroups('건축물대장')
        },
        {
          name: '면적 정보',
          status: 'safe',
          description: '면적 정보가 정확히 기재되어 있습니다.'
        }
      ]
    },
    {
      title: '금융 안전성',
      status: overallStatus === 'danger' ? 'danger' : overallStatus === 'warn' ? 'warning' : 'safe',
      items: [
        {
          name: '근저당',
          status: findInGroups('을기사항').includes('없어') || findInGroups('을기사항').includes('안전') ? 'safe' : 'warning',
          description: findInGroups('을기사항')
        },
        {
          name: '시세 대비 가격',
          status: 'safe',
          description: '시세 대비 적정한 가격입니다.'
        }
      ]
    }
  ]
}

const generateDefaultRiskFactors = (overallRisk) => {
  const riskStatus = overallRisk === 'safe' ? 'safe' : overallRisk === 'warning' ? 'warning' : 'danger'

  return [
    {
      title: '법적 안전성',
      status: riskStatus,
      items: [
        {
          name: '소유권 확인',
          status: riskStatus,
          description: riskStatus === 'safe' ? '소유권이 확인되었습니다.' : 
                      riskStatus === 'warning' ? '소유권 확인이 필요합니다.' : '소유권에 문제가 있습니다.'
        },
        {
          name: '법적 제한',
          status: riskStatus,
          description: riskStatus === 'safe' ? '법적 제한사항이 없습니다.' : 
                      riskStatus === 'warning' ? '법적 제한사항을 확인해주세요.' : '법적 제한사항이 있습니다.'
        }
      ]
    }
  ]
}

// Computed properties
const analysisResult = computed(() => {
  if (!currentAnalysis.value) return null
  
  return {
    overallRisk: mapRiskType(currentAnalysis.value.riskType),
    analysisDate: currentAnalysis.value.analyzedAt || new Date().toISOString(),
    note: currentAnalysis.value.summary || '',
    propertyInfo: {
      title: currentProperty.value?.buildingType || mapResidenceType(currentAnalysis.value?.buildingInfo?.buildingType) || mapResidenceType(currentAnalysis.value?.homeType) || '아파트',
      address: currentProperty.value?.address || currentAnalysis.value?.address || '',
      type: currentProperty.value?.buildingType || mapResidenceType(currentAnalysis.value?.buildingInfo?.buildingType) || mapResidenceType(currentAnalysis.value?.homeType) || '아파트',
      transactionType: currentProperty.value?.transactionType || currentAnalysis.value?.transactionType || '매매',
      price: currentProperty.value?.priceDisplay || '',
      image: currentProperty.value?.image || currentAnalysis.value?.propertyImageUrl || '/property-placeholder.jpg',
    },
    riskFactors: generateRiskFactorsFromDetailedAnalysis(),
  }
})

const categorizedAnalysisDetails = computed(() => {
  if (!currentAnalysis.value?.detailGroups || currentAnalysis.value.detailGroups.length === 0) {
    const riskStatus = currentAnalysis.value?.riskType === 'SAFE' ? 'safe' : 
                      currentAnalysis.value?.riskType === 'WARN' ? 'warning' : 'danger'
    
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
        status: findInGroups('건축 관련').includes('적합') || findInGroups('건축 관련').includes('적법') ? 'safe' : 'warning',
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
        status: findInGroups('권리관계 정보').includes('없어') || findInGroups('권리관계 정보').includes('안전') ? 'safe' : 'warning',
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
validateRouteParams()
fetchAnalysisResult()

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'
  window.scrollTo(0, 0)
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
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
        <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">분석 결과를 불러오고 있습니다...</p>
      </div>

      <!-- Data Not Found State -->
      <div v-else-if="dataNotFound" class="text-center py-32">
        <p class="text-gray-600 mb-4">분석 결과를 찾을 수 없습니다.</p>
        <button @click="goBack" class="text-primary-600 hover:text-primary-700">
          돌아가기
        </button>
      </div>

      <!-- Analysis Results -->
      <template v-else-if="analysisResult">
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
            :risk-factors="analysisResult.riskFactors"
            :categorized-details="categorizedAnalysisDetails"
          />
        </div>

        <!-- Transaction Notes -->
        <div class="mb-8">
          <TransactionNotes />
        </div>

        <!-- Recommended Services -->
        <div class="mb-8">
          <RecommendedServices />
        </div>

        <!-- Action Button -->
        <div class="flex justify-center">
          <button 
            @click="analyzeAnother"
            class="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            다른 매물 분석하기
          </button>
        </div>
      </template>
    </div>
  </div>
</template>