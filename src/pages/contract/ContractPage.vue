<template>
  <section class="contract-page">
    <!-- 채팅은 항상 고정 -->
    <ContractChat :currentStep="step" :roomId="roomId" />

    <!-- 임대인이 아직 입장하지 않은 경우 -->
    <PreContractIntro v-if="step === null" />

    <!-- 단계별 컴포넌트 -->
    <component v-else :is="currentStepComponent" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ContractChat from '@/components/contract/ContractChat.vue'

import Step1Compare from '@/components/contract/form/Step1Compare.vue'
import Step2Price from '@/components/contract/form/Step2Price.vue'
import Step3Terms from '@/components/contract/form/Step3Terms.vue'
import Step4Legal from '@/components/contract/form/Step4Legal.vue'
import Step5Done from '@/components/contract/form/Step5Done.vue'

const route = useRoute()

// 경로 파라미터에서 roomId 추출
const roomId = computed(() => route.params.roomId)

// 쿼리 파라미터에서 step 추출
const step = computed(() => {
  const s = Number(route.query.step)
  return Number.isNaN(s) ? null : s
})

// 단계별 컴포넌트 매핑
const stepComponents = {
  1: Step1Compare,
  2: Step2Price,
  3: Step3Terms,
  4: Step4Legal,
  5: Step5Done,
}

const currentStepComponent = computed(() => (step.value ? stepComponents[step.value] : null))
</script>

<style scoped></style>
