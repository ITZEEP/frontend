<script setup>
import { ref, onMounted, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import PropertyItem from '@/components/common/PropertyItem.vue'
import { fraudApi } from '@/api/fraud'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select-history'])

const isLoading = ref(true)
const analysisHistory = ref([])
const error = ref(null)

const handleSelectHistory = (history) => {
  emit('select-history', history)
  emit('close')
}

// 실제 API에서 분석 기록 조회
const fetchAnalysisHistory = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('분석 기록 조회 시작...')
    const response = await fraudApi.getRiskCheckList(1, 20) // 첫 페이지, 20개 조회
    console.log('분석 기록 API 응답:', response)
    
    if (response && response.content) {
      // PageResponse의 content 직접 사용
      
      // API 응답 데이터를 PropertyItem에 맞는 형식으로 변환
      analysisHistory.value = response.content.map(item => ({
        id: item.riskCheckId,
        title: item.residenceType || '매물',
        address: item.address || '',
        detailAddress: item.detailAddress || '',
        type: item.residenceType || '매물',
        imageUrl: item.imageUrl || '',
        checkedAt: item.checkedAt,
        riskCheckId: item.riskCheckId
      }))
      console.log('변환된 분석 기록:', analysisHistory.value)
    } else {
      analysisHistory.value = []
      console.log('분석 기록이 없습니다.')
    }
  } catch (err) {
    console.error('분석 기록 조회 실패:', err)
    error.value = err.message || '분석 기록을 불러오는데 실패했습니다.'
    analysisHistory.value = []
  } finally {
    isLoading.value = false
  }
}

// 모달이 열릴 때마다 데이터 새로고침
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchAnalysisHistory()
  }
})
</script>

<template>
  <BaseModal v-if="isOpen" @close="emit('close')" :closable="false" maxWidth="max-w-4xl">
    <div class="-m-6">
      <div class="px-8 py-6 border-b border-gray-300 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-warm-700">분석 기록</h2>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700 transition-colors">
          <IconClose class="w-5 h-5" />
        </button>
      </div>

      <div class="p-8">
        <!-- 스크롤 가능한 컨테이너 추가 -->
        <div
          class="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div v-if="!isLoading" class="space-y-4 pr-2">
            <div v-for="history in analysisHistory" :key="history.id" class="relative">
              <PropertyItem
                :property="history"
                :show-date="true"
                @click="handleSelectHistory(history)"
              />
              <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <IconChevronRight class="w-2 h-3.5 text-yellow-primary" />
              </div>
            </div>
          </div>

          <!-- 스켈레톤 UI -->
          <div v-else class="space-y-4 pr-2">
            <PropertyItem
              v-for="n in 3"
              :key="n"
              :property="{}"
              :is-loading="true"
              :clickable="false"
            />
          </div>

          <!-- 에러 상태 -->
          <div v-if="error && !isLoading" class="text-center py-12">
            <div class="text-red-500 mb-2">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p class="text-gray-600 mb-4">{{ error }}</p>
            <button 
              @click="fetchAnalysisHistory" 
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>

          <!-- 데이터 없음 상태 -->
          <div v-else-if="!isLoading && analysisHistory.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p class="text-gray-600">아직 분석 기록이 없습니다.</p>
            <p class="text-gray-500 text-sm mt-2">위험도 분석을 진행하면 기록이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
/* 스크롤바 스타일링 - 크로스브라우저 지원 */
.scrollbar-thin {
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

/* WebKit 기반 브라우저 (Chrome, Safari, Edge) */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* IE/Edge 레거시 지원 */
.scrollbar-thin {
  -ms-overflow-style: -ms-autohiding-scrollbar;
}
</style>
