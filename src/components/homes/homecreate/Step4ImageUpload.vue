<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <!-- 설명 -->
    <div>
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
            class="w-12 h-12 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M16 12l-4-4-4 4" />
            <path d="M12 8v9" />
            <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
            />
          </svg>
          <p>사진을 드래그하거나 클릭하여 업로드하세요</p>
          <p class="text-xs text-gray-400">jpg, png 파일만 가능 (최대 10mb)</p>
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
      <div class="flex flex-wrap gap-3 mt-4">
        <div
          v-for="(file, index) in files"
          :key="file.id"
          class="relative w-24 h-24 rounded overflow-hidden border border-gray-300 shadow-sm"
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
    </div>

    <!-- 상세 설명 -->
    <div>
      <label for="description" class="block font-semibold mb-1"> 상세 설명 </label>
      <textarea
        id="description"
        v-model="description"
        :maxlength="maxLength"
        placeholder="구조, 특징, 주변 환경 등을 자유롭게 작성해주세요. 1000자 이내 권장"
        class="w-full border rounded p-3 resize-none min-h-[100px] focus:outline-yellow-500"
      ></textarea>
      <div class="text-right text-xs text-gray-500 mt-1">
        {{ description.length }}/{{ maxLength }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const files = ref([])
const description = ref('')
const maxFiles = 5
const maxSizeMB = 10
const maxLength = 1000

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
</script>
