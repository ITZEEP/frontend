<template>
  <div class="space-y-6">
    <h2 class="text-lg font-bold text-center">계약 기본 정보</h2>
    <p class="text-sm text-center text-gray-500">시설 관리 및 입주 준비 상태</p>

    <!-- 주요설비 보수 -->
    <ToggleRadio
      v-model="facilityRepairNeeded"
      label="주요설비 (보일러, 배관 등) 보수가 필요하신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 입주 전 도배/장판/청소 -->
    <ToggleRadio
      v-model="interiorCleaningNeeded"
      label="입주 전 도배, 장판, 청소가 필요하신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 벽걸이 TV, 에어컨 설치 계획 -->
    <ToggleRadio
      v-model="applianceInstallationPlan"
      label="벽걸이, TV, 에어컨 등 설치 계획이 있으신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />
  </div>
  <BaseButton @click="updateTenantStep2"> 테스트 버튼 </BaseButton>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const store = usePreContractStore()

const route = useRoute()
const contractChatId = route.params.id

onMounted(async () => {
  store.canProceed = false
  try {
    const { data } = await buyerApi.selectTenantStep2(contractChatId)
    facilityRepairNeeded.value = data.facilityRepairNeeded
    interiorCleaningNeeded.value = data.interiorCleaningNeeded
    applianceInstallationPlan.value = data.applianceInstallationPlan
    hasPet.value = data.hasPet
    petInfo.value = data.petInfo
    petCount.value = data.petCount
  } catch (error) {
    console.error('step2 조회 실패 ❌', error)
  }
})

// 상태값
const facilityRepairNeeded = ref(null)
const interiorCleaningNeeded = ref(null)
const applianceInstallationPlan = ref(null)
const hasPet = ref(null)
const petInfo = ref('')
const petCount = ref(null)

watch(
  [facilityRepairNeeded, interiorCleaningNeeded, applianceInstallationPlan],
  ([repair, clean, installation]) => {
    const allFilled = repair !== null && clean !== null && installation !== null
    store.setCanProceed(allFilled)
  },
)

const updateTenantStep2 = async () => {
  const step2DTO = {
    facilityRepairNeeded: facilityRepairNeeded.value,
    interiorCleaningNeeded: interiorCleaningNeeded.value,
    applianceInstallationPlan: applianceInstallationPlan.value,
    hasPet: hasPet.value,
    petInfo: petInfo.value,
    petCount: petCount.value,
  }

  try {
    await buyerApi.updateTenantStep2(contractChatId, step2DTO)
    alert('Step2 애완동물 가능 정보가 저장되었습니다! ✅')
  } catch (error) {
    console.error('step2 애완동물 가능 저장 실패 ❌', error)
  }
}
</script>
