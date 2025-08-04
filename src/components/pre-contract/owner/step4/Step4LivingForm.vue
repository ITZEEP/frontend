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

    <template v-if="rentType === 'WOLSE'">
      <BaseInput
        v-model="paymentDueDate"
        label="월세 납부일"
        type="number"
        placeholder="1 ~ 31일 사이의 숫자를 입력하세요"
      />

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
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.query.id || route.params.id
const rentType = ref(localStorage.getItem('rent_type'))

// 상태 변수 정의
const requireRentGuaranteeInsurance = ref(null)
const insuranceBurden = ref('')
const hasNotice = ref('')
const paymentDueDate = ref(null)
const lateFeeInterestRate = ref(null)

watch(
  [
    requireRentGuaranteeInsurance,
    insuranceBurden,
    hasNotice,
    paymentDueDate,
    lateFeeInterestRate,
    rentType,
  ],
  ([insurance, burden, notice, dueDate, lateFee, type]) => {
    const commonValid = insurance !== null && burden !== '' && notice !== ''

    const isValid =
      type === 'JEONSE' ? commonValid : commonValid && dueDate !== null && lateFee !== null

    store.setCanProceed(isValid)
  },
)

onMounted(async () => {
  try {
    const data = await OwnerPreContractAPI.getLivingStep1(contractChatId)

    requireRentGuaranteeInsurance.value = data.requireRentGuaranteeInsurance ?? null
    insuranceBurden.value = data.insuranceBurden ?? ''
    hasNotice.value = data.hasNotice ?? ''
    paymentDueDate.value = data.paymentDueDate ?? null
    lateFeeInterestRate.value = data.lateFeeInterestRate ?? null
  } catch (err) {
    console.error('거주 조건 Step1 조회 실패', err)
  }
})
</script>
