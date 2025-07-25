<script setup>
import { ref, onMounted } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import PropertyItem from '@/components/common/PropertyItem.vue'

import analysisHistoryMockData from '@/mocks/risk/analysisHistoryMockData.json'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select-history'])

const isLoading = ref(true)

const analysisHistory = ref(analysisHistoryMockData.analysisHistory)

const handleSelectHistory = (history) => {
  emit('select-history', history)
  emit('close')
}

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
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

          <div v-if="!isLoading && analysisHistory.length === 0" class="text-center py-12">
            <p class="text-gray-600">분석 기록이 없습니다.</p>
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
