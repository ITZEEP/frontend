<template>
  <div class="w-full flex flex-col items-center">
    <div class="max-w-[400px] w-full">
      <VuePdfEmbed :source="pdfUrl" :page="page" @loaded="handleLoaded" />
    </div>

    <div class="flex justify-center gap-4 mt-4">
      <button @click="page--" :disabled="page <= 1">이전</button>
      <span>{{ page }} / {{ pageCount }}</span>
      <button @click="page++" :disabled="page >= pageCount">다음</button>
    </div>
  </div>
</template>

<script setup>
import VuePdfEmbed from 'vue-pdf-embed'
import { ref } from 'vue'

const page = ref(1)
const pageCount = ref(0)
const pdfUrl = '/contract_example.pdf'

function handleLoaded(pdf) {
  pageCount.value = pdf.numPages
}
</script>
