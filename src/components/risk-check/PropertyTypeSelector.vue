<script setup>
import IconHome from '@/components/icons/IconHome.vue'

defineProps({
  selectedType: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-type'])

const handleRegisteredProperty = () => {
  emit('select-type', 'registered')
}

const handleUnregisteredProperty = () => {
  emit('select-type', 'unregistered')
}
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h2 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">매물 유형 선택</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <button
        @click="handleRegisteredProperty"
        :class="[
          'group relative flex flex-col items-center py-6 sm:py-8 lg:py-9 px-4 sm:px-6 lg:px-8 border-2 border-yellow-primary rounded-xl transition-all duration-300 transform hover:scale-[1.02]',
          selectedType === 'registered'
            ? 'bg-yellow-400 scale-[1.02] shadow-lg'
            : 'bg-white hover:shadow-lg',
        ]"
      >
        <div
          class="mb-3 sm:mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        >
          <IconHome class="w-8 h-7 sm:w-10 sm:h-9 text-yellow-primary" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-warm-700 mb-1 sm:mb-2">서비스 등록 매물</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center">잇집에 등록된 매물 중에서 선택</p>
      </button>

      <button
        @click="handleUnregisteredProperty"
        :class="[
          'group relative flex flex-col items-center py-6 sm:py-8 lg:py-9 px-4 sm:px-6 lg:px-8 border-2 rounded-xl transition-all duration-300 transform hover:scale-[1.02]',
          selectedType === 'unregistered'
            ? 'border-yellow-primary bg-yellow-400 scale-[1.02] shadow-lg'
            : 'border-yellow-primary bg-white hover:shadow-lg',
        ]"
      >
        <div
          class="mb-3 sm:mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        >
          <IconHome class="w-8 h-7 sm:w-10 sm:h-9 text-yellow-primary" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-warm-700 mb-1 sm:mb-2">미등록 매물</h3>
        <p class="text-xs sm:text-sm text-gray-600 text-center">외부 매물 정보를 직접 입력</p>
      </button>
    </div>
  </div>
</template>
