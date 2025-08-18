<template>
  <div class="w-full">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-bold mb-4">최종 계약서</h2>
      
      <div v-if="props.pdfData" class="border rounded-lg">
        <iframe 
          :src="pdfUrl" 
          class="w-full h-[600px]"
          title="최종 계약서 PDF"
        />
      </div>
      
      <div v-else class="h-[600px] border border-gray-300 rounded-lg flex items-center justify-center">
        <div class="text-center text-gray-500">
          <p>최종 계약서를 불러오는 중...</p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { sendContractEmail } from '@/apis/contractChatApi'

const props = defineProps({
  pdfData: {
    type: [String, ArrayBuffer, Uint8Array],
    default: null
  },
  contractChatId: {
    type: [String, Number],
    default: null
  }
})

const pdfUrl = ref('')

// pdfData가 변경될 때 URL 생성
watch(() => props.pdfData, (newData) => {
  if (newData) {
    if (typeof newData === 'string') {
      // URL이거나 base64 data URL인 경우
      pdfUrl.value = newData
    } else if (newData instanceof ArrayBuffer || newData instanceof Uint8Array) {
      // ArrayBuffer를 Blob URL로 변환
      const blob = new Blob([newData], { type: 'application/pdf' })
      pdfUrl.value = URL.createObjectURL(blob)
    } else {
      // 테스트 URL 또는 기타
      pdfUrl.value = newData
    }
  }
}, { immediate: true })

</script>
