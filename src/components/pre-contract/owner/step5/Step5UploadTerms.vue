<template>
  <div class="flex flex-col items-center justify-center gap-8 w-full">
    <!-- 안내문구 -->
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">계약서 업로드</h1>
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

    <!-- 파일 업로드 및 버튼 -->
    <div v-if="!isConfirmed" class="w-full flex flex-col items-center gap-4">
      <UploadContractBox v-model="uploadedFile" />
      <BaseButton :disabled="isButtonDisabled" variant="primary" @click="extractSpecialTerms">
        특약 내용 추출하기
      </BaseButton>
    </div>

    <!-- 확정된 특약 조항 목록 -->
    <div v-else class="w-full max-w-xl space-y-2 white-box">
      <p class="text-gray-700 font-semibold">확정된 특약사항</p>
      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
        <li v-for="(term, index) in confirmedTerms" :key="index">{{ term }}</li>
      </ul>
    </div>

    <LoadingOverlay :loading="isLoading" message="특약 내용 추출 중입니다" />

    <!-- 특약 확인 모달 -->
    <TermsConfirmModal :extractedTerms="extractedTerms" @confirm="handleConfirm" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import UploadContractBox from './UploadContractBox.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import TermsConfirmModal from './TermsConfirmModal.vue'
import { useModalStore } from '@/stores/modal'
import { usePreContractStore } from '@/stores/preContract'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'
import { useRoute } from 'vue-router'

const route = useRoute()
const uploadedFile = ref(null)
const isLoading = ref(false)
const extractedTerms = ref([])
const confirmedTerms = ref([])
const isConfirmed = ref(false)
const contractChatId = computed(() => String(route.query.id ?? route.params.id ?? ''))

const lastAnalyze = ref(null)

const modalStore = useModalStore()
const precontractStore = usePreContractStore()
const isButtonDisabled = computed(() => !uploadedFile.value)

const extractSpecialTerms = async () => {
  if (!uploadedFile.value) return

  isLoading.value = true
  try {
    const res = await OwnerPreContractAPI.postAnalyzeContract(
      contractChatId.value,
      uploadedFile.value,
    )

    lastAnalyze.value = res

    extractedTerms.value = res?.data?.data?.parsed_data?.special_terms ?? []

    if (!extractedTerms.value.length) {
      alert('추출된 특약이 없습니다. 파일을 확인해주세요.')
      modalStore.close()
      return
    }

    modalStore.open()
  } catch (e) {
    console.error('특약 분석 실패', e)
    alert('파일 분석 중 오류가 발생했습니다.')
    modalStore.close()
  } finally {
    isLoading.value = false
  }
}

const handleConfirm = (terms) => {
  confirmedTerms.value = [...terms]
  isConfirmed.value = true
  modalStore.close()
  precontractStore.setCanProceed(true)
}

const handleSaveContractMongo = async () => {
  try {
    const parsed = lastAnalyze.value?.data?.data?.parsed_data
    const meta = lastAnalyze.value?.data?.data

    const payload = {
      documentType: meta?.document_type ?? 'contract',
      extractedAt: parsed?.extracted_at ?? new Date().toISOString(),
      filename: meta?.filename ?? uploadedFile.value?.name ?? '',
      ownerPrecheckId: Number(contractChatId.value),
      rawText: parsed?.raw_text ?? '',
      specialTerms: confirmedTerms.value ?? [],
      source: parsed?.source ?? 'text',
    }

    // 저장 요청
    const resp = await OwnerPreContractAPI.saveContractDocument(contractChatId.value, payload)

    if (resp?.success) {
      alert('계약서가 성공적으로 저장되었습니다.')
    }

    return resp
  } catch (error) {
    console.log(error)
  }
}

watchEffect(() => {
  precontractStore.setTriggerSubmit(5, handleSaveContractMongo)
})
</script>
