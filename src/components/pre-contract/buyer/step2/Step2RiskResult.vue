<template>
  <div class="rounded-lg p-6">
    <!-- 타이틀 -->
    <h2 class="text-xl font-semibold text-center text-gray-800 mb-1">사기 위험도 분석 확인</h2>
    <p class="text-sm text-center text-gray-500 mb-5">선택하신 매물의 안전성을 확인해주세요</p>

    <!-- 상단 안전 등급 -->
    <div
      class="flex items-center bg-green-100 text-green-800 rounded-md px-4 py-3 mb-8 justify-between"
    >
      <div class="flex items-center space-x-3">
        <!-- 아이콘 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z"
          />
        </svg>
        <div>
          <p class="font-bold">안전 등급</p>
          <p class="text-sm">사기 위험도: 낮음</p>
        </div>
      </div>
      <div class="text-right text-green-700 font-semibold text-base">
        안전<br />
        <span class="text-xs text-gray-500">2025.01.14 분석</span>
      </div>
    </div>

    <!-- 정보 박스 -->
    <div class="flex gap-4 mb-10">
      <!-- 소유자 정보 박스 -->
      <div class="flex-1 bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-2">소유자 정보</p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>등기부등본 상 소유자와 임대인 일치</li>
          <li>실명 인증 완료</li>
          <li>신용도 검증 완료</li>
        </ul>
      </div>

      <!-- 매물 정보 박스 -->
      <div class="flex-1 bg-white rounded-xl p-6 shadow text-gray-800">
        <p class="text-base font-bold mb-2">매물 정보</p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>국토교통부 매물 정보와 일치</li>
          <li>권리침해 이력 없음</li>
          <li>시세 적정성 확인</li>
        </ul>
      </div>
    </div>

    <!-- 하단 보험 추천 -->
    <div class="bg-yellow-50 text-yellow-800 text-sm px-4 py-2 rounded-md border border-yellow-200">
      ✅ 추천 보장: 전세보증금 반환보증보험 (보증금의 90% 보장)
    </div>
  </div>
</template>

<script setup>
import { usePreContractStore } from '@/stores/preContract'
import { onMounted } from 'vue'
import fraudApi from '@/apis/fraud.js'
import BasicInfoForm from '@/components/homes/homeupdate/BasicInfoForm.vue'

const store = usePreContractStore()

onMounted(async () => {
  store.canProceed = true

  try {
    const { data } = await fraudApi.getTodayRiskCheckSummary(homeId)
    if (data.hasAnalysis == true) {
      riskType.value = data.summary.riskType

      // detailGroups 배열에서 각 title별로 분기
      data.summary.detailGroups.forEach((group) => {
        switch (group.title) {
          case '건축 관련':
            building.value = group.items[0].title
            break
          case '권리관계 정보':
            ownership.value = group.items[0].title
            break
          case '기본 정보':
            basic.value = group.items[0].title
            break
          case '법령 위험':
            legal.value = group.items[0].title
            break
        }
      })
    }
  } catch (error) {}
})
</script>
