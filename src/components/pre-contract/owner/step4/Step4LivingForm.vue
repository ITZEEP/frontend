<template>
  <div class="w-full space-y-6">
    <ToggleRadio
      label="보증보험 비용이 의무 사항인가요?"
      v-model="requireRentGuaranteeInsurance"
      :options="[
        { label: '예', value: true },
        { label: '아니오', value: false },
      ]"
    />

    <ToggleRadio
      label="보증보험 비용은 누가 부담하나요?"
      v-model="insuranceBurden"
      :options="[
        { label: '임대인', value: 'OWNER' },
        { label: '임차인', value: 'BUYER' },
        { label: '일부 부담', value: 'PARTIAL' },
      ]"
    />

    <ToggleRadio
      label="공사 예정, 소음 등 고지해야 할 사항이 있나요?"
      v-model="hasNotice"
      :options="[
        { label: '있음', value: 'YES' },
        { label: '없음', value: 'NO' },
      ]"
    />

    <h2 class="text-gray-warm-700 font-bold">임차인이 납부할 계좌</h2>

    <div class="w-full flex flex-col gap-1">
      <p class="text-sm font-medium text-gray-600">은행명을 입력하세요.</p>
      <div class="w-40 flex gap-4">
        <BaseInput v-model="ownerBankName" type="text" class="w-32" placeholder="예) 농협" />
      </div>
    </div>

    <div class="w-full flex flex-col gap-1">
      <p class="text-sm font-medium text-gray-600">계좌번호를 입력하세요.</p>
      <div class="w-72 flex gap-4">
        <BaseInput
          v-model="ownerAccountNumber"
          type="text"
          class="w-full"
          placeholder="숫자만 입력 (예: 12345678901234)"
        />
      </div>
    </div>

    <template v-if="rentType === 'WOLSE'">
      <div class="w-full flex flex-col gap-1">
        <p class="text-sm font-medium text-gray-600">월세 납부일</p>
        <div class="w-40 flex gap-4">
          <BaseInput v-model="paymentDueDate" type="number" placeholder="1 ~ 31일 사이 숫자" />
        </div>
      </div>

      <div class="w-full flex flex-col gap-2">
        <p class="text-sm font-medium text-gray-600">연체 시 이자율 (%) 입력하세요.</p>
        <div class="w-40 flex gap-4">
          <p class="flex justify-center items-end mb-2 text-sm text-gray-600">월</p>
          <BaseInput v-model="lateFeeInterestRate" type="number" class="w-32" />
          <p class="flex justify-center items-end mb-2 text-sm text-gray-600">%</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.query.id || route.params.id
const rentType = ref(localStorage.getItem('rent_type'))

// 상태 변수
const requireRentGuaranteeInsurance = ref(null)
const insuranceBurden = ref('')
const hasNotice = ref('')
const ownerBankName = ref('')
const ownerAccountNumber = ref('')
const paymentDueDate = ref(null)
const lateFeeInterestRate = ref(null)

const patchLivingStep = async () => {
  try {
    await OwnerPreContractAPI.updateLivingStep1(contractChatId, {
      hasNotice: hasNotice.value,
      insuranceBurden: insuranceBurden.value,
      lateFeeInterestRate: lateFeeInterestRate.value,
      ownerAccountNumber: ownerAccountNumber.value,
      ownerBankName: ownerBankName.value,
      paymentDueDate: paymentDueDate.value,
      requireRentGuaranteeInsurance: requireRentGuaranteeInsurance.value,
    })
  } catch (error) {
    console.log('거주 조건 스텝 업데이트 실패', error)
  }
}

watch(
  [
    requireRentGuaranteeInsurance,
    insuranceBurden,
    hasNotice,
    ownerBankName,
    ownerAccountNumber,
    paymentDueDate,
    lateFeeInterestRate,
    rentType,
  ],
  ([insurance, burden, notice, bank, account, dueDate, lateFee, type]) => {
    const commonValid =
      insurance !== null && burden !== '' && notice !== '' && bank !== '' && account !== ''

    const isValid =
      type === 'JEONSE' ? commonValid : commonValid && dueDate !== null && lateFee !== null

    store.setCanProceed(isValid)
  },
)

onMounted(async () => {
  try {
    const response = await OwnerPreContractAPI.getLivingStep1(contractChatId)
    const data = response.data

    requireRentGuaranteeInsurance.value = data.requireRentGuaranteeInsurance ?? null
    insuranceBurden.value = data.insuranceBurden ?? ''
    hasNotice.value = data.hasNotice ?? ''
    ownerBankName.value = data.ownerBankName ?? ''
    ownerAccountNumber.value = data.ownerAccountNumber ?? ''
    paymentDueDate.value = data.paymentDueDate ?? null
    lateFeeInterestRate.value = data.lateFeeInterestRate ?? null
  } catch (err) {
    console.error('거주 조건 Step1 조회 실패', err)
  }
})

watchEffect(() => {
  store.setTriggerSubmit(4, patchLivingStep)
})
</script>
