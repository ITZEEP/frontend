<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-col gap-2">
      <h2 class="text-gray-warm-700 font-bold">계약 조건 확인</h2>
      <ToggleRadio
        label="해당 매물에 근저당이 설정되어 있나요?"
        v-model="isMortgaged"
        :options="[
          { label: '예', value: true },
          { label: '아니오', value: false },
        ]"
      />
      <ToggleRadio
        label="원하는 계약 기간은 어떻게 되시나요?"
        v-model="contractDuration"
        :options="[
          { label: '1년', value: 'YEAR_1' },
          { label: '2년', value: 'YEAR_2' },
          { label: '2년 이상', value: 'YEAR_OVER_2' },
        ]"
      />
      <ToggleRadio
        label="재계약(갱신) 의사가 있으신가요?"
        v-model="renewalIntent"
        :options="[
          { label: '있음', value: 'YES' },
          { label: '없음', value: 'NO' },
          { label: '미정', value: 'UNDECIDED' },
        ]"
      />
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="text-gray-warm-700 font-bold">옵션 및 비품 관리</h2>
      <ToggleRadio
        label="비품 수리 책임은 누구에게 있나요?"
        v-model="repairingFixtures"
        :options="[
          { label: '임대인', value: 'OWNER' },
          { label: '임차인', value: 'TENANT' },
        ]"
      />
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="text-gray-warm-700 font-bold">권리 및 납세 확인</h2>
      <ToggleRadio
        label="미납된 국세･지방세가 존재하나요?"
        v-model="hasTaxArrears"
        :options="[
          { label: '있음', value: true },
          { label: '없음', value: false },
        ]"
      />

      <div v-if="hasTaxArrears === true" class="w-full flex flex-col gap-2">
        <p class="text-sm font-medium text-gray-600">미납 국세 지방세의 금액을 입력하세요.</p>
        <div class="w-40 flex gap-4">
          <BaseInput v-model="taxArrearsAmount" type="number" class="w-32" />
          <p class="w-10 flex justify-center items-end mb-2 text-sm text-gray-600">만 원</p>
        </div>
      </div>

      <ToggleRadio
        label="선순위 확정일자가 존재하나요?"
        v-model="hasPriorFixedDate"
        :options="[
          { label: '해당 없음', value: true },
          { label: '해당 있음', value: false },
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, watchEffect } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'
import { useRoute } from 'vue-router'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import BaseInput from '@/components/common/BaseInput.vue'

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.params.id

const isMortgaged = ref('')
const contractDuration = ref('')
const renewalIntent = ref('')
const repairingFixtures = ref('')
const hasTaxArrears = ref('')
const taxArrearsAmount = ref(0)
const hasPriorFixedDate = ref('')

const isInitialized = ref(false)

const fetchContractStep1 = async () => {
  try {
    const response = await OwnerPreContractAPI.getContractStep1(contractChatId)
    const data = response.data

    isMortgaged.value = data.mortgaged
    contractDuration.value = data.contractDuration
    renewalIntent.value = data.renewalIntent
    repairingFixtures.value = data.responseRepairingFixtures
    hasTaxArrears.value = data.hasTaxArrears
    taxArrearsAmount.value = data.taxArrearsAmount
    hasPriorFixedDate.value = data.hasPriorFixedDate
  } catch (error) {
    console.log('계약 조건 기본값 로딩 실패', error)
  }
}

const patchContractStep1 = async () => {
  try {
    await OwnerPreContractAPI.updateContractStep1(contractChatId, {
      mortgaged: isMortgaged.value,
      contractDuration: contractDuration.value,
      renewalIntent: renewalIntent.value,
      responseRepairingFixtures: repairingFixtures.value,
      hasTaxArrears: hasTaxArrears.value,
      taxArrearsAmount: taxArrearsAmount.value,
      hasPriorFixedDate: hasPriorFixedDate.value,
    })
  } catch (error) {
    console.log('계약 조건 Step1 업데이트 실패', error)
  }
}

// 모든 값 입력되어 있는지 확인
watch(
  [isMortgaged, contractDuration, renewalIntent, repairingFixtures],
  ([mort, dur, renew, fix]) => {
    const allFilled = mort !== null && dur !== '' && renew !== '' && fix !== ''
    store.setCanProceed(allFilled)
  },
)

onMounted(() => {
  if (!isInitialized.value) {
    store.setCanProceed(false)
    fetchContractStep1()
    isInitialized.value = true
  }
})

watchEffect(() => {
  store.setTriggerSubmit(3, 1, patchContractStep1)
})
</script>
