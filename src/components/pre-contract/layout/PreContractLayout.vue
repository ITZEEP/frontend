<template>
  <div class="-mx-layout-x -mt-layout-y -my-layout-y w-screen min-h-screen bg-yellow-50">
    <PreContractHeader />

    <div class="flex flex-col items-center justify-center px-4 py-10">
      <div class="w-full max-w-[640px]">
        <div class="bg-white rounded-xl shadow-md p-8 mt-4">
          <slot />
        </div>
      </div>
      <PreContractBtnGroup />
    </div>
  </div>
</template>

<script setup>
import PreContractHeader from '@/components/pre-contract/layout/PreContractHeader.vue'
import PreContractBtnGroup from './PreContractBtnGroup.vue'

defineProps({
  currentStep: Number,
  role: String,
})
</script>

<style scoped></style>
