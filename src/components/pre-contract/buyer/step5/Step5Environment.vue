<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <!-- 1페이지: 반려동물 여부에 따라 분기 -->
    <Step5HasPet v-if="subStep === 1 && hasPet" />
    <Step5NoPet v-else-if="subStep === 1 && !hasPet" />

    <!-- 2페이지: 공통 페이지 -->
    <Step5Residency v-else-if="subStep === 2" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'

import Step5HasPet from './Step5Sub1MoveInPet.vue' // true 일때
import Step5NoPet from './Step5Sub1MoveIn.vue'
import Step5Residency from './Step5Sub2Residency.vue'

// Pinia store
const store = usePreContractStore()

onMounted(() => {
  const raw = localStorage.getItem('has_pet')
  const parsed = raw === 'true' ? true : raw === 'false' ? false : undefined
  if (typeof parsed === 'boolean') {
    store.setHasPet(parsed)
  }
})

const hasPet = computed(() => store.hasPet)
console.log('haspet : {}', hasPet)
alert(hasPet.value)

// props로 현재 subStep 받아오기
const props = defineProps({
  subStep: Number,
})
</script>
