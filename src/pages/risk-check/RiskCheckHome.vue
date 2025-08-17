<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Components
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import PropertyTypeSelector from '@/components/risk-check/PropertyTypeSelector.vue'
import PropertyCard from '@/components/risk-check/PropertyCard.vue'
import PropertyInfoForm from '@/components/risk-check/PropertyInfoForm.vue'
import DocumentUpload from '@/components/risk-check/DocumentUpload.vue'
import RiskCheckHistoryModal from '@/components/risk-check/RiskCheckHistoryModal.vue'
import FileUploadWarningModal from '@/components/risk-check/FileUploadWarningModal.vue'
import PropertyTypeWarningModal from '@/components/risk-check/PropertyTypeWarningModal.vue'
import PropertySelectionWarningModal from '@/components/risk-check/PropertySelectionWarningModal.vue'
import ErrorModal from '@/components/common/ErrorModal.vue'

// Icons
import IconClock from '@/components/icons/IconClock.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

// Stores & APIs
import { useModalStore } from '@/stores/modal'
import { useFraudStore } from '@/stores/fraud'
import { fraudApi } from '@/apis/fraud'
import { extractErrorCode, getErrorInfo, getErrorTypeFromGeneric, getGenericErrorInfo } from '@/utils/errorMapping'

// Composables
const router = useRouter()
const modalStore = useModalStore()
const fraudStore = useFraudStore()

// State
const selectedPropertyType = ref(null)
const selectedTab = ref('favorite')
const selectedPropertyId = ref(null)
const propertyInfo = ref({})
const uploadedFiles = ref({
  등기부등본: null,
  건축물대장: null,
})
const isAnalyzing = ref(false)

// Modal States
const showHistoryModal = ref(false)
const showFileWarningModal = ref(false)
const showPropertyTypeWarningModal = ref(false)
const showPropertySelectionWarningModal = ref(false)
const showErrorModal = ref(false)
const showExternalPropertyWarningModal = ref(false)

// Error States
const errorTitle = ref('오류 발생')
const errorMessage = ref('')
const errorType = ref('unknown_error')
const missingFiles = ref([])

// Refs
const propertyTypeSelectorRef = ref(null)
const propertyCardRef = ref(null)
const documentUploadRef = ref(null)

// Lifecycle
onMounted(() => {
  document.body.classList.add('bg-gray-100')
})

onUnmounted(() => {
  document.body.classList.remove('bg-gray-100')
})

// Property Type Handler
const handlePropertyTypeSelect = (type) => {
  selectedPropertyType.value = type
  selectedPropertyId.value = null
  propertyInfo.value = {}
  
  if (type === 'unregistered') {
    uploadedFiles.value.등기부등본 = null
    uploadedFiles.value.건축물대장 = null
  }
}

// Tab Handler
const handleTabSelect = (tab) => {
  selectedTab.value = tab
  selectedPropertyId.value = null
}

// Property Selection Handler
const handlePropertySelect = (propertyId) => {
  selectedPropertyId.value = propertyId
}

// File Update Handler
const handleFileUpdate = (fileType, file) => {
  uploadedFiles.value[fileType] = file
}

// Property Info Update Handler
const handlePropertyInfoUpdate = (info) => {
  propertyInfo.value = info
}

// Validation Functions
const validatePropertyType = () => {
  if (!selectedPropertyType.value) {
    showPropertyTypeWarningModal.value = true
    modalStore.open()
    return false
  }
  return true
}

const validatePropertySelection = () => {
  if (selectedPropertyType.value === 'registered' && !selectedPropertyId.value) {
    showPropertySelectionWarningModal.value = true
    modalStore.open()
    return false
  }
  return true
}

const validatePropertyInfo = () => {
  if (selectedPropertyType.value === 'unregistered') {
    const { address, leaseType, residenceType } = propertyInfo.value
    if (!address || !leaseType || !residenceType) {
      showError('매물 정보 입력 필요', '매물 정보를 모두 입력해주세요.\\n\\n주소, 거래유형, 주거유형은 필수 입력 항목입니다.', 'form_validation_error')
      return false
    }
  }
  return true
}

