<script setup>
import { useRouter } from 'vue-router'
import IconChart from '@/components/icons/IconChart.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconChain from '@/components/icons/IconChain.vue'

defineEmits(['analyze-another'])
const router = useRouter()

const goToInsurance = () => {
  router.push('/risk-check/insurance')
}
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">추천 서비스</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
      <!-- 정책 지원 알아보기 -->
      <div
        class="bg-yellow-primary rounded-xl p-4 sm:p-6 text-center min-h-[140px] sm:h-[172px] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center">
          <IconChain class="text-white w-full h-full" />
        </div>
        <h4 class="font-medium text-sm sm:text-base text-white mb-1.5 sm:mb-2">정책 지원 알아보기</h4>
        <p class="text-xs sm:text-sm text-white opacity-90 px-2">
          현재 지원 가능한 주택 관련 정책 지원 사항을 확인하세요
        </p>
      </div>

      <!-- 보증보험 알아보기 -->
      <div
        @click="goToInsurance"
        class="bg-yellow-400 rounded-xl p-4 sm:p-6 text-center min-h-[140px] sm:h-[172px] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center">
          <IconShield class="text-white w-full h-full" />
        </div>
        <h4 class="font-medium text-sm sm:text-base text-white mb-1.5 sm:mb-2">보증보험 알아보기</h4>
        <p class="text-xs sm:text-sm text-white opacity-90 px-2">
          안전한 거래를 위한 보증보험 상품을 확인하세요
        </p>
      </div>
    </div>

    <div class="flex justify-center">
      <button
        @click="$emit('analyze-another')"
        class="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-yellow-primary text-yellow-primary rounded hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 font-medium text-xs sm:text-sm"
      >
        <IconChart class="w-4 h-4 sm:w-5 sm:h-5" />
        다른 매물 분석하기
      </button>
    </div>
  </div>
</template>
