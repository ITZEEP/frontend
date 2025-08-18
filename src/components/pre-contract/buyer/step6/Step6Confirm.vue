<template>
  <div class="flex flex-col gap-4">
    <!-- 안내문구 -->
    <div class="flex flex-col items-center justify-center gap-2 mt-6">
      <h1 class="text-gray-warm-700 font-bold text-xl">입력 내용 확인</h1>
      <p class="text-gray-500">각 항목을 확인하고 필요한 부분을 확인해주세요!</p>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-4xl mx-auto text-sm text-gray-700">
      <!-- 매물 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4 shadow">
        <div class="flex items-center gap-4">
          <img
            :src="houseInfo.imageUrl"
            alt="매물 이미지"
            class="w-20 h-20 rounded-lg object-cover"
          />
          <div class="flex flex-col">
            <div class="text-lg font-semibold">{{ houseInfo?.addr1 }}</div>
            <div class="text-gray-500">{{ houseInfo?.addr2 }}</div>
            <div class="text-orange-500 font-semibold mt-1">
              {{ houseInfo?.residenceType }} &nbsp;|&nbsp;
              <template v-if="jeonseInfo?.rentType === 'JEONSE'">
                보증금 {{ formatPrice(houseInfo.depositPrice) }}
              </template>
              <template v-else-if="jeonseInfo?.rentType === 'WOLSE'">
                보증금 {{ formatPrice(houseInfo.depositPrice) }} / 월세
                {{ formatPrice(houseInfo.monthlyRent) }}
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- 위험도 분석 -->
      <section
        class="bg-gray-50 rounded-xl px-6 py-4 shadow"
        :class="{
          'bg-green-50': translateValue(dangerAnalysis?.riskType, enums.riskType) === '안전',
          'bg-yellow-50': translateValue(dangerAnalysis?.riskType, enums.riskType) === '주의',
          'bg-red-50': translateValue(dangerAnalysis?.riskType, enums.riskType) === '위험',
        }"
      >
        <h2 class="font-semibold mb-3">위험도 분석</h2>
        <div
          class="flex justify-between items-center"
          :class="{
            'text-green-600': translateValue(dangerAnalysis?.riskType, enums.riskType) === '안전',
            'text-yellow-primary':
              translateValue(dangerAnalysis?.riskType, enums.riskType) === '주의',
            'text-red-500': translateValue(dangerAnalysis?.riskType, enums.riskType) === '위험',
          }"
        >
          <div class="flex items-center gap-2">
            <SecurityBasicIcon class="w-5 h-5" />
            <span class="font-semibold leading-none">
              {{ translateValue(dangerAnalysis?.riskType, enums.riskType) }}
            </span>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500">{{ dangerAnalysis?.riskCheckedAt }} 분석</div>
          </div>
        </div>
      </section>

      <!-- 계약 기본 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4 shadow">
        <h2 class="font-semibold mb-3">계약 기본 정보</h2>
        <div class="grid grid-cols-2 gap-y-2">
          <div>
            입주 예정일:
            <span class="text-gray-500">{{ contractInfo?.expectedMoveInDate }}</span>
          </div>
          <div>
            계약 기간:
            <span class="text-gray-500">{{
              translateValue(contractInfo?.contractDuration, enums.contractDuration)
            }}</span>
          </div>
          <div>
            재계약 갱신 의사:
            <span class="text-gray-500">{{
              translateValue(contractInfo?.renewalIntent, enums.renewalIntent)
            }}</span>
          </div>
        </div>
      </section>

      <!-- 전세/월세 관련 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4 shadow">
        <h2 class="font-semibold mb-3">
          {{ translateValue(jeonseInfo?.rentType, enums.rentType) }} 관련 정보
        </h2>
        <div class="grid grid-cols-2 gap-y-2">
          <div>
            {{ translateValue(jeonseInfo?.rentType, enums.rentType) }} 대출 계획:
            <span class="text-gray-500">{{
              translateValue(jeonseInfo?.loanPlan, enums.plan)
            }}</span>
          </div>
          <div>
            보증 보험 가입:
            <span class="text-gray-500">{{
              translateValue(jeonseInfo?.insurancePlan, enums.plan)
            }}</span>
          </div>
        </div>
      </section>

      <!-- 생활 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4 shadow">
        <h2 class="font-semibold mb-3">생활 정보</h2>
        <div class="grid grid-cols-2 gap-y-2">
          <div>
            주요 설비 보수:
            <span class="text-gray-500">{{
              translateValue(lifeInfo?.facilityRepairNeeded, enums.needed)
            }}</span>
          </div>
          <div>
            입주 전 청소:
            <span class="text-gray-500">{{
              translateValue(lifeInfo?.interiorCleaningNeeded, enums.needed)
            }}</span>
          </div>
          <div>
            벽걸이/TV/에어컨 설치:
            <span class="text-gray-500">{{
              translateValue(lifeInfo?.applianceInstallationPlan, enums.plan)
            }}</span>
          </div>
          <div>
            주차:
            <span class="text-gray-500">
              {{
                lifeInfo?.hasParking !== null
                  ? translateValue(lifeInfo?.hasParking, enums.plan)
                  : '-'
              }}
            </span>
          </div>
          <div>
            주차 대수:
            <span class="text-gray-500">{{ lifeInfo?.parkingCount ?? '-' }}</span>
          </div>
          <div>
            반려동물:
            <span class="text-gray-500">
              {{ lifeInfo?.hasPet !== null ? translateValue(lifeInfo?.hasPet, enums.plan) : '-' }}
            </span>
          </div>
          <div>
            반려동물 종:
            <span class="text-gray-500">{{ lifeInfo?.petInfo || '-' }}</span>
          </div>
          <div>
            반려동물 수:
            <span class="text-gray-500">{{ lifeInfo?.petCount ?? '-' }}</span>
          </div>
          <div>
            실내 흡연 계획:
            <span class="text-gray-500">{{
              translateValue(lifeInfo?.indoorSmokingPlan, enums.plan)
            }}</span>
          </div>
          <div>
            중도 퇴거 가능성:
            <span class="text-gray-500">{{
              translateValue(lifeInfo?.earlyTerminationRisk, enums.plan)
            }}</span>
          </div>
          <div>
            거주 외 목적 사용:
            <span class="text-gray-500">{{ lifeInfo?.nonresidentialUsePlan }}</span>
          </div>
          <div>
            요청 사항:
            <span class="text-gray-500">{{ lifeInfo?.requestToOwner || '-' }}</span>
          </div>
          <div>
            거주 인원:
            <span class="text-gray-500">{{ lifeInfo?.residentCount }}</span>
          </div>
          <div>
            직업:
            <span class="text-gray-500">{{ lifeInfo?.occupation }}</span>
          </div>
          <div>
            비상 연락처:
            <span class="text-gray-500">{{ lifeInfo?.emergencyContact }}</span>
          </div>
          <div>
            관계:
            <span class="text-gray-500">{{ lifeInfo?.relation }}</span>
          </div>
        </div>
      </section>
    </div>

    <LoadingToolTip
      :loading="isLoading"
      title="AI에게 사전조사 내용을 저장 중이에요"
      sub-message="사전조사 저장 중..."
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute, useRouter } from 'vue-router'
import { usePreContractStore } from '@/stores/preContract'
import LoadingToolTip from '@/components/common/LoadingToolTip.vue'
import SecurityBasicIcon from '@/assets/icons/SecurityBasicIcon.vue'

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.params.id
const router = useRouter()
const isLoading = ref(false)

