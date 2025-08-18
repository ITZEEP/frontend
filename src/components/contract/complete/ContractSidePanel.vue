<template>
  <div class="w-[600px] flex flex-col gap-4">
    <ContractDownloadPanel :contractId="contractId" :finalPdfUrl="finalPdfUrl" />
    <PostContractTodo />
  </div>
</template>

<script setup>
import ContractDownloadPanel from './ContractDownloadPanel.vue'
import PostContractTodo from './PostContractTodo.vue'

const props = defineProps({
  contractId: {
    type: String,
    required: true
  },
  finalPdfUrl: {
    type: String,
    default: null
  }
})
</script>
