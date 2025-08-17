<script setup>
import IconLightbulb from '@/components/icons/IconLightbulb.vue'
import IconShield from '@/components/icons/IconShield.vue'

const preContractChecks = [
  '현장 방문 시 제시된 서류와 실제 현황이 일치하는지 확인',
  '소유자 본인과 직접 만나서 계약 진행',
  '등기부 등본의 소유자 명과 임대인이 일치하는지 확인',
]

const safetyTips = [
  '계약금은 계약서 작성 후 입금',
  '계약 당일 확정일자 발급',
  '당일 등기부등본 열람으로 최종 확인',
]
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">거래 시 참고사항</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div class="border border-gray-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-2.5 sm:mb-3">
          <IconLightbulb class="text-yellow-primary w-5 h-5 sm:w-6 sm:h-6" />
          <span class="text-xs sm:text-base font-medium text-gray-warm-700">계약 전 확인사항</span>
        </div>
        <ul class="space-y-1.5 sm:space-y-2">
          <li v-for="(item, index) in preContractChecks" :key="index" class="flex items-center gap-2">
            <span class="text-gray-500">•</span>
            <span class="text-sm text-gray-warm-500">{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="border border-gray-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-2.5 sm:mb-3">
          <IconShield class="text-yellow-primary w-5 h-5 sm:w-6 sm:h-6" />
          <span class="text-xs sm:text-base font-medium text-gray-warm-700">안전한 거래를 위한 팁</span>
        </div>
        <ul class="space-y-1.5 sm:space-y-2">
          <li v-for="(item, index) in safetyTips" :key="index" class="flex items-center gap-2">
            <span class="text-gray-500">•</span>
            <span class="text-sm text-gray-warm-500">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>