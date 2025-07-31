<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useModalStore } from '@/stores/modal'
import { useFraudStore } from '@/stores/fraud'
import { fraudApi } from '@/apis/fraud'
import { extractErrorCode, getErrorInfo } from '@/utils/errorMapping'

import PropertyTypeSelector from '@/components/risk-check/PropertyTypeSelector.vue'
import PropertyCard from '@/components/risk-check/PropertyCard.vue'
import PropertyInfoForm from '@/components/risk-check/PropertyInfoForm.vue'
import DocumentUpload from '@/components/risk-check/DocumentUpload.vue'
import RiskCheckHistoryModal from '@/components/risk-check/RiskCheckHistoryModal.vue'
import FileUploadWarningModal from '@/components/risk-check/FileUploadWarningModal.vue'
import PropertyTypeWarningModal from '@/components/risk-check/PropertyTypeWarningModal.vue'
import PropertySelectionWarningModal from '@/components/risk-check/PropertySelectionWarningModal.vue'
import ErrorModal from '@/components/common/ErrorModal.vue'

import IconClock from '@/components/icons/IconClock.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

const router = useRouter()
const modalStore = useModalStore()
const fraudStore = useFraudStore()

const showHistoryModal = ref(false)
const showFileWarningModal = ref(false)
const showPropertyTypeWarningModal = ref(false)
const showPropertySelectionWarningModal = ref(false)
const showErrorModal = ref(false)
const errorTitle = ref('오류 발생')
const errorMessage = ref('')
const errorType = ref('unknown_error')
const missingFiles = ref([])
const selectedPropertyType = ref(null)
const selectedTab = ref('favorite')
const selectedPropertyId = ref(null)
const propertyInfo = ref({})
const uploadedFiles = ref({
  등기부등본: null,
  건축물대장: null,
})
const isAnalyzing = ref(false)
const propertyTypeSelectorRef = ref(null)
const propertyCardRef = ref(null)
const documentUploadRef = ref(null)

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
})

const handlePropertyTypeSelect = (type) => {
  selectedPropertyType.value = type
  selectedPropertyId.value = null // 매물 유형 변경 시 선택된 매물 초기화
  propertyInfo.value = {} // 매물 정보 초기화
  if (type === 'unregistered') {
    uploadedFiles.value.등기부등본 = null
    uploadedFiles.value.건축물대장 = null
  }
}

const handleTabSelect = (tab) => {
  selectedTab.value = tab
  selectedPropertyId.value = null // 탭 변경 시 선택 초기화
}

const handlePropertySelect = (propertyId) => {
  selectedPropertyId.value = propertyId
}

const handleFileUpdate = (fileType, file) => {
  uploadedFiles.value[fileType] = file
}

const handlePropertyInfoUpdate = (info) => {
  propertyInfo.value = info
}

const startRiskAnalysis = async () => {
  // 매물 유형 선택 검증
  if (!selectedPropertyType.value) {
    showPropertyTypeWarningModal.value = true
    modalStore.open()
    return
  }

  // 등록된 매물인 경우 매물 선택 검증
  if (selectedPropertyType.value === 'registered' && !selectedPropertyId.value) {
    showPropertySelectionWarningModal.value = true
    modalStore.open()
    return
  }

  // 등록되지 않은 매물인 경우 매물 정보 검증
  if (selectedPropertyType.value === 'unregistered') {
    if (!propertyInfo.value.address || !propertyInfo.value.leaseType || !propertyInfo.value.residenceType) {
      errorTitle.value = '매물 정보 입력 필요'
      errorMessage.value = '매물 정보를 모두 입력해주세요.\n\n주소, 거래유형, 주거유형은 필수 입력 항목입니다.'
      errorType.value = 'form_validation_error'
      showErrorModal.value = true
      modalStore.open()
      return
    }
  }

  // 파일 업로드 검증
  const missing = []
  if (!uploadedFiles.value.등기부등본) {
    missing.push('등기부등본')
  }
  if (!uploadedFiles.value.건축물대장) {
    missing.push('건축물대장')
  }

  if (missing.length > 0) {
    missingFiles.value = missing
    showFileWarningModal.value = true
    modalStore.open()
    return
  }

  isAnalyzing.value = true

  try {
    // 실제 API 호출
    const homeId = selectedPropertyType.value === 'registered' ? selectedPropertyId.value : null
    const response = await fraudApi.analyzeDocuments(
      uploadedFiles.value['등기부등본'],
      uploadedFiles.value['건축물대장'],
      homeId // 매물 ID (등록되지 않은 매물의 경우 null)
    )

    if (response.success && response.data) {
      // Store에 OCR 분석 결과와 매물 정보 저장
      fraudStore.setDocumentAnalysisData(response.data)
      
      // 등록되지 않은 매물의 경우 매물 정보도 함께 저장
      if (selectedPropertyType.value === 'unregistered') {
        fraudStore.setPropertyInfo(propertyInfo.value)
      }
      
      // OCR 확인 페이지로 이동 (URL에는 민감한 정보 노출하지 않음)
      router.push('/risk-check/confirm')
    } else {
      errorTitle.value = '문서 분석 실패'
      errorMessage.value = response.message || '알 수 없는 오류가 발생했습니다.'
      showErrorModal.value = true
      modalStore.open()
    }
  } catch (error) {
    console.error('OCR 분석 오류:', error)
    
    // 에러 코드 추출 및 매핑
    const errorCode = extractErrorCode(error)
    let errorInfo
    
    if (errorCode) {
      // 알려진 에러 코드인 경우 매핑된 정보 사용
      errorInfo = getErrorInfo(errorCode)
      errorType.value = errorInfo.type
    } else {
      // 일반적인 HTTP 에러 처리
      errorInfo = getGenericErrorInfo(error)
      errorType.value = getErrorTypeFromGeneric(error)
    }
    
    errorTitle.value = errorInfo.title
    errorMessage.value = errorInfo.message
    showErrorModal.value = true
    modalStore.open()
  } finally {
    isAnalyzing.value = false
  }
}

const handleCheckHistory = () => {
  showHistoryModal.value = true
  modalStore.open()
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  modalStore.close()
}

const handleSelectHistory = (history) => {
  console.log('선택된 분석 기록:', history)
  // riskCheckId를 사용해서 결과 페이지로 이동
  router.push(`/risk-check/result/${history.riskCheckId || history.id}`)
}

const closeFileWarningModal = () => {
  showFileWarningModal.value = false
  modalStore.close()
}

const confirmFileWarning = () => {
  showFileWarningModal.value = false
  modalStore.close()
  scrollToElement(documentUploadRef.value)
}

const closePropertyTypeWarningModal = () => {
  showPropertyTypeWarningModal.value = false
  modalStore.close()
}

const confirmPropertyTypeWarning = () => {
  showPropertyTypeWarningModal.value = false
  modalStore.close()
  scrollToElement(propertyTypeSelectorRef.value)
}

const closePropertySelectionWarningModal = () => {
  showPropertySelectionWarningModal.value = false
  modalStore.close()
}

const confirmPropertySelectionWarning = () => {
  showPropertySelectionWarningModal.value = false
  modalStore.close()
  scrollToElement(propertyCardRef.value)
}

const scrollToElement = async (element) => {
  if (element) {
    await nextTick()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.classList.add('highlight-warning')
    setTimeout(() => {
      element.classList.remove('highlight-warning')
    }, 3000)
  }
}

const handlePropertyCardError = (error) => {
  console.error('PropertyCard 에러:', error)
  errorTitle.value = `${error.type === 'favorite' ? '찜한' : '채팅 중인'} 매물 조회 실패`
  errorMessage.value = error.message
  showErrorModal.value = true
  modalStore.open()
}

const closeErrorModal = () => {
  showErrorModal.value = false
  modalStore.close()
}

// 일반적인 HTTP 에러에서 에러 타입 결정
const getErrorTypeFromGeneric = (error) => {
  if (error.response) {
    const status = error.response.status
    if (status === 413 || status === 415) {
      return 'file_error'
    } else if (status >= 500) {
      return 'server_error'
    } else {
      return 'server_error'
    }
  } else if (error.request) {
    return 'network_error'
  } else {
    return 'unknown_error'
  }
}

