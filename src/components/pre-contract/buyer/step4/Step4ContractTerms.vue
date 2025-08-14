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
  // 1) 로컬스토리지 우선 (이미 saveTenantInfo가 실행된 케이스)
  const cachedRentType = localStorage.getItem('rent_type')
  if (cachedRentType === 'JEONSE' || cachedRentType === 'WOLSE') {
    store.setLeaseType(cachedRentType)
  }

  // 2) 없으면 최초 초기화 API 호출
  try {
    const { data } = await buyerApi.saveTenantInfo(contractChatId)
    if (data) {
      if (data.rentType) {
        localStorage.setItem('rent_type', data.rentType)
        store.setLeaseType(data.rentType)
      }
      if (typeof data.hasPet === 'boolean') {
        localStorage.setItem('has_pet', String(data.hasPet))
      }
      if (typeof data.hasParking === 'boolean') {
        localStorage.setItem('has_parking', String(data.hasParking))
      }
    }
  } catch (error) {
    console.error('초기 임차인 정보 가져오기 실패 ❌', error)
    const fallback = localStorage.getItem('rent_type')
    if (fallback === 'JEONSE' || fallback === 'WOLSE') {
      store.setLeaseType(fallback)
    } else {
      store.setLeaseType(null)
    }
  }
})

// leaseType에 따라 컴포넌트 분기
const currentComponent = computed(() => {
  if (store.leaseType === 'JEONSE') return Step4JeonseTerms
  if (store.leaseType === 'WOLSE') return Step4WolseTerms
  return null
})
</script>
