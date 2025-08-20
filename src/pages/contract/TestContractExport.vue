<template>
  <!-- 모바일 차단 -->
  <MobileNotSupported v-if="isMobile" />
  
  <!-- 데스크톱 컨텐츠 -->
  <div v-else class="p-8">
    <h1 class="text-2xl font-bold mb-6">계약서 내보내기 테스트</h1>
    
    <div class="space-y-4">
      <!-- 테스트용 계약 채팅 ID 입력 -->
      <div>
        <label class="block mb-2">Contract Chat ID:</label>
        <input 
          v-model="contractChatId" 
          type="text" 
          class="px-4 py-2 border rounded"
          placeholder="계약 채팅 ID 입력"
        >
      </div>

      <!-- 계약서 미리보기 버튼 -->
      <button 
        @click="showPreview"
        class="px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        계약서 미리보기
      </button>

      <!-- 계약서 내보내기 시작 버튼 -->
      <button 
        @click="startExport"
        class="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        계약서 다운로드 (기존 방식)
      </button>

      <!-- 완전한 플로우 테스트 -->
      <button 
        @click="goToCompletePage"
        class="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
      >
        계약서 완료 페이지로 이동
      </button>
    </div>

    <!-- API 테스트 결과 -->
    <div v-if="testResult" class="mt-6 p-4 bg-gray-100 rounded">
      <h3 class="font-bold mb-2">테스트 결과:</h3>
      <pre>{{ testResult }}</pre>
    </div>

    <!-- PDF 미리보기 모달 -->
    <teleport to="body">
      <div v-if="isPreviewVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <ContractExportPreview
          :contract-chat-id="contractChatId"
          :visible="isPreviewVisible"
          :preview-only="true"
          @close="closePreview"
        />
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { startContractExport } from '@/apis/contractChatApi'
import ContractExportPreview from '@/components/contract/export/ContractExportPreview.vue'
import MobileNotSupported from '@/components/common/MobileNotSupported.vue'

const router = useRouter()
const contractChatId = ref('1') // 테스트용 기본값
const testResult = ref(null)
const isPreviewVisible = ref(false)

// 모바일 체크
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 계약서 내보내기 API 테스트
const startExport = async () => {
  try {
    console.log('계약서 내보내기 시작...', contractChatId.value)
    const response = await startContractExport(contractChatId.value)
    
    if (response) {
      testResult.value = '✅ PDF 생성 성공! 크기: ' + response.byteLength + ' bytes'
      
      // PDF 다운로드 테스트
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `test_contract_${contractChatId.value}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      testResult.value = '❌ PDF 생성 실패'
    }
  } catch (error) {
    testResult.value = '❌ 오류: ' + error.message
    console.error('테스트 실패:', error)
  }
}

// 미리보기 표시
const showPreview = () => {
  if (!contractChatId.value) {
    alert('Contract Chat ID를 입력하세요')
    return
  }
  isPreviewVisible.value = true
  testResult.value = '📄 PDF 미리보기를 열었습니다'
}

// 미리보기 닫기
const closePreview = () => {
  isPreviewVisible.value = false
  testResult.value = '미리보기를 닫았습니다'
}


// 완료 페이지로 이동
const goToCompletePage = () => {
  if (!contractChatId.value) {
    alert('Contract Chat ID를 입력하세요')
    return
  }
  router.push(`/contract/complete/${contractChatId.value}`)
}
</script>