// 일반적인 HTTP 에러 정보 생성
const getGenericErrorInfo = (error) => {
  if (error.response) {
    // 서버가 응답했지만 에러 상태인 경우
    switch (error.response.status) {
      case 401:
        return {
          title: '인증 오류',
          message: '인증이 필요합니다.\n다시 로그인해주세요.'
        }
      case 403:
        return {
          title: '권한 오류',
          message: '해당 작업을 수행할 권한이 없습니다.'
        }
      case 404:
        return {
          title: '리소스 오류',
          message: '요청한 리소스를 찾을 수 없습니다.'
        }
      case 413:
        return {
          title: '파일 크기 오류',
          message: '업로드된 파일이 너무 큽니다.\n\n10MB 이하의 파일을 업로드해주세요.'
        }
      case 415:
        return {
          title: '파일 형식 오류',
          message: '지원하지 않는 파일 형식입니다.\n\nPDF 파일만 업로드 가능합니다.'
        }
      case 429:
        return {
          title: '요청 제한 오류',
          message: '너무 많은 요청을 보냈습니다.\n\n잠시 후 다시 시도해주세요.'
        }
      case 500:
        return {
          title: '서버 오류',
          message: '서버 내부 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.'
        }
      case 502:
      case 503:
      case 504:
        return {
          title: '서비스 일시 중단',
          message: '서비스가 일시적으로 중단되었습니다.\n\n잠시 후 다시 시도해주세요.'
        }
      default:
        return {
          title: '서버 오류',
          message: `서버 오류가 발생했습니다. (${error.response.status})\n\n${error.response.data?.message || '알 수 없는 오류'}`
        }
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우
    return {
      title: '네트워크 오류',
      message: '서버와 연결할 수 없습니다.\n\n네트워크 연결을 확인해주세요.'
    }
  } else {
    // 요청 설정 중 오류가 발생한 경우
    return {
      title: '요청 오류',
      message: `요청 중 오류가 발생했습니다.\n\n${error.message}`
    }
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-warm-700 mb-2">사기 위험도 분석</h1>
        <p class="text-base text-gray-600">AI 기술로 매물의 사기 위험도를 정확하게 분석합니다</p>
      </div>
      <BaseButton @click="handleCheckHistory" size="lg" variant="primary">
        <IconClock class="w-4 h-4 mr-2 text-white" />
        조회 기록 확인하기
      </BaseButton>
    </div>

    <div ref="propertyTypeSelectorRef" class="mb-8">
      <PropertyTypeSelector
        :selected-type="selectedPropertyType"
        @select-type="handlePropertyTypeSelect"
      />
    </div>

    <div v-if="selectedPropertyType === 'registered'" ref="propertyCardRef" class="mb-8">
      <PropertyCard 
        :selected-tab="selectedTab" 
        @select-tab="handleTabSelect"
        @select-property="handlePropertySelect"
        @error="handlePropertyCardError"
      />
    </div>

    <div v-if="selectedPropertyType === 'unregistered'" class="mb-8">
      <PropertyInfoForm 
        :property-info="propertyInfo"
        @update:property-info="handlePropertyInfoUpdate"
      />
    </div>

    <div
      v-if="selectedPropertyType === 'registered' || selectedPropertyType === 'unregistered'"
      ref="documentUploadRef"
      class="mb-8"
    >
      <DocumentUpload :uploaded-files="uploadedFiles" @update-files="handleFileUpdate" />
    </div>

    <div v-if="selectedPropertyType" class="flex justify-center">
      <BaseButton
        size="lg"
        variant="primary"
        @click="startRiskAnalysis"
        class="px-12 py-4 font-semibold relative overflow-hidden"
        :disabled="isAnalyzing"
      >
        <transition name="fade" mode="out-in">
          <div v-if="!isAnalyzing" key="normal" class="flex items-center">
            <IconSearch class="w-4 h-4 mr-2 text-white" />
            AI 위험도 분석 시작
          </div>
          <div v-else key="loading" class="flex items-center">
            <div
              class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            분석 중...
          </div>
        </transition>
      </BaseButton>
    </div>

    <!-- 로딩 오버레이 -->
    <LoadingOverlay
      :loading="isAnalyzing"
      message="OCR 처리 중..."
      subMessage="문서를 분석하고 있습니다"
    />
  </div>

  <RiskCheckHistoryModal
    :is-open="showHistoryModal"
    @close="closeHistoryModal"
    @select-history="handleSelectHistory"
  />

  <FileUploadWarningModal
    :is-open="showFileWarningModal"
    :missing-files="missingFiles"
    @close="closeFileWarningModal"
    @confirm="confirmFileWarning"
  />

  <PropertyTypeWarningModal
    :is-open="showPropertyTypeWarningModal"
    @close="closePropertyTypeWarningModal"
    @confirm="confirmPropertyTypeWarning"
  />

  <PropertySelectionWarningModal
    :is-open="showPropertySelectionWarningModal"
    @close="closePropertySelectionWarningModal"
    @confirm="confirmPropertySelectionWarning"
  />

  <ErrorModal
    :is-open="showErrorModal"
    :title="errorTitle"
    :message="errorMessage"
    :error-type="errorType"
    @close="closeErrorModal"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.highlight-warning) {
  animation: highlight 3s ease-out;
  border-radius: 1rem;
  position: relative;
}

@keyframes highlight {
  0% {
    box-shadow: 
      0 0 0 0 rgba(251, 191, 36, 0.8),
      0 2px 10px 0 rgba(251, 191, 36, 0.4),
      0 4px 20px 0 rgba(251, 191, 36, 0.3),
      inset 0 0 0 1px rgba(251, 191, 36, 0.8);
    border: 1px solid rgba(251, 191, 36, 0.9);
    transform: scale(1.02);
  }
  50% {
    box-shadow: 
      0 0 15px 5px rgba(251, 191, 36, 0.2),
      0 2px 15px 2.5px rgba(251, 191, 36, 0.3),
      0 4px 25px 5px rgba(251, 191, 36, 0.2),
      inset 0 0 0 1px rgba(251, 191, 36, 0.8);
    border: 1px solid rgba(251, 191, 36, 0.9);
    transform: scale(1.01);
  }
  100% {
    box-shadow: 
      0 0 0 0 rgba(251, 191, 36, 0),
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 0 0 0 rgba(251, 191, 36, 0);
    border: 1px solid rgba(251, 191, 36, 0);
    transform: scale(1);
  }
}
</style>
