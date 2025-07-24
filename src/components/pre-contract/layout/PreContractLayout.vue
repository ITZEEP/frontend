<template>
  <div class="-mx-layout-x -mt-layout-y -my-layout-y w-screen min-h-screen bg-yellow-50">
    <PreContractHeader />
    <div class="flex flex-col items-center justify-center px-4 py-10">
      <div class="w-full max-w-[880px]">
        <div class="bg-white rounded-xl shadow-md p-8 mt-4">
          <slot :subStep="subStep" />
        </div>
      </div>

      <PreContractBtnGroup
        :step="props.currentStep"
        :sub-step="subStep"
        :role="props.role"
        @next-sub-step="nextSubStep"
        @prev-sub-step="prevSubStep"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import PreContractHeader from '@/components/pre-contract/layout/PreContractHeader.vue'
import PreContractBtnGroup from './PreContractBtnGroup.vue'

const props = defineProps({
  currentStep: Number,
  role: String,
})

// 서브스텝 상태
const subStep = ref(1)

// 서브스텝 개수 맵
const subStepCountMap = {
  'owner-3': 2,
}

const subStepKey = computed(() => `${props.role}-${props.currentStep}`)
const maxSubStep = computed(() => subStepCountMap[subStepKey.value] ?? 1)

watch(
  () => props.currentStep,
  () => {
    subStep.value = 1
  },
)

const nextSubStep = () => {
  if (subStep.value < maxSubStep.value) {
    subStep.value++
  }
}

const prevSubStep = () => {
  if (subStep.value > 1) {
    subStep.value--
  }
}
</script>
