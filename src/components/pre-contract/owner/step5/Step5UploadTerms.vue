<template>
  <div class="flex flex-col items-center justify-center gap-8 w-full">
    <!-- 안내문구 -->
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">특약 사항 업로드</h1>
      <p class="text-gray-500">미리 작성된 계약서를 업로드하여 기존 특약을 추가하세요.</p>
    </div>

    <!-- 특약 안내 설명 -->
    <div class="w-full max-w-xl rounded-lg text-sm text-gray-600 space-y-2">
      <p class="font-semibold text-gray-700">📄 특약사항</p>
      <ul class="pst-disc pst-inside space-y-1">
        <p>특약사항은 무엇인가요? (PDF 계약서 업로드 또는 직접 입력)</p>
        <p>→ 업로드하신 계약서에서 특약 내용을 자동으로 인식하여 화면에 표시해 드립니다.</p>
        <p>→ 인식되지 않을 경우, 표준계약서가 아니거나 읽을 수 없는 파일일 수 있습니다.</p>
      </ul>
    </div>

    <!-- 파일 업로드 컴포넌트 -->
    <UploadContractBox v-model="uploadedFile" />

    <!-- ocr 추출하기 버튼 -->
    <BaseButton :disabled="isButtonDisabled" variant="primary">특약 내용 추출하기</BaseButton>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import UploadContractBox from './UploadContractBox.vue'

const uploadedFile = ref(null)

const isButtonDisabled = computed(() => !uploadedFile.value)
</script>
