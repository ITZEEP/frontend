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

    <!-- 반려동물 여부 -->
    <ToggleRadio
      v-model="hasPet"
      label="반려동물이 있으신가요?"
      :options="[
        { label: '예', value: true },
        { label: '아니요', value: false },
      ]"
    />

    <!-- 반려동물 정보 (조건부) -->
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
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { usePreContractStore } from '@/stores/preContract'

const store = usePreContractStore()

// 상태값
const facilityRepairNeeded = ref(null)
const interiorCleaningNeeded = ref(null)
const applianceInstallationPlan = ref(null)
const hasPet = ref(null)
const petInfo = ref('')
const petCount = ref('')

watch(
  [
    facilityRepairNeeded,
    interiorCleaningNeeded,
    applianceInstallationPlan,
    hasPet,
    petInfo,
    petCount,
  ],
  ([repair, clean, installation, hasP, infoP, countP]) => {
    const allFilled =
      repair !== null &&
      clean !== null &&
      installation !== null &&
      hasP !== null &&
      infoP !== '' &&
      countP !== ''
    store.setCanProceed(allFilled)
  },
)

onMounted(() => {
  store.canProceed = false
})
</script>
