<template>
  <!-- 모바일 버전: 모든 단계를 컴팩트하게 표시 -->
  <div class="w-full md:hidden">
    <div class="flex items-center justify-center gap-1 px-3 py-3 bg-gray-50 rounded-lg">
      <template v-for="(step, index) in steps" :key="index">
        <div class="flex flex-col items-center gap-1 min-w-0 flex-shrink-0">
          <div
            class="w-6 h-6 flex items-center justify-center rounded-full border text-xs"
            :class="{
              'bg-yellow-primary text-white border-yellow-primary': index + 1 === currentStep,
              'bg-gray-200 text-gray-500 border-gray-300': index + 1 !== currentStep,
            }"
          >
            {{ index + 1 }}
          </div>
          <div 
            class="text-xs text-center leading-tight px-1"
            :class="{ 'text-black font-medium': index + 1 === currentStep, 'text-gray-500': index + 1 !== currentStep }"
          >
            {{ step }}
          </div>
        </div>
        <!-- 연결선 (마지막 단계 제외) -->
        <div v-if="index < steps.length - 1" class="w-4 h-px bg-gray-300 flex-shrink-0 mt-[-12px]"></div>
      </template>
    </div>
  </div>

  <!-- 데스크톱 버전: 전체 단계 표시 -->
  <div class="hidden md:flex w-full items-center gap-4 lg:gap-10 text-sm text-gray-500">
    <div v-for="(step, index) in steps" :key="index" class="flex items-center gap-2">
      <div
        class="w-6 h-6 flex items-center justify-center rounded-full border shrink-0"
        :class="{
          'bg-yellow-primary text-white border-yellow-primary': index + 1 === currentStep,
          'bg-gray-200 text-gray-500': index + 1 !== currentStep,
        }"
      >
        {{ index + 1 }}
      </div>

      <div :class="{ 'text-black font-medium': index + 1 === currentStep }" class="whitespace-nowrap">
        {{ step }}
      </div>

      <div v-if="index < steps.length - 1" class="w-8 lg:w-16 h-px bg-gray-300 mx-2"></div>
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
