<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">거주 조건 설정</h1>
      <p class="text-gray-500">납부 및 입주 관련 상세 조건을 설정해주세요.</p>
    </div>

    <Step4LivingForm v-model="livingForm" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePreContractStore } from '@/stores/preContract'
import { useRoute } from 'vue-router'
import Step4LivingForm from './Step4LivingForm.vue'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'

const route = useRoute()
const store = usePreContractStore()

// 쿼리 파라미터에서 id 추출
const contractChatId = route.query.id || route.params.id
const rentType = localStorage.getItem('rent_type')

const livingForm = ref({
  rentType,
  requireRentGuaranteeInsurance: null,
  insuranceBurden: '',
  hasNotice: '',
  paymentDueDate: null,
  lateFeeInterestRate: null,
})

watch(
  livingForm,
  () => {
    const values = Object.values(livingForm.value)
    const isValid = values.every((v) => v !== '' && v !== null)
    store.setCanProceed(isValid)
  },
  { deep: true },
)

onMounted(async () => {
  try {
    const data = await OwnerPreContractAPI.getLivingStep1(contractChatId)
    livingForm.value = {
      rentType,
      requireRentGuaranteeInsurance: data.requireRentGuaranteeInsurance ?? null,
      insuranceBurden: data.insuranceBurden ?? '',
      hasNotice: data.hasNotice ?? '',
      paymentDueDate: data.paymentDueDate ?? null,
      lateFeeInterestRate: data.lateFeeInterestRate ?? null,
    }
  } catch (err) {
    console.error('거주 조건 Step1 조회 실패', err)
  }
})
</script>
