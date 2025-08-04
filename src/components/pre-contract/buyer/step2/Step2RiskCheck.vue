<template>
  <div class="w-full p-6 rounded-xl">
    <!-- 상단 경고 아이콘과 안내 -->
    <div class="text-center mb-6">
      <div class="flex flex-col items-center justify-center gap-2">
        <div
          class="w-12 h-12 bg-[#FFE9C3] rounded-full flex items-center justify-center text-[#FF9D00] text-xl"
        >
          ⚠️
        </div>
        <p class="text-xl font-bold text-gray-800">분석이 필요합니다</p>
        <p class="text-sm text-gray-600">
          이 매물에 대한 사기 위험도 분석을 진행하여 안전한 거래를 위한 정보를 확인해보세요
        </p>
      </div>
    </div>

    <!-- 분석 시작 버튼 -->
    <div class="flex justify-center mb-6">
      <BaseButton variant="primary" @click="goToRisk"> 🔍 사기 위험도 분석 시작하기 </BaseButton>
    </div>

    <!-- 내용 분리: 분석 내용 + 매물 정보 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
      <!-- 분석 내용 -->
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <p class="font-bold mb-2 text-gray-700">분석 내용</p>
        <ul class="space-y-1 text-gray-600">
          <li>✅ 등기부등본 소유자와 임대인 일치</li>
          <li>✅ 건축물 정보 확인</li>
          <li>✅ 법적위험 확인</li>
        </ul>
      </div>

      <!-- 매물 정보 -->
      <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <p class="font-bold mb-2 text-gray-700">매물 정보</p>
        <ul class="space-y-1 text-gray-600">
          <li>🔵 공인중개사 매물 정보 일치</li>
          <li>🔵 관리관계 이상 유무</li>
          <li>🔵 시세 적정성 확인</li>
        </ul>
      </div>
    </div>

    <!-- 하단 주의 박스 -->
    <div class="bg-[#FFF0CC] border-l-4 border-[#FFB800] text-[#C27900] text-xs p-3 rounded">
      ⚠️ 주의! 보증금: 전세보증금 반환보증보험 (보증금의 80% 보장)
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const store = usePreContractStore()
const router = useRouter()

onMounted(() => {
  store.canProceed = true
})

function goToRisk() {
  router.push('/risk-check')
}
</script>
