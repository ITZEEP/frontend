<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconLock from '@/components/icons/IconLock.vue'
import PropertyItem from '@/components/common/PropertyItem.vue'
import LoginRequiredModal from '@/components/risk-check/LoginRequiredModal.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { fraudApi } from '@/apis/fraud'
import { useModalStore } from '@/stores/modal'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select-history'])
const modalStore = useModalStore()

const isLoading = ref(true)
const analysisHistory = ref([])
const error = ref(null)
const needsAuth = ref(false)
const showLoginModal = ref(false)

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
    
    // 401 에러인 경우 로그인 필요 상태로 설정
    if (err.response?.status === 401) {
      needsAuth.value = true
      error.value = null
    } else {
      // 다른 에러의 경우 에러 메시지 설정
      needsAuth.value = false
      if (err.response) {
        if (err.response.status === 403) {
          error.value = '분석 기록을 조회할 권한이 없습니다.'
        } else if (err.response.status === 500) {
          error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else {
          error.value = `오류 발생 (${err.response.status}): ${err.response.data?.message || '분석 기록을 불러오는데 실패했습니다.'}`
        }
      } else if (err.request) {
        error.value = '서버와 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
      } else {
        error.value = err.message || '분석 기록을 불러오는데 실패했습니다.'
      }
    }
    
    analysisHistory.value = []
  } finally {
    isLoading.value = false
  }
}

// 모달이 열릴 때마다 데이터 새로고침
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // 상태 초기화
    needsAuth.value = false
    error.value = null
    fetchAnalysisHistory()
  }
})

const closeLoginModal = () => {
  showLoginModal.value = false
  modalStore.close()
}
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
          <!-- 로그인이 필요한 경우 -->
          <div v-if="!isLoading && needsAuth" class="flex flex-col items-center justify-center py-16">
            <div class="mb-4">
              <IconLock class="w-12 h-12 text-gray-400" />
            </div>
            <p class="text-gray-600 mb-4">로그인이 필요한 서비스입니다.</p>
            <BaseButton @click="showLoginModal = true" variant="primary" size="md">
              로그인하기
            </BaseButton>
          </div>
          
          <!-- 분석 기록 목록 -->
          <div v-else-if="!isLoading && !error" class="space-y-4 pr-2">
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
          <div v-else-if="isLoading" class="space-y-4 pr-2">
            <PropertyItem
              v-for="n in 3"
              :key="n"
              :property="{}"
              :is-loading="true"
              :clickable="false"
            />
          </div>

          <!-- 에러 상태 -->
          <div v-if="error && !isLoading">
            <ErrorState @retry="fetchAnalysisHistory" />
          </div>

          <!-- 데이터 없음 상태 -->
          <div v-else-if="!isLoading && !error && !needsAuth && analysisHistory.length === 0">
            <EmptyState
              title="아직 분석 기록이 없습니다."
              message="위험도 분석을 진행하면 기록이 여기에 표시됩니다."
            >
              <template #icon>
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </template>
            </EmptyState>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>

  <!-- 로그인 필요 모달 -->
  <LoginRequiredModal
    :is-open="showLoginModal"
    :title="'조회 기록 확인'"
    :message="'분석 기록을 확인하려면 로그인이 필요합니다.'"
    @close="closeLoginModal"
  />
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
