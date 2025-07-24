<template>
  <div class="bg-gray-50 p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">기본 정보 (수정 불가)</h2>
    <div class="grid grid-cols-2 gap-4">
      <BaseInput label="건물 종류" :modelValue="'오피스텔'" disabled />
      <BaseInput label="등록일" :modelValue="'2024-07-24'" disabled />
      <BaseInput label="전체 주소" :modelValue="'서울 강남구 테헤란로 123'" disabled />
      <BaseInput label="전용면적(㎡)" :modelValue="'33.0㎡'" disabled />
      <BaseInput label="공급면적(㎡)" :modelValue="'40.0㎡'" disabled />
      <BaseInput label="현재층/전체층수" :modelValue="'10층/15층'" disabled />
      <BaseInput label="사용승인일" :modelValue="'2018년'" disabled />
      <BaseInput label="건축물용도" :modelValue="'업무시설'" disabled />
      <BaseInput label="건물형태" :modelValue="'철근콘크리트구조'" disabled />
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
</script>
