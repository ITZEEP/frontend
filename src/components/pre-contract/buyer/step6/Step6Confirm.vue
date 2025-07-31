<template>
  <div class="space-y-4">
    <!-- 제목 영역 -->
    <div class="text-center mt-6 space-y-1">
      <h2 class="text-lg font-bold text-center">입력 내용 확인</h2>
      <p class="text-sm text-center text-gray-500">
        각 항목을 확인하고 필요한 부분을 확인해주세요!
      </p>
    </div>

    <!-- 매물 정보 -->
    <div class="flex items-center bg-gray-50 rounded-2xl p-5 shadow space-x-4">
      <PropertyImage class="w-20 h-20 rounded-xl object-cover" />
      <div>
        <div class="text-xl font-semibold">{{ houseInfo?.name }}</div>
        <div class="text-gray-500">{{ houseInfo?.address }}</div>
        <div class="text-orange-500 font-semibold">{{ houseInfo?.price }}</div>
      </div>
    </div>

    <!-- 위험도 분석 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow space-y-2">
      <div class="text-black font-bold text-lg">위험도 분석</div>
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <div
            class="bg-green-700 rounded-full w-6 h-6 flex items-center justify-center text-white text-lg"
          >
            🔰
          </div>
          <div class="text-black font-bold text-base">{{ dangerAnalysis?.grade }}</div>
        </div>
        <div class="text-right pr-4">
          <div class="text-black font-bold text-base">{{ dangerAnalysis?.status }}</div>
          <div class="text-black text-sm">{{ dangerAnalysis?.analyzedAt }} 분석</div>
        </div>
      </div>
    </div>

    <!-- 계약 기본 정보 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow">
      <div class="text-lg font-bold mb-3">계약 기본 정보</div>
      <div class="grid grid-cols-2 gap-y-2">
        <div>
          입주 예정일: <span class="font-medium">{{ contractInfo?.moveInDate }}</span>
        </div>
        <div class="pl-8">
          계약 기간: <span class="font-medium">{{ contractInfo?.contractPeriod }}</span>
        </div>
        <div>
          재계약 갱신 의사: <span class="font-medium">{{ contractInfo?.renewalIntent }}</span>
        </div>
      </div>
    </div>

    <!-- 전세 관련 정보 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow">
      <div class="text-lg font-bold mb-3">전세 관련 정보</div>
      <div class="grid grid-cols-2 gap-y-2">
        <div>
          전세 대출 계획: <span class="font-medium">{{ jeonseInfo?.loanPlan }}</span>
        </div>
        <div class="pl-8">
          보증 보험 가입: <span class="font-medium">{{ jeonseInfo?.insurancePlan }}</span>
        </div>
      </div>
    </div>

    <!-- 생활 정보 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow">
      <div class="text-lg font-bold mb-3">생활 정보</div>
      <div class="grid grid-cols-2 gap-y-3">
        <div>
          주요 설비 보수: <span class="font-medium">{{ lifeInfo?.facilityRepairNeeded }}</span>
        </div>
        <div class="pl-8">
          입주 전 청소: <span class="font-medium">{{ lifeInfo?.cleaningNeeded }}</span>
        </div>
        <div>
          벽걸이/TV/에어컨 설치:
          <span class="font-medium">{{ lifeInfo?.applianceInstallation }}</span>
        </div>
        <div class="pl-8">
          반려동물: <span class="font-medium">{{ lifeInfo?.petInfo }}</span>
        </div>
        <div>
          실내 흡연 계획: <span class="font-medium">{{ lifeInfo?.smokingPlan }}</span>
        </div>
        <div class="pl-8">
          중도 퇴거 가능성: <span class="font-medium">{{ lifeInfo?.earlyTermination }}</span>
        </div>
        <div>
          거주 외 목적 사용: <span class="font-medium">{{ lifeInfo?.nonResidentialUse }}</span>
        </div>
        <div class="pl-8">
          요청 사항: <span class="font-medium">{{ lifeInfo?.requests }}</span>
        </div>
        <div>
          거주 인원: <span class="font-medium">{{ lifeInfo?.residentCount }}</span>
        </div>
        <div class="pl-8">
          직업: <span class="font-medium">{{ lifeInfo?.occupation }}</span>
        </div>
        <div class="col-span-2">
          비상 연락처: <span class="font-medium">{{ lifeInfo?.emergencyContact }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 데이터 변수들
const houseInfo = ref(null)
const dangerAnalysis = ref(null)
const contractInfo = ref(null)
const jeonseInfo = ref(null)
const lifeInfo = ref(null)

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/contract/confirmation') // 예시 API URL

    houseInfo.value = data.houseInfo
    dangerAnalysis.value = data.dangerAnalysis
    contractInfo.value = data.contractInfo
    jeonseInfo.value = data.jeonseInfo
    lifeInfo.value = data.lifeInfo
  } catch (err) {
    console.error('데이터 불러오기 실패:', err)
  }
})
</script>
