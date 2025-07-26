<template>
  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">기본 정보 (수정 불가)</h2>
    <div class="grid grid-cols-2 gap-4">
      <BaseInput label="건물 종류" :modelValue="basicInfo?.buildingType || ''" disabled />
      <BaseInput label="등록일" :modelValue="basicInfo?.registrationDate || ''" disabled />
      <BaseInput label="전체 주소" :modelValue="basicInfo?.fullAddress || ''" disabled />
      <BaseInput label="전용면적(㎡)" :modelValue="basicInfo?.exclusiveArea || ''" disabled />
      <BaseInput label="공급면적(㎡)" :modelValue="basicInfo?.supplyArea || ''" disabled />
      <BaseInput label="현재층/전체층수" :modelValue="basicInfo?.floorInfo || ''" disabled />
      <BaseInput label="사용승인일" :modelValue="basicInfo?.approvalDate || ''" disabled />
      <BaseInput label="건축물용도" :modelValue="basicInfo?.buildingUsage || ''" disabled />
      <BaseInput label="건물형태" :modelValue="basicInfo?.buildingStructure || ''" disabled />
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/common/BaseInput.vue'

defineProps({
  basicInfo: {
    type: Object,
    default: () => ({}),
  },
})
</script>
