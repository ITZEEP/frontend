<template>
  <div class="w-full max-w-[640px] flex justify-between mt-6 px-2">
    <BaseButton v-if="step > 1" size="md" variant="outline" @click="goToStep(step - 1)">
      <span class="mr-1">←</span> 이전
    </BaseButton>

    <BaseButton
      size="md"
      variant="primary"
      @click="handleNextClick"
      :class="step === 1 ? 'ml-auto' : ''"
    >
      <template v-if="step === maxStep"> 계약서 작성하러 가기 </template>
      <template v-else> 다음 <span class="ml-1">→</span> </template>
    </BaseButton>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'

const maxStep = 6

const route = useRoute()
const router = useRouter()

const step = computed(() => Number(route.query.step) || 1)

// 다음 버튼 클릭 시 처리
const handleNextClick = () => {
  if (step.value >= maxStep) {
    // step=6일 때는 계약서 작성 페이지로 이동
    const contractId = route.params.id
    router.push(`/contract/${contractId}`)
  } else {
    // 다음 step으로 쿼리 갱신
    goToStep(step.value + 1)
  }
}

const goToStep = (newStep) => {
  router.push({ query: { ...route.query, step: newStep } })
}
</script>

<style scoped></style>
