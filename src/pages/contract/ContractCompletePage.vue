<template>
  <div class="max-w-screen min-h-screen mx-auto bg-yellow-50">
    <ContractCompleteHeader />

    <div class="flex gap-6 px-16 py-8">
      <ContractPreviewBox />
      <ContractSidePanel :contractId="contractId" />
    </div>
  </div>
</template>

<script setup>
import ContractCompleteHeader from '@/components/contract/complete/ContractCompleteHeader.vue'
import ContractPreviewBox from '@/components/contract/complete/ContractPreviewBox.vue'
</script>
