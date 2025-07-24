<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useModalStore } from '@/stores/modal'

import PropertyTypeSelector from '@/components/risk-check/PropertyTypeSelector.vue'
import PropertyCard from '@/components/risk-check/PropertyCard.vue'
import DocumentUpload from '@/components/risk-check/DocumentUpload.vue'
import RiskCheckHistoryModal from '@/components/risk-check/RiskCheckHistoryModal.vue'

import IconClock from '@/components/icons/IconClock.vue'
import IconSearch from '@/components/icons/IconSearch.vue'

const router = useRouter()
const modalStore = useModalStore()

const showHistoryModal = ref(false)
const selectedPropertyType = ref(null)
const selectedTab = ref('favorite')
const uploadedFiles = ref({
  등기부등본: null,
  건축물대장: null,
})
const isAnalyzing = ref(false)

onMounted(() => {
  document.body.style.backgroundColor = '#F7F7F8'
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
})

const handlePropertyTypeSelect = (type) => {
  selectedPropertyType.value = type
  if (type === 'unregistered') {
    uploadedFiles.value.등기부등본 = null
    uploadedFiles.value.건축물대장 = null
  }
}

const handleTabSelect = (tab) => {
  selectedTab.value = tab
}

const handleFileUpdate = (fileType, file) => {
  uploadedFiles.value[fileType] = file
}

const startRiskAnalysis = async () => {
  // 파일 업로드 검증
  if (!uploadedFiles.value || uploadedFiles.value.length === 0) {
    alert('분석할 파일을 업로드해주세요.')
    return
  }

  isAnalyzing.value = true

  try {
    // OCR 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // OCR 확인 페이지로 이동
    router.push('/risk-check/confirm')
  } catch (error) {
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
  router.push(`/risk-check/result/${history.analysisId}`)
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

    <div class="mb-8">
      <PropertyTypeSelector
        :selected-type="selectedPropertyType"
        @select-type="handlePropertyTypeSelect"
      />
    </div>

    <div v-if="selectedPropertyType === 'registered'" class="mb-8">
      <PropertyCard :selected-tab="selectedTab" @select-tab="handleTabSelect" />
    </div>

    <div
      v-if="selectedPropertyType === 'registered' || selectedPropertyType === 'unregistered'"
      class="mb-8"
    >
      <DocumentUpload :uploaded-files="uploadedFiles" @update-files="handleFileUpdate" />
    </div>

    <div
      v-if="selectedPropertyType === 'registered' || selectedPropertyType === 'unregistered'"
      class="flex justify-center"
    >
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
</style>
