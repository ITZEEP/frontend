<template>
  <div class="w-3/5 bg-white rounded-lg overflow-auto flex flex-col gap-4 py-4 px-6">
    <header class="flex flex-col justify-center gap-5 border-b pb-4">
      <h1 class="text-lg font-bold text-gray-800">부동산 임대차 계약서</h1>
      <!-- 프로그레스 바 -->
      <StepProgress v-if="step !== null" :currentStep="step" />
    </header>
    <!-- 현재 단계 컴포넌트 -->
    <component v-if="step !== null" :is="currentComponent" />
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import StepProgress from './StepProgress.vue'

import Step1Compare from './Step1Compare.vue'
import Step2Price from './Step2Price.vue'
import Step3Terms from './Step3Terms.vue'
import Step4Legal from './Step4Legal.vue'
import Step5Done from './Step5Done.vue'

const props = defineProps({
  step: {
    type: Number,
    required: true,
  },
})

const stepComponents = {
  1: Step1Compare,
  2: Step2Price,
  3: Step3Terms,
  4: Step4Legal,
  5: Step5Done,
}

const currentComponent = computed(() => stepComponents[props.step])
</script>
