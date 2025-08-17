<template>
  <div class="w-full flex items-center gap-4 md:gap-10 text-sm text-gray-500">
    <div v-for="(step, index) in steps" :key="index" class="w-full flex items-center gap-2">
      <div
        class="w-6 h-6 flex items-center justify-center rounded-full border shrink-0"
        :class="{
          'bg-yellow-primary text-white border-yellow-primary': index + 1 === currentStep,
          'bg-gray-200 text-gray-500': index + 1 !== currentStep,
        }"
      >
        {{ index + 1 }}
      </div>

      <div :class="{ 'text-black font-medium': index + 1 === currentStep }">
        {{ step }}
      </div>

      <div v-if="index < steps.length" class="flex-1 h-px bg-gray-300 ml-2"></div>
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

const steps = ['기본 정보', '가격 정보', '상세 정보', '사진 및 설명']
</script>