const validateFiles = () => {
  const missing = []
  if (!uploadedFiles.value.등기부등본) missing.push('등기부등본')
  if (!uploadedFiles.value.건축물대장) missing.push('건축물대장')

  if (missing.length > 0) {
    missingFiles.value = missing
    showFileWarningModal.value = true
    modalStore.open()
    return false
  }
  return true
}

// Error Handler
const showError = (title, message, type) => {
  errorTitle.value = title
  errorMessage.value = message
  errorType.value = type
  showErrorModal.value = true
  modalStore.open()
}

// Main Risk Analysis Function
const startRiskAnalysis = async () => {
  // Validate inputs
  if (!validatePropertyType() || 
      !validatePropertySelection() || 
      !validatePropertyInfo() || 
      !validateFiles()) {
    return
  }

  // Show warning modal for external property
  if (selectedPropertyType.value === 'unregistered') {
    showExternalPropertyWarningModal.value = true
    modalStore.open()
    return
  }
  
  proceedWithAnalysis()
}

// Proceed with analysis after warning confirmation
const proceedWithAnalysis = async () => {
  isAnalyzing.value = true

  try {
    const homeId = selectedPropertyType.value === 'registered' ? selectedPropertyId.value : null
    const response = await fraudApi.analyzeDocuments(
      uploadedFiles.value['등기부등본'],
      uploadedFiles.value['건축물대장'],
      homeId
    )

    if (response.success && response.data) {
      fraudStore.setDocumentAnalysisData(response.data)
      
      if (selectedPropertyType.value === 'unregistered') {
        fraudStore.setPropertyInfo(propertyInfo.value)
      }
      
      router.push('/risk-check/confirm')
    } else {
      showError('문서 분석 실패', response.message || '알 수 없는 오류가 발생했습니다.')
    }
  } catch (error) {
    console.error('OCR 분석 오류:', error)
    
    const errorCode = extractErrorCode(error)
    let errorInfo
    
    if (errorCode) {
      errorInfo = getErrorInfo(errorCode)
      errorType.value = errorInfo.type
    } else {
      errorInfo = getGenericErrorInfo(error)
      errorType.value = getErrorTypeFromGeneric(error)
    }
    
    showError(errorInfo.title, errorInfo.message)
  } finally {
    isAnalyzing.value = false
  }
}

// History Modal Handlers
const handleCheckHistory = () => {
  showHistoryModal.value = true
  modalStore.open()
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  modalStore.close()
}

const handleSelectHistory = (history) => {
  router.push(`/risk-check/result/${history.riskCheckId || history.id}`)
}

// File Warning Modal Handlers
const closeFileWarningModal = () => {
  showFileWarningModal.value = false
  modalStore.close()
}

const confirmFileWarning = () => {
  showFileWarningModal.value = false
  modalStore.close()
  scrollToElement(documentUploadRef.value)
}

// Property Type Warning Modal Handlers
const closePropertyTypeWarningModal = () => {
  showPropertyTypeWarningModal.value = false
  modalStore.close()
}

const confirmPropertyTypeWarning = () => {
  showPropertyTypeWarningModal.value = false
  modalStore.close()
  scrollToElement(propertyTypeSelectorRef.value)
}

// Property Selection Warning Modal Handlers
const closePropertySelectionWarningModal = () => {
  showPropertySelectionWarningModal.value = false
  modalStore.close()
}

const confirmPropertySelectionWarning = () => {
  showPropertySelectionWarningModal.value = false
  modalStore.close()
  scrollToElement(propertyCardRef.value)
}

// Error Modal Handler
const closeErrorModal = () => {
  showErrorModal.value = false
  modalStore.close()
}

// External Property Warning Modal Handlers
const closeExternalPropertyWarningModal = () => {
  showExternalPropertyWarningModal.value = false
  modalStore.close()
}

const confirmExternalPropertyWarning = () => {
  showExternalPropertyWarningModal.value = false
  modalStore.close()
  proceedWithAnalysis()
}

