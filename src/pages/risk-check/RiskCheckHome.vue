<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useModalStore } from '@/stores/modal'
import { useFraudStore } from '@/stores/fraud'
import { fraudApi } from '@/api/fraud'

import PropertyTypeSelector from '@/components/risk-check/PropertyTypeSelector.vue'
import PropertyCard from '@/components/risk-check/PropertyCard.vue'
import DocumentUpload from '@/components/risk-check/DocumentUpload.vue'
import RiskCheckHistoryModal from '@/components/risk-check/RiskCheckHistoryModal.vue'
import FileUploadWarningModal from '@/components/risk-check/FileUploadWarningModal.vue'
import PropertyTypeWarningModal from '@/components/risk-check/PropertyTypeWarningModal.vue'
import PropertySelectionWarningModal from '@/components/risk-check/PropertySelectionWarningModal.vue'

import IconClock from '@/components/icons/IconClock.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

const router = useRouter()
const modalStore = useModalStore()
const fraudStore = useFraudStore()

const showHistoryModal = ref(false)
const showFileWarningModal = ref(false)
const showPropertyTypeWarningModal = ref(false)
const showPropertySelectionWarningModal = ref(false)
const missingFiles = ref([])
const selectedPropertyType = ref(null)
const selectedTab = ref('favorite')
const selectedPropertyId = ref(null)
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
    const response = await fraudApi.analyzeDocuments(
      uploadedFiles.value['등기부등본'],
      uploadedFiles.value['건축물대장'],
      selectedPropertyId.value || 1 // 등록되지 않은 매물의 경우 임시 ID 사용
    )

    if (response.success && response.data) {
      // Store에 OCR 분석 결과 저장
      fraudStore.setDocumentAnalysisData(response.data)
      
      // OCR 확인 페이지로 이동 (URL에는 민감한 정보 노출하지 않음)
      router.push('/risk-check/confirm')
    } else {
      alert('문서 분석에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
    }
  } catch (error) {
    console.error('OCR 분석 오류:', error)
    alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
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
