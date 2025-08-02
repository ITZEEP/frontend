<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <!-- 타이틀 -->
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">계약 기본 정보</h1>
      <p class="text-gray-500">계약의 기본 조건을 설정해주세요</p>
    </div>

    <!-- 전세/월세에 따라 동적 컴포넌트 렌더링 -->
    <component :is="currentComponent" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'

import Step4JeonseTerms from './Step4JeonseTerms.vue'
import Step4WolseTerms from './Step4WolseTerms.vue'

// Pinia 스토어 가져오기
const store = usePreContractStore()

onMounted(() => {
  const raw = localStorage.getItem('rent_type')
  store.setLeaseType(raw)
})

// leaseType에 따라 컴포넌트 분기
const currentComponent = computed(() => {
  if (store.leaseType === 'JEONSE') return Step4JeonseTerms
  if (store.leaseType === 'WOLSE') return Step4WolseTerms
  return null // 아무것도 렌더링하지 않음
})
</script>
