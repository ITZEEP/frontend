<template>
  <div class="white-box">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">계약서 관리</h2>

    <div class="flex flex-col gap-3">
      <DownloadItem
        icon="pdf"
        title="PDF 다운로드"
        description="계약서를 PDF로 저장"
        @click="handleDownload"
      />
      <DownloadItem
        icon="print"
        title="인쇄하기"
        description="계약서를 인쇄"
        @click="handlePrint"
      />
      <DownloadItem
        icon="email"
        title="이메일 전송"
        description="계약서를 이메일로 전송"
        @click="handleEmail"
      />
    </div>

    <BaseButton class="mt-6 w-full" variant="primary" size="lg" @click="handleSign">
      🖋 전자서명 요청
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import DownloadItem from './DownloadItem.vue'

const handleDownload = () => {
  console.log('PDF 다운로드')
}

const handlePrint = () => {
  console.log('인쇄하기')
}

const handleEmail = () => {
  console.log('이메일 전송')
}

const handleSign = () => {
  console.log('전자서명 요청')
}
</script>
