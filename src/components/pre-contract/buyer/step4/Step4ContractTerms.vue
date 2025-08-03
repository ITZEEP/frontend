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
import { useRoute } from 'vue-router'
import buyerApi from '@/apis/pre-contract-buyer.js'

import Step4JeonseTerms from './Step4JeonseTerms.vue'
import Step4WolseTerms from './Step4WolseTerms.vue'

const route = useRoute()
const contractChatId = route.params.id

// Pinia 스토어 가져오기
const store = usePreContractStore()

onMounted(async () => {
  try {
    // 1. API로부터 초기 임차인 정보 가져오기
    const { data } = await buyerApi.saveTenantInfo(contractChatId)

    // 2. 받아온 데이터를 localStorage에 저장
    if (data) {
      localStorage.setItem('rent_type', data.rentType)
      localStorage.setItem('has_pet', data.hasPet.toString())
      localStorage.setItem('has_parking', data.hasParking.toString())

      // 3. Pinia store에도 필요한 값 반영
      const raw = localStorage.getItem('rent_type')
      store.setLeaseType(raw)
    }
  } catch (error) {
    console.error('초기 임차인 정보 가져오기 실패 ❌', error)
  }
})

// leaseType에 따라 컴포넌트 분기
const currentComponent = computed(() => {
  if (store.leaseType === 'JEONSE') return Step4JeonseTerms
  if (store.leaseType === 'WOLSE') return Step4WolseTerms
  return null // 아무것도 렌더링하지 않음
})
</script>
