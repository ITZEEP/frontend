<!-- StepContentWrapper.vue -->
<template>
  <div class="w-3/5 max-h-[1002px] bg-white rounded-lg overflow-auto flex flex-col gap-4 py-4 px-6">
    <header class="flex flex-col justify-center gap-5 border-b pb-4">
      <h1 class="text-lg font-bold text-gray-800">부동산 임대차 계약서</h1>
      <StepProgress v-if="step !== null" :currentStep="step" />
    </header>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="py-12 text-center text-gray-500">기본 정보 불러오는 중...</div>
    <div v-else-if="error" class="py-12 text-center text-red-500">{{ error }}</div>

    <template v-else>
      <template v-if="showBoth">
        <Step1Compare :basic="contractBasic" />
        <Step2Price :basic="contractBasic" />
      </template>

      <component v-else :is="currentComponent" :basic="contractBasic" />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import StepProgress from './StepProgress.vue'
import { contractApi } from '@/apis/contractApi'

import Step1Compare from './step1/Step1Compare.vue'
import Step2Price from './Step2Price.vue'
import Step3Terms from './Step3Terms.vue'
import Step4Legal from './Step4Legal.vue'
import Step5Done from './Step5Done.vue'

const props = defineProps({
  step: { type: Number, required: true },
})

const route = useRoute()
const contractChatId = route.params.id ?? route.query.id ?? null

const loading = ref(false)
const error = ref('')
const contractBasic = ref(null)

onMounted(async () => {
  if (!contractChatId) {
    error.value = 'contractChatId가 없습니다.'
    return
  }
  try {
    loading.value = true
    const res = await contractApi.getContractBasic(String(contractChatId))
    contractBasic.value = res.data
  } catch (e) {
    console.error(e)
    error.value = '계약 기본 정보 조회에 실패했습니다.'
  } finally {
    loading.value = false
  }
})

const showBoth = computed(() => props.step === 1 || props.step === 2)

const stepMap = {
  3: Step3Terms,
  4: Step4Legal,
  5: Step5Done,
}
const currentComponent = computed(() => stepMap[props.step])
</script>
