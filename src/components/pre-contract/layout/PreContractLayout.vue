<template>
  <div class="-mx-16 -my-5 w-screen min-h-screen bg-yellow-50">
    <PreContractHeader />
  </div>
</template>

<script setup>
import PreContractHeader from './PreContractHeader.vue'

defineProps({
  currentStep: Number,
  role: String,
})
</script>

<style scoped></style>
