<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">거주 조건 설정</h1>
      <p class="text-gray-500">납부 및 입주 관련 상세 조건을 설정해주세요.</p>
    </div>

    <component :is="subStep === 1 ? SubStep1CommonForm : SubStep2TypeForm" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import SubStep1CommonForm from './SubStep1CommonForm.vue'
import SubStep2TypeForm from './SubStep2TypeForm.vue'

defineProps({ subStep: Number })
</script>
