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
      <!-- 이미지 -->
      <img :src="houseInfo.imageUrl" alt="매물 이미지" class="w-20 h-20 rounded-xl object-cover" />
      <div>
        <div class="text-xl font-semibold">{{ houseInfo?.addr1 }}</div>
        <div class="text-gray-500">{{ houseInfo?.addr2 }}</div>
        <!-- 매물 종류 및 가격 정보 -->
        <div class="text-orange-500 font-semibold">
          {{ houseInfo?.residenceType }}
          &nbsp;|&nbsp;
          <!-- 전세일 경우: 보증금만 -->
          <template v-if="houseInfo?.residenceType === 'JEONSE'">
            보증금 {{ formatPrice(houseInfo.depositPrice) }}
          </template>
          <!-- 월세일 경우: 보증금 + 월세 -->
          <template v-else-if="houseInfo?.residenceType === 'WOLSE'">
            보증금 {{ formatPrice(houseInfo.depositPrice) }} / 월세
            {{ formatPrice(houseInfo.monthlyRent) }}
          </template>
        </div>
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
          <div class="text-black font-bold text-base">사기위험도 등급</div>
        </div>
        <div class="text-right pr-4">
          <div class="text-black font-bold text-base">{{ dangerAnalysis?.riskType }}</div>
          <div class="text-black text-sm">{{ dangerAnalysis?.riskCheckedAt }} 분석</div>
        </div>
      </div>
    </div>

    <!-- 계약 기본 정보 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow">
      <div class="text-lg font-bold mb-3">계약 기본 정보</div>
      <div class="grid grid-cols-2 gap-y-2">
        <div>
          입주 예정일: <span class="font-medium">{{ contractInfo?.expectedMoveInDate }}</span>
        </div>
        <div class="pl-8">
          계약 기간: <span class="font-medium">{{ contractInfo?.contractDuration }}</span>
        </div>
        <div>
          재계약 갱신 의사: <span class="font-medium">{{ contractInfo?.renewalIntent }}</span>
        </div>
      </div>
    </div>

    <!-- 전세 관련 정보 -->
    <div class="bg-gray-50 rounded-2xl p-5 shadow">
      <div class="text-lg font-bold mb-3">{{ jeonseInfo?.rentType }} 관련 정보</div>
      <div class="grid grid-cols-2 gap-y-2">
        <div>
          {{ jeonseInfo?.rentType }} 대출 계획:
          <span class="font-medium">{{ jeonseInfo?.loanPlan }}</span>
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
          입주 전 청소: <span class="font-medium">{{ lifeInfo?.interiorCleaningNeeded }}</span>
        </div>
        <div>
          벽걸이/TV/에어컨 설치:
          <span class="font-medium">{{ lifeInfo?.applianceInstallationPlan }}</span>
        </div>
        <!-- 반려동물 관련 정보 (localStorage의 hasPet이 true일 때만 표시) -->
        <div v-if="hasPet">
          <div class="pl-8">
            반려동물: <span class="font-medium">{{ lifeInfo?.hasPet }}</span>
          </div>
          <div>
            반려동물 종: <span class="font-medium">{{ lifeInfo?.petInfo }}</span>
          </div>
          <div class="pl-8">
            반려동물 수: <span class="font-medium">{{ lifeInfo?.petCount }}</span>
          </div>
        </div>
        <div>
          실내 흡연 계획: <span class="font-medium">{{ lifeInfo?.indoorSmokingPlan }}</span>
        </div>
        <div class="pl-8">
          중도 퇴거 가능성: <span class="font-medium">{{ lifeInfo?.earlyTerminationRisk }}</span>
        </div>
        <div>
          거주 외 목적 사용: <span class="font-medium">{{ lifeInfo?.nonresidentialUsePlan }}</span>
        </div>
        <div class="pl-8">
          요청 사항: <span class="font-medium">{{ lifeInfo?.requestToOwner }}</span>
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
        <div class="pl-8">
          관계: <span class="font-medium">{{ lifeInfo?.relation }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'

const route = useRoute()
const contractChatId = route.params.id

// 로컬스토리지에서 가져오기
const hasPet = localStorage.getItem('hasPet') === 'true'

// 몽고 DB로 보내기
const saveMongoDB = async () => {
  try {
    await buyerApi.saveMongoDB(contractChatId)
  } catch (error) {
    console.error('몽고 DB로 보내기 실패 ❌', error)
  }
}

// api에서 가져오기
onMounted(async () => {
  try {
    const { data } = await buyerApi.selectTenantPreCon(contractChatId)

    // 1. 매물 정보
    houseInfo.value = {
      addr1: data.addr1,
      addr2: data.addr2,
      residenceType: data.residenceType,
      depositPrice: data.depositPrice,
      monthlyRent: data.monthlyRent,
      imageUrl: data.imageUrl,
    }

    // 2. 사기 위험도 분석
    dangerAnalysis.value = {
      riskType: data.riskType,
      riskCheckedAt: data.riskCheckedAt,
    }

    // 3. 계약 기본 정보
    contractInfo.value = {
      expectedMoveInDate: data.expectedMoveInDate,
      contractDuration: data.contractDuration,
      renewalIntent: data.renewalIntent,
    }

    // 4. 전세/월세 정보
    jeonseInfo.value = {
      rentType: data.rentType,
      loanPlan: data.loanPlan,
      insurancePlan: data.insurancePlan,
    }

    // 5. 생활 정보
    lifeInfo.value = {
      facilityRepairNeeded: data.facilityRepairNeeded,
      interiorCleaningNeeded: data.interiorCleaningNeeded,
      applianceInstallationPlan: data.applianceInstallationPlan,
      hasPet: data.hasPet,
      petInfo: data.petInfo,
      petCount: data.petCount,
      indoorSmokingPlan: data.indoorSmokingPlan,
      earlyTerminationRisk: data.earlyTerminationRisk,
      nonresidentialUsePlan: data.nonresidentialUsePlan,
      requestToOwner: data.requestToOwner,
      residentCount: data.residentCount,
      occupation: data.occupation,
      emergencyContact: data.emergencyContact,
      relation: data.relation,
    }
  } catch (err) {
    console.error('전체 정보 조회 실패 ❌', error)
  }
})

// 데이터 변수들
const houseInfo = ref({
  addr1: '',
  addr2: '',
  residenceType: '',
  depositPrice: '',
  monthlyRent: '', // 위,아래 둘 중 하나가 되야함?
  imageUrl: '',
})

const dangerAnalysis = ref({
  riskType: '',
  riskCheckedAt: null, // LocalDateTime
})

const contractInfo = ref({
  expectedMoveInDate: null, // LocalDate
  contractDuration: '', // enum 문자열: YEAR_1, YEAR_2, YEAR_OVER_2
  renewalIntent: '', // YES, NO, UNDECIDED
})

const jeonseInfo = ref({
  // 전월세니까 확인하기
  rentType: '', // 땡땡 관련 정보 이런식으로 해야할듯               // JEONSE / WOLSE
  loanPlan: null, // Boolean
  insurancePlan: null, // Boolean
})

const lifeInfo = ref({
  facilityRepairNeeded: null, // Boolean
  interiorCleaningNeeded: null, // Boolean
  applianceInstallationPlan: null, // Boolean
  hasPet: null, // Boolean
  petInfo: '',
  petCount: null, // Long
  indoorSmokingPlan: null, // Boolean
  earlyTerminationRisk: null, // Boolean
  nonresidentialUsePlan: '', // BUSINESS, LODGING, NONE
  requestToOwner: '',
  residentCount: null, // Integer
  occupation: '',
  emergencyContact: '',
  relation: '',
})
</script>