// Utility Functions
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
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6 sm:mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-warm-700 mb-1 sm:mb-2">사기 위험도 분석</h1>
        <p class="text-sm sm:text-base text-gray-600">AI 기술로 매물의 사기 위험도를 정확하게 분석합니다</p>
      </div>
      <BaseButton 
        @click="handleCheckHistory" 
        size="md" 
        variant="primary"
        class="hidden sm:flex"
      >
        <IconClock class="w-4 h-4 mr-2 text-white" />
        <span class="text-sm sm:text-base">조회 기록 확인하기</span>
      </BaseButton>
      <!-- 모바일에서는 아이콘 버튼만 표시 -->
      <BaseButton 
        @click="handleCheckHistory" 
        size="md" 
        variant="primary"
        class="sm:hidden px-3 py-2"
      >
        <IconClock class="w-5 h-5 text-white" />
      </BaseButton>
    </div>

    <!-- Property Type Selector -->
    <div ref="propertyTypeSelectorRef" class="mb-6 sm:mb-8">
      <PropertyTypeSelector
        :selected-type="selectedPropertyType"
        @select-type="handlePropertyTypeSelect"
      />
    </div>

    <!-- Property Card (for registered properties) -->
    <div v-if="selectedPropertyType === 'registered'" ref="propertyCardRef" class="mb-6 sm:mb-8">
      <PropertyCard 
        :selected-tab="selectedTab" 
        @select-tab="handleTabSelect"
        @select-property="handlePropertySelect"
      />
    </div>

    <!-- Property Info Form (for unregistered properties) -->
    <div v-if="selectedPropertyType === 'unregistered'" class="mb-6 sm:mb-8">
      <PropertyInfoForm 
        :property-info="propertyInfo"
        @update:property-info="handlePropertyInfoUpdate"
      />
    </div>

    <!-- Document Upload -->
    <div
      v-if="selectedPropertyType === 'registered' || selectedPropertyType === 'unregistered'"
      ref="documentUploadRef"
      class="mb-6 sm:mb-8"
    >
      <DocumentUpload 
        :uploaded-files="uploadedFiles" 
        @update-files="handleFileUpdate" 
      />
    </div>

    <!-- Analysis Button -->
    <div v-if="selectedPropertyType" class="flex justify-center">
      <BaseButton
        size="lg"
        variant="primary"
        @click="startRiskAnalysis"
        class="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 font-semibold relative overflow-hidden"
        :disabled="isAnalyzing"
      >
        <transition name="fade" mode="out-in">
          <div v-if="!isAnalyzing" key="normal" class="flex items-center justify-center">
            <IconSearch class="w-4 h-4 mr-2 text-white" />
            <span class="text-sm sm:text-base">AI 위험도 분석 시작</span>
          </div>
          <div v-else key="loading" class="flex items-center justify-center">
            <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm sm:text-base">분석 중...</span>
          </div>
        </transition>
      </BaseButton>
    </div>

    <!-- Loading Overlay -->
    <LoadingOverlay
      :loading="isAnalyzing"
      message="OCR 처리 중..."
      subMessage="문서를 분석하고 있습니다"
    />
  </div>

  <!-- Modals -->
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
  
  <!-- External Property Warning Modal -->
  <BaseModal v-if="showExternalPropertyWarningModal" @close="closeExternalPropertyWarningModal">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
        <svg class="h-8 w-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">미등록 매물 분석 안내</h3>
      <div class="text-sm text-gray-600 mb-6 space-y-2">
        <p>서비스에 등록되지 않은 외부 매물을 분석하려고 합니다.</p>
        <p class="font-semibold text-gray-800">분석 결과는 저장되지 않으며, 조회 기록에도 남지 않습니다.</p>
        <p>분석 결과 페이지를 나가면 다시 확인할 수 없으니 주의해주세요.</p>
      </div>
      <div class="flex gap-3">
        <BaseButton @click="closeExternalPropertyWarningModal" variant="outline" class="flex-1">
          취소
        </BaseButton>
        <BaseButton @click="confirmExternalPropertyWarning" variant="primary" class="flex-1">
          계속 진행
        </BaseButton>
      </div>
    </div>
  </BaseModal>
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