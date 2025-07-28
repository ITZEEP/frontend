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
      :disabled="!canProceed"
    >
      <template v-if="step === maxStep">계약서 작성하러 가기</template>
      <template v-else-if="hasSubStep && !isLastSubStep">다음</template>
      <template v-else> 다음 단계 <span class="ml-1">→</span> </template>
    </BaseButton>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { usePreContractStore } from '@/stores/preContract'

const props = defineProps({
  step: {
    type: Number,
    required: true,
    validator: (value) => value >= 1 && value <= 6,
  },
  subStep: {
    type: Number,
    default: 1,
    validator: (value) => value >= 1,
  },
  role: {
    type: String,
    required: true,
    validator: (value) => ['owner', 'tenant'].includes(value),
  },
})

const route = useRoute()
const router = useRouter()
const store = usePreContractStore()
const maxStep = 6

const canProceed = computed(() => store.canProceed)
const subStepKey = computed(() => `${props.role}-${props.step}`)
const maxSubStep = computed(() => store.subSteps[subStepKey.value] || 1)
const hasSubStep = computed(() => maxSubStep.value > 1)
const isLastSubStep = computed(() => props.subStep === maxSubStep.value)

const handleNextClick = () => {
  if (props.step === maxStep) {
    const id = route.params.id
    if (id) {
      router.push(`/contract/${id}`)
    } else {
      console.warn('params에서 id를 찾을 수 없습니다.')
    }
    return
  }

  if (hasSubStep.value && !isLastSubStep.value) {
    store.nextSubStep(props.step, props.role)
  } else {
    goToStep(props.step + 1)
  }
}

const handlePrevClick = () => {
  if (hasSubStep.value && props.subStep > 1) {
    const key = subStepKey.value
    store.currentSubSteps[key] = props.subStep - 1
  } else if (props.step > 1) {
    goToStep(props.step - 1)
  }
}

const goToStep = (newStep) => {
  if (newStep <= maxStep) {
    router.push({ query: { ...route.query, step: newStep } })
    store.triggerSubmit?.()
  }
}
</script>
