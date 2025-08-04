<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <!-- 설명 -->
    <label for="description" class="block font-semibold mb-1">
      사진 및 설명 <span class="text-red-600">*</span>
    </label>
    <p class="text-sm text-gray-600 mb-4">
      최소 1장 이상, 최대 5장까지 업로드 가능합니다. (1장당 최대 10MB)
    </p>

    <!-- 파일 업로드 -->
    <label
      for="fileInput"
      class="relative cursor-pointer block w-full border-2 border-dashed border-gray-300 rounded-md p-10 text-center hover:border-gray-400 transition-colors"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div class="flex flex-col items-center justify-center space-y-2 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-10 h-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-3-3m3 3l3-3M12 4v8"
          />
        </svg>
        <p>사진을 드래그하거나 클릭하여 업로드하세요</p>
        <p class="text-xs text-gray-400">JPG, PNG 파일만 가능 (최대 10MB)</p>
      </div>
      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/png"
        multiple
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="onFileChange"
      />
    </label>

    <!-- 썸네일 미리보기 -->
    <div class="flex flex-wrap gap-3 mt-2">
      <div
        v-for="(file, index) in files"
        :key="file.id"
        class="relative w-24 h-24 rounded overflow-hidden border border-gray-300"
      >
        <img :src="file.url" alt="업로드된 이미지" class="object-cover w-full h-full" />
        <button
          @click="removeFile(index)"
          type="button"
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
          aria-label="삭제"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 상세 설명 -->
    <div>
      <label for="description" class="block font-semibold mb-1">
        상세 설명 <span class="text-red-600">*</span>
      </label>
      <textarea
        id="description"
        v-model="description"
        :maxlength="maxLength"
        placeholder="구조, 특징, 주변 환경 등을 자유롭게 작성해주세요. 1000자 이내 권장"
        class="w-full border rounded p-3 resize-none min-h-[100px] focus:outline-yellow-primary"
      ></textarea>
      <div class="text-right text-xs text-gray-500 mt-1">
        {{ description.length }}/{{ maxLength }}
      </div>
    </div>

    <!-- 본인 인증 안내 -->
    <div
      class="flex items-center gap-3 bg-yellow-100 border border-yellow-primary rounded p-3 text-yellow-800 text-sm"
      role="alert"
    >
      <p>
        매물 등록을 위해 실명 인증이 필요합니다.<br />
        본인 인증을 완료해주세요.
      </p>
      <button
        type="button"
        class="ml-auto bg-yellow-primary text-yellow-900 font-semibold px-4 py-1 rounded hover:bg-yellow-primary"
        @click="showVerification = true"
      >
        인증하기
      </button>
    </div>

    <!-- 본인인증 컴포넌트 직접 렌더링 -->
    <div
      v-if="showVerification"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          @click="showVerification = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <UserVerification @verified="handleVerified" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UserVerification from '@/components/pre-contract/common/UserVerification.vue'

const files = ref([])
const description = ref('')
const maxFiles = 5
const maxSizeMB = 10
const maxLength = 1000
const showVerification = ref(false)

let idCounter = 0

function onFileChange(event) {
  const selectedFiles = event.target.files
  addFiles(selectedFiles)
  event.target.value = ''
}

function handleDrop(event) {
  const droppedFiles = event.dataTransfer.files
  addFiles(droppedFiles)
}

function addFiles(fileList) {
  for (const file of fileList) {
    if (files.value.length >= maxFiles) {
      alert(`최대 ${maxFiles}장까지 업로드 가능합니다.`)
      break
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('JPG 또는 PNG 파일만 업로드 가능합니다.')
      continue
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`파일 크기는 최대 ${maxSizeMB}MB 입니다.`)
      continue
    }

    const url = URL.createObjectURL(file)
    files.value.push({ id: idCounter++, file, url })
  }
}

function removeFile(index) {
  URL.revokeObjectURL(files.value[index].url)
  files.value.splice(index, 1)
}

function handleVerified() {
  showVerification.value = false
  alert('인증이 완료되었습니다.')
}
</script>
