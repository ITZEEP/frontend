<template>
  <div class="w-full flex items-center gap-10 text-sm text-gray-500">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="w-fit flex items-center gap-2 basis-0 flex-1"
    >
      <!-- 번호 아이콘 -->
      <div
        class="w-6 h-6 flex items-center justify-center rounded-full border shrink-0"
        :class="{
          'bg-yellow-primary text-white border-yellow-primary': index + 1 === currentStep,
          'bg-gray-200 text-gray-500': index + 1 !== currentStep,
        }"
      >
        {{ index + 1 }}
      </div>

      <!-- 단계 텍스트 -->
      <div :class="{ 'w-fit text-yellow-primary font-medium': index + 1 === currentStep }">
        {{ step }}
      </div>

      <!-- 선 -->
      <div v-if="index < steps.length - 1" class="flex-1 h-px bg-gray-300 ml-2"></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const { currentStep } = defineProps({
  currentStep: {
    type: Number,
    default: 1,
  },
})

const steps = ['정보 확인', '금액 조율', '특약 조율', '적법성 검토']
</script>
