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

    <!-- 주차 필요 여부 -->
    <ToggleRadio
      v-if="storeHasParking"
      v-model="hasParking"
      label="주차가 필요하신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 주차 필요 대수 -->
    <div v-if="hasParking === true" class="space-y-4">
      <BaseInput
        v-model="parkingCount"
        type="number"
        label="필요한 주차 대수를 입력해주세요"
        min="0"
        class="w-full"
        @input="onParkingCountInput"
      />
    </div>

    <!-- 반려동물 여부 -->
    <ToggleRadio
      v-model="hasPet"
      label="반려동물이 있으신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 반려동물 종 -->
    <div v-if="hasPet === true" class="space-y-4">
      <BaseInput
        v-model="petInfo"
        placeholder="반려동물 종류를 입력해주세요 (예: 강아지)"
        class="w-full"
      />
      <BaseInput
        v-model="petCount"
        type="number"
        placeholder="반려동물 수를 입력해주세요"
        class="w-full"
        @input="onPetCountInput"
      />
    </div>
  </div>
  <BaseButton @click="updateTenantStep2"> 테스트 버튼 </BaseButton>
</template>

<script setup>
import { ref, watch, onMounted, computed, watchEffect } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { usePreContractStore } from '@/stores/preContract'
import buyerApi from '@/apis/pre-contract-buyer.js'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const store = usePreContractStore()

const storeHasParking = computed(() => store.hasParking)

const route = useRoute()
const contractChatId = route.params.id

onMounted(async () => {
  store.canProceed = false
  try {
    const { data } = await buyerApi.selectTenantStep2(contractChatId)
    facilityRepairNeeded.value = data.facilityRepairNeeded
    interiorCleaningNeeded.value = data.interiorCleaningNeeded
    applianceInstallationPlan.value = data.applianceInstallationPlan
    hasParking.value = data.hasParking
    parkingCount.value = data.parkingCount
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
const hasParking = ref(null)
const parkingCount = ref(null)
const hasPet = ref(null)
const petInfo = ref('')
const petCount = ref(null)

const onParkingCountInput = (e) => {
  const value = Number(e.target.value)
  parkingCount.value = value < 0 ? 0 : value
}

const onPetCountInput = (e) => {
  const value = Number(e.target.value)
  petCount.value = value < 0 ? 0 : value
}

watch(
  [
    facilityRepairNeeded,
    interiorCleaningNeeded,
    applianceInstallationPlan,
    hasParking,
    parkingCount,
    hasPet,
    petInfo,
    petCount,
  ],
  ([repair, clean, install, parking, count, pet, info, pets]) => {
    const basicFilled =
      repair !== null &&
      clean !== null &&
      install !== null &&
      pet !== null &&
      info !== '' &&
      pets !== null &&
      Number(pets) >= 0

    const parkingFilled = parking === true ? count !== null && Number(count) >= 0 : true

    const allFilled = basicFilled && parkingFilled

    store.setCanProceed(allFilled)
  },
)

const updateTenantStep2 = async () => {
  const step2DTO = {
    facilityRepairNeeded: facilityRepairNeeded.value,
    interiorCleaningNeeded: interiorCleaningNeeded.value,
    applianceInstallationPlan: applianceInstallationPlan.value,
    hasParking: hasParking.value,
    parkingCount: parkingCount.value,
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

watchEffect(() => {
  store.setTriggerSubmit(5, 1, updateTenantStep2)
})
</script>
