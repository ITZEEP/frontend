<template>
  <div class="butter-box w-full flex justify-between items-center p-4">
    <!-- 매물 기본 정보 -->
    <div class="flex flex-col gap-1">
      <h2 class="text-xl font-bold text-gray-800">{{ homeData.title }}</h2>
      <p class="text-sm text-gray-600">{{ fullAddress }}</p>
    </div>

    <!-- 가격 정보 -->
    <div class="w-full text-right">
      <p class="text-sm text-yellow-600 font-semibold">
        {{ leaseTypeLabel }}
      </p>
      <p class="text-base font-bold text-gray-800">
        {{ formattedPrice }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Object,
})

const homeData = props.data

// 전체 주소 조합
const fullAddress = computed(() => {
  return `${homeData.addr1} ${homeData.addr2}`
})

// 전세/월세 한글 라벨
const leaseTypeLabel = computed(() => {
  return homeData.lease_type === 'JEONSE' ? '전세' : '월세'
})

// 가격 표시 포맷
const formattedPrice = computed(() => {
  if (homeData.lease_type === 'JEONSE') {
    return `보증금 ${homeData.deposit_price.toLocaleString()}만 원`
  } else {
    return `보증금 ${homeData.deposit_price.toLocaleString()} / 월 ${homeData.monthly_rent.toLocaleString()}만 원`
  }
})
</script>

<style scoped></style>
