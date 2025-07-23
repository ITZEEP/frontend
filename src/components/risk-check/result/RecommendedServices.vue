<script setup>
import { defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import IconChart from '@/components/icons/IconChart.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconChain from '@/components/icons/IconChain.vue'

const emit = defineEmits(['analyze-another'])
const router = useRouter()

const goToInsurance = () => {
  router.push('/risk-check/insurance')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h3 class="text-xl font-semibold text-gray-warm-700 mb-6">추천 서비스</h3>

    <div class="grid grid-cols-2 gap-6 mb-10">
      <!-- 정책 지원 알아보기 -->
      <div
        class="bg-yellow-primary rounded-xl p-6 text-center h-[172px] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div class="w-12 h-12 mb-4 flex items-center justify-center">
          <IconChain class="text-white" />
        </div>
        <h4 class="font-medium text-base text-white mb-2">정책 지원 알아보기</h4>
        <p class="text-sm text-white opacity-90">
          현재 지원 가능한 주택 관련 정책 지원 사항을 확인하세요
        </p>
      </div>

      <!-- 보증보험 알아보기 -->
      <div
        @click="goToInsurance"
        class="bg-yellow-400 rounded-xl p-6 text-center h-[172px] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div class="w-12 h-12 mb-4 flex items-center justify-center">
          <IconShield class="text-white" />
        </div>
        <h4 class="font-medium text-base text-white mb-2">보증보험 알아보기</h4>
        <p class="text-sm text-white opacity-90">
          안전한 거래를 위한 보증보험 상품을 확인하세요
        </p>
      </div>
    </div>

    <div class="flex justify-center">
      <button
        @click="$emit('analyze-another')"
        class="px-8 py-3 bg-white border-2 border-yellow-primary text-yellow-primary rounded hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
      >
        <IconChart />
        다른 매물 분석하기
      </button>
    </div>
  </div>
</template>