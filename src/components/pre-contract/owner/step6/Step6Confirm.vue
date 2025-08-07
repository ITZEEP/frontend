<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col items-center justify-center gap-8 w-full">
      <!-- 안내문구 -->
      <div class="flex flex-col items-center justify-center gap-2">
        <h1 class="text-gray-warm-700 font-bold text-xl">입력 내용 확인</h1>
        <p class="text-gray-500">각 항목을 확인하고 필요한 부분을 수정하세요.</p>
      </div>
    </div>

    <div class="flex flex-col gap-4 w-full max-w-3xl mx-auto text-sm text-gray-700">
      <!-- 계약 기본 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">계약 기본 정보</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">
            전세대출 여부:
            <span class="text-gray-500">
              {{ summary.contractStep1?.mortgaged ? '예' : '아니오' }}
            </span>
          </div>
          <div class="w-1/2">
            계약 기간:
            <span class="text-gray-500">
              {{ getDurationLabel(summary.contractStep1?.contractDuration) }}
            </span>
          </div>
          <div class="w-1/2">
            재계약 의사:
            <span class="text-gray-500">
              {{ getRenewalLabel(summary.contractStep1?.renewalIntent) }}
            </span>
          </div>
          <div class="w-1/2">
            수리 책임:
            <span class="text-gray-500">
              {{ getRepairLabel(summary.contractStep1?.responseRepairingFixtures) }}
            </span>
          </div>
          <div class="w-1/2">
            미납 세금 여부:
            <span class="text-gray-500">
              {{ summary.contractStep1?.hasTaxArrears ? '예' : '아니오' }}
            </span>
          </div>
          <div class="w-1/2">
            미납 세금 금액:
            <span class="text-gray-500">
              {{ summary.contractStep1?.taxArrearsAmount?.toLocaleString() || 0 }} 원
            </span>
          </div>
          <div class="w-1/2">
            선순위 확정일자 여부:
            <span class="text-gray-500">
              {{ summary.contractStep1?.hasPriorFixedDate ? '예' : '아니오' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 특약 및 원상복구 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">특약 및 원상복구</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">
            입주 상태 기록:
            <span class="text-gray-500">
              {{ summary.contractStep2?.hasConditionLog ? '예' : '아니오' }}
            </span>
          </div>
          <div class="w-1/2">
            위약금 조항:
            <span class="text-gray-500">
              {{ summary.contractStep2?.hasPenalty ? '있음' : '없음' }}
            </span>
          </div>
          <div class="w-1/2">
            계약갱신 우선권:
            <span class="text-gray-500">
              {{ summary.contractStep2?.hasPriorityForExtension ? '있음' : '없음' }}
            </span>
          </div>
          <div class="w-1/2">
            자동 임대료 조정:
            <span class="text-gray-500">
              {{ summary.contractStep2?.hasAutoPriceAdjustment ? '있음' : '없음' }}
            </span>
          </div>

          <!-- JEONSE인 경우만 표시 -->
          <div class="w-1/2" v-if="rentType === 'JEONSE'">
            전세권 설정 허용:
            <span class="text-gray-500">
              {{ summary.contractStep2?.allowJeonseRightRegistration ? '허용' : '불허' }}
            </span>
          </div>

          <!-- 공통 -->
          <div class="w-full">
            원상복구 범위:
            <span class="text-gray-500">
              {{ summary.contractStep2?.restoreCategories?.join(', ') || '없음' }}
            </span>
          </div>
        </div>
      </section>

      <!-- 생활 정보 -->
      <section class="bg-gray-50 rounded-xl px-6 py-4">
        <h2 class="font-semibold mb-2">생활 정보</h2>
        <div class="flex flex-wrap gap-y-2">
          <div class="w-1/2">
            보증 보험:
            <span class="text-gray-500">
              {{ summary.livingStep1?.requireRentGuaranteeInsurance ? '예' : '아니오' }}
            </span>
          </div>
          <div class="w-1/2">
            보험료 부담 주체:
            <span class="text-gray-500">
              {{ getBurdenLabel(summary.livingStep1?.insuranceBurden) }}
            </span>
          </div>
          <div class="w-1/2">
            사전 고지 조항:
            <span class="text-gray-500">
              {{ summary.livingStep1?.hasNotice === 'YES' ? '있음' : '없음' }}
            </span>
          </div>
          <div class="w-1/2">
            임대인 계좌:
            <span class="text-gray-500">
              {{ summary.livingStep1?.ownerBankName }} /
              {{ summary.livingStep1?.ownerAccountNumber }}
            </span>
          </div>

          <!-- WOLSE인 경우만 표시 -->
          <div class="w-1/2" v-if="rentType === 'WOLSE'">
            납부일:
            <span class="text-gray-500">
              매월 {{ summary.livingStep1?.paymentDueDate || '-' }}일
            </span>
          </div>
          <div class="w-1/2" v-if="rentType === 'WOLSE'">
            연체이자율:
            <span class="text-gray-500">
              {{ summary.livingStep1?.lateFeeInterestRate ?? '-' }}%
            </span>
          </div>
        </div>
      </section>
    </div>
    <LoadingOverlay
      :loading="isLoading"
      message="계약서 저장 중..."
      sub-message="잠시만 기다려주세요"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import { usePreContractStore } from '@/stores/preContract'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'

const store = usePreContractStore()
const route = useRoute()
const router = useRouter()
const contractChatId = route.query.id || route.params.id
const rentType = localStorage.getItem('rent_type') // 'JEONSE' 또는 'WOLSE'

const summary = ref({
  contractStep1: null,
  contractStep2: null,
  livingStep1: null,
  contractDocument: null,
})

const isLoading = ref(false)

const saveMongo = async () => {
  isLoading.value = true
  try {
    const res = await OwnerPreContractAPI.saveMongoDB(contractChatId)
    if (!res.success) {
      console.warn('Mongo 저장 실패:', res)
      alert('저장에 실패했습니다. 다시 시도해주세요!')
      return
    }

    const id = contractChatId
    if (id) {
      router.push(`/contract/${id}`)
    }
  } catch (error) {
    console.error('Mongo 저장 중 오류:', error)
    alert('저장에 실패했습니다. 다시 시도해주세요!')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await OwnerPreContractAPI.getOwnerContractSummary(contractChatId)
    if (res.success) {
      summary.value = res.data
    } else {
      console.warn('요약 정보 불러오기 실패:', res)
    }
  } catch (err) {
    console.error('요약 정보 조회 실패', err)
  }
})

const getDurationLabel = (val) => {
  if (val === 'YEAR_1') return '1년'
  if (val === 'YEAR_2') return '2년'
  if (val === 'YEAR_OVER_2') return '2년 이상'
  return '-'
}

const getRenewalLabel = (val) => {
  if (val === 'YES') return '있음'
  if (val === 'NO') return '없음'
  if (val === 'UNDECIDED') return '미정'
  return '-'
}

const getRepairLabel = (val) => {
  if (val === 'OWNER') return '임대인'
  if (val === 'TENANT') return '임차인'
  return '-'
}

const getBurdenLabel = (val) => {
  if (val === 'OWNER') return '임대인'
  if (val === 'BUYER') return '임차인'
  if (val === 'PARTIAL') return '일부 부담'
  return '-'
}

watchEffect(() => {
  store.setTriggerSubmit(6, saveMongo)
})
</script>
