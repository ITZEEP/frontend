<template>
  <div class="w-full max-w-[640px] flex justify-between mt-6 px-2">
    <BaseButton v-if="step > 1" size="md" variant="outline" @click="handlePrevClick">
      <span class="mr-1">←</span> 이전
    </BaseButton>

    <BaseButton
      size="md"
      variant="primary"
      @click="handleNextClick"
      :class="step === 1 ? 'ml-auto' : ''"
    >
      <template v-if="step === maxStep"> 계약서 작성하러 가기 </template>
      <template v-else-if="hasSubStep && !isLastSubStep"> 다음 </template>
      <template v-else> 다음 단계 <span class="ml-1">→</span> </template>
    </BaseButton>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { computed } from 'vue'
import { usePreContractStore } from '@/stores/ownerPreContractStore'

const store = usePreContractStore()

const props = defineProps({
  step: Number,
  subStep: Number,
  role: String,
})

const emit = defineEmits(['next-sub-step', 'prev-sub-step'])

const route = useRoute()
const router = useRouter()

const maxStep = 6

const subStepCountMap = {
  'owner-3': 2,
}

const subStepKey = computed(() => `${props.role}-${String(props.step)}`)
const maxSubStep = computed(() => subStepCountMap[subStepKey.value])
const hasSubStep = computed(() => !!maxSubStep.value)

const currentSubStep = computed(() => Number(props.subStep))
const isLastSubStep = computed(() => currentSubStep.value === maxSubStep.value)

const handleNextClick = () => {
  if (maxSubStep.value) {
    if (currentSubStep.value < maxSubStep.value) {
      emit('next-sub-step')
    } else {
      goToStep(props.step + 1)
    }
  } else {
    goToStep(props.step + 1)
  }
}

const handlePrevClick = () => {
  if (maxSubStep.value && currentSubStep.value > 1) {
    emit('prev-sub-step')
  } else if (props.step > 1) {
    goToStep(props.step - 1)
  }
}

const goToStep = (newStep) => {
  if (newStep <= maxStep) {
    router.push({ query: { ...route.query, step: newStep } })
    store.triggerSubmit()
  }
}
</script>
