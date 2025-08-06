<template>
  <div class="w-screen min-h-screen bg-yellow-50">
    <PreContractHeader />
    <div class="flex flex-col items-center justify-center px-4 py-10">
      <div class="w-full max-w-[880px]">
        <div class="bg-white rounded-xl shadow-md p-8 mt-4">
          <slot :subStep="subStep" />
        </div>
      </div>

      <PreContractBtnGroup
        :step="props.currentStep"
        :subStep="subStep"
        :role="props.role"
        @next-sub-step="nextSubStep"
        @prev-sub-step="prevSubStep"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePreContractStore } from '@/stores/preContract'
import PreContractHeader from '@/components/pre-contract/layout/PreContractHeader.vue'
import PreContractBtnGroup from './PreContractBtnGroup.vue'

const props = defineProps({
  currentStep: Number,
  role: String,
})

const store = usePreContractStore()
const subStepKey = computed(() => `${props.role}-${props.currentStep}`)
const subStep = computed(() => store.currentSubSteps[subStepKey.value] || 1)

const nextSubStep = () => {
  store.nextSubStep(props.currentStep, props.role)
}

const prevSubStep = () => {
  const key = subStepKey.value
  const current = store.currentSubSteps[key] || 1
  if (current > 1) {
    store.currentSubSteps[key] = current - 1
  }
}
</script>
