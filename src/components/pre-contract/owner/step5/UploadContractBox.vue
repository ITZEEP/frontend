<template>
  <div
    class="w-full max-w-xl border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition relative"
    @click="triggerFileInput"
  >
    <!-- 로딩 스피너 -->
    <div
      v-if="isUploading"
      class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg"
    >
      <div
        class="w-6 h-6 border-2 border-yellow-primary border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- 아이콘 -->
    <div class="text-gray-400 mb-2 z-0">
      <UploadCloudIcon :width="40" :height="40" />
    </div>

    <!-- 안내 문구 -->
    <p class="text-gray-600 font-medium z-0">계약서 파일을 드래그하거나 클릭하여 업로드하세요</p>
    <p class="text-xs text-gray-400 mt-1 z-0">PDF 파일만 가능 (최대 10MB)</p>

    <!-- 파일 입력 -->
    <input
      type="file"
      ref="fileInput"
      accept="application/pdf"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- 업로드 성공 -->
    <p v-if="fileName && !errorMessage" class="text-sm text-green-600 mt-2 z-0">
      ✔ {{ fileName }}
    </p>

    <!-- 오류 메시지 -->
    <p v-if="errorMessage" class="text-sm text-red-600 mt-2 z-0">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UploadCloudIcon from '@/assets/icons/UploadCloudIcon.vue'

defineOptions({ name: 'UploadContractBox' })

const model = defineModel({ default: null })

const fileInput = ref(null)
const fileName = ref('')
const errorMessage = ref('')
const isUploading = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  errorMessage.value = ''
  fileName.value = ''
  model.value = null

  if (!file) return

  // 파일 확장자, 타입, 크기 검증
  const isPdf = file.type === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf')
  const isSizeValid = file.size <= 10 * 1024 * 1024 // 10MB

  if (!isPdf) {
    errorMessage.value = '❗ PDF 파일만 업로드할 수 있습니다.'
    e.target.value = ''
    return
  }

  if (!isSizeValid) {
    errorMessage.value = '❗ 파일 크기는 10MB를 초과할 수 없습니다.'
    e.target.value = ''
    return
  }

  try {
    isUploading.value = true
    await new Promise((resolve) => setTimeout(resolve, 800)) // UI 테스트용 로딩 딜레이

    model.value = structuredClone(file)
    fileName.value = file.name
  } catch (err) {
    errorMessage.value = '❗ 파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.'
    e.target.value = ''
  } finally {
    isUploading.value = false
  }
}
</script>
