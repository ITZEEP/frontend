<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import PropertyItem from '@/components/common/PropertyItem.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'select-history'])

const isLoading = ref(true)

const analysisHistory = ref([
  {
    id: 1,
    title: '강남구 역삼동 오피스텔',
    address: '서울시 강남구 역삼동 111-22',
    date: '2025-01-10 14:30',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMR8F3CEHkjY8O48Ua9SO7GjsJrJQReAWTImJ3EsUGWjyYsSjUFFauhow&s',
  },
  {
    id: 2,
    title: '서초구 서초동 아파트',
    address: '서울시 서초구 서초동 333-44',
    date: '2025-01-08 10:15',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMR8F3CEHkjY8O48Ua9SO7GjsJrJQReAWTImJ3EsUGWjyYsSjUFFauhow&s',
  },
])

const handleSelectHistory = (history) => {
  emit('select-history', history)
  emit('close')
}

onMounted(() => {
  // 로딩 시뮬레이션
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
        <button
          @click="emit('close')"
          class="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <IconClose class="w-5 h-5" />
        </button>
      </div>

      <div class="p-8">
        <div v-if="!isLoading" class="space-y-4">
          <div
            v-for="history in analysisHistory"
            :key="history.id"
            class="relative"
          >
            <PropertyItem
              :property="history"
              :show-date="true"
              @click="handleSelectHistory"
            />
            <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <IconChevronRight class="w-2 h-3.5 text-yellow-primary" />
            </div>
          </div>
        </div>

        <!-- 스켈레톤 UI -->
        <div v-else class="space-y-4">
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
  </BaseModal>
</template>