// const saveMongoDB = async () => {
//   try {
//     await buyerApi.saveMongoDB(contractChatId)
//   } catch (error) {
//     console.error('몽고 DB로 보내기 실패 ❌', error)
//   }
// }

function translateValue(type, map) {
  return map[type] || type
}

const enums = {
  riskType: {
    SAFE: '안전',
    WARN: '주의',
    DANGER: '위험',
  },
  rentType: {
    JEONSE: '전세',
    WOLSE: '월세',
  },
  contractDuration: {
    YEAR_1: '1년',
    YEAR_2: '2년',
    YEAR_OVER_2: '2년 이상',
  },
  renewalIntent: {
    YES: '예',
    NO: '아니오',
    UNDECIDED: '미정',
  },
  nonresidentialUsePlan: {
    BUSINESS: '사업',
    LODGING: '숙박',
    NONE: '없음',
  },
  plan: {
    true: '계획 있음',
    false: '계획 없음',
  },
  needed: {
    true: '필요',
    false: '필요 없음',
  },
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
      hasParking: data.hasParking,
      parkingCount: data.parkingCount,
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
    console.error('전체 정보 조회 실패 ❌', err)
    console.error('전체 정보 조회 실패 ❌', err)
  }
})

function formatPrice(value) {
  if (typeof value !== 'number') return value
  return value.toLocaleString() + '원'
}

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
  hasParking: null,
  parkingCount: null,
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

const saveMongoDB = async () => {
  isLoading.value = true
  try {
    const res = await buyerApi.saveMongoDB(contractChatId)

    if (!res?.success) {
      alert(res?.message || '저장에 실패했습니다. 다시 시도해주세요!')
      return
    }

    await router.replace(`/contract/${contractChatId}`)
  } catch (err) {
    console.error('실패 ❌', err)
    alert(err?.response?.data?.message || '저장에 실패했습니다. 다시 시도해주세요!')
  } finally {
    isLoading.value = false
  }
}

watchEffect(() => {
  console.log('[triggerSubmit 등록] 6번 등록됨')
  store.setTriggerSubmit(6, saveMongoDB)
})

onMounted(() => {
  store.setCanProceed(true)
})
</script>
