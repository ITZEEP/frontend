<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconBuilding from '@/components/icons/IconBuilding.vue'
import IconLink from '@/components/icons/IconLink.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconError from '@/components/icons/IconError.vue'
import { useModalStore } from '@/stores/modal'

defineProps({
  uploadedFiles: {
    type: Object,
    default: () => ({
      등기부등본: null,
      건축물대장: null,
    }),
  },
})

const emit = defineEmits(['update-files'])
const modalStore = useModalStore()

const fileInputRegistry = ref(null)
const fileInputBuilding = ref(null)

const isDragging = ref({
  등기부등본: false,
  건축물대장: false,
})

const isUploading = ref({
  등기부등본: false,
  건축물대장: false,
})

const showFileTypeModal = ref(false)

// 파일 검증 및 처리를 위한 공통 함수
const processFile = async (file, fileType) => {
  // 파일 크기 검증 (50MB 제한)
  const maxSizeInMB = 50
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  
  if (file.size > maxSizeInBytes) {
    alert(`파일 크기는 ${maxSizeInMB}MB를 초과할 수 없습니다.`)
    return false
  }
  
  // 파일 타입 검증
  const allowedTypes = ['application/pdf']
  if (!allowedTypes.includes(file.type)) {
    showFileTypeModal.value = true
    modalStore.open()
    return false
  }
  
  // 파일 확장자 검증
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.pdf')) {
    showFileTypeModal.value = true
    modalStore.open()
    return false
  }
  
  try {
    isUploading.value[fileType] = true
    await new Promise((resolve) => setTimeout(resolve, 1000))
    emit('update-files', fileType, file)
    isUploading.value[fileType] = false
    return true
  } catch {
    alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.')
    isUploading.value[fileType] = false
    return false
  }
}

const handleFileUpload = async (event, fileType) => {
  const file = event.target.files[0]
  if (file) {
    const success = await processFile(file, fileType)
    if (!success) {
      event.target.value = ''
    }
  }
}

const handleSelectFile = (fileType) => {
  if (fileType === '등기부등본') {
    fileInputRegistry.value?.click()
  } else if (fileType === '건축물대장') {
    fileInputBuilding.value?.click()
  }
}

const removeFile = (fileType) => {
  emit('update-files', fileType, null)
  if (fileType === '등기부등본' && fileInputRegistry.value) {
    fileInputRegistry.value.value = ''
  } else if (fileType === '건축물대장' && fileInputBuilding.value) {
    fileInputBuilding.value.value = ''
  }
}

const handleFileDrop = async (event, fileType) => {
  isDragging.value[fileType] = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    await processFile(files[0], fileType)
  }
}

const handleDragEnter = (fileType) => {
  isDragging.value[fileType] = true
}

const handleDragLeave = (event, fileType) => {
  if (event.currentTarget.contains(event.relatedTarget)) {
    return
  }
  isDragging.value[fileType] = false
}

const openRegistrationSite = () => {
  window.open('https://www.iros.go.kr/index.jsp', '_blank')
}

const openBuildingRegisterSite = () => {
  window.open('https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=15000000098', '_blank')
}

const closeFileTypeModal = () => {
  showFileTypeModal.value = false
  modalStore.close()
}
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h2 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">서류 업로드</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <div class="flex items-center gap-2 mb-3 sm:mb-4">
          <IconLink class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
          <a
            @click="openRegistrationSite"
            class="text-xs sm:text-sm text-blue-600 cursor-pointer hover:underline"
          >
            등기부등본 발급받기
          </a>
        </div>

        <div
          :class="[
            'border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-200',
            isDragging.등기부등본
              ? 'border-yellow-primary bg-yellow-50 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400',
          ]"
          @dragenter.prevent="handleDragEnter('등기부등본')"
          @dragover.prevent
          @dragleave.prevent="handleDragLeave($event, '등기부등본')"
          @drop.prevent="handleFileDrop($event, '등기부등본')"
        >
          <input
            ref="fileInputRegistry"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleFileUpload($event, '등기부등본')"
          />

          <div class="relative">
            <IconDocument
              :class="[
                'w-5 h-6 sm:w-6 sm:h-8 mx-auto mb-3 sm:mb-4 text-gray-500 transition-opacity',
                isUploading.등기부등본 ? 'opacity-50' : '',
              ]"
            />
            <div
              v-if="isUploading.등기부등본"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-5 h-5 sm:w-6 sm:h-6 border-2 border-yellow-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-warm-700 mb-1 sm:mb-2">등기부등본</h3>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">파일을 드래그하여 업로드</p>

          <div class="flex justify-center">
            <BaseButton
              @click="handleSelectFile('등기부등본')"
              variant="primary"
              :disabled="isUploading.등기부등본"
            >
              {{ isUploading.등기부등본 ? '업로드 중...' : '파일 선택' }}
            </BaseButton>
          </div>

          <div class="bg-gray-50 rounded-lg px-3 py-2 mt-4 h-10 flex items-center">
            <div v-if="uploadedFiles.등기부등본" class="flex items-center justify-between w-full">
              <span class="text-sm text-gray-warm-700 truncate">{{
                uploadedFiles.등기부등본.name
              }}</span>
              <button
                @click.stop="removeFile('등기부등본')"
                class="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
              >
                <IconClose class="w-4 h-4" />
              </button>
            </div>
            <span v-else class="text-xs text-gray-400">※ PDF 파일만 업로드 가능합니다</span>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-2 mb-3 sm:mb-4">
          <IconLink class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
          <a
            @click="openBuildingRegisterSite"
            class="text-xs sm:text-sm text-blue-600 cursor-pointer hover:underline"
          >
            건축물대장 발급받기
          </a>
        </div>

        <div
          :class="[
            'border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-200',
            isDragging.건축물대장
              ? 'border-yellow-primary bg-yellow-50 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400',
          ]"
          @dragenter.prevent="handleDragEnter('건축물대장')"
          @dragover.prevent
          @dragleave.prevent="handleDragLeave($event, '건축물대장')"
          @drop.prevent="handleFileDrop($event, '건축물대장')"
        >
          <input
            ref="fileInputBuilding"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleFileUpload($event, '건축물대장')"
          />

          <div class="relative">
            <IconBuilding
              :class="[
                'w-6 h-7 sm:w-7 sm:h-9 mx-auto mb-3 sm:mb-4 text-gray-500 transition-opacity',
                isUploading.건축물대장 ? 'opacity-50' : '',
              ]"
            />
            <div
              v-if="isUploading.건축물대장"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-5 h-5 sm:w-6 sm:h-6 border-2 border-yellow-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-gray-warm-700 mb-1 sm:mb-2">건축물대장</h3>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">파일을 드래그하여 업로드</p>

          <div class="flex justify-center">
            <BaseButton
              @click="handleSelectFile('건축물대장')"
              variant="primary"
              :disabled="isUploading.건축물대장"
            >
              {{ isUploading.건축물대장 ? '업로드 중...' : '파일 선택' }}
            </BaseButton>
          </div>

          <div class="bg-gray-50 rounded-lg px-3 py-2 mt-4 h-10 flex items-center">
            <div v-if="uploadedFiles.건축물대장" class="flex items-center justify-between w-full">
              <span class="text-sm text-gray-warm-700 truncate">{{
                uploadedFiles.건축물대장.name
              }}</span>
              <button
                @click.stop="removeFile('건축물대장')"
                class="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
              >
                <IconClose class="w-4 h-4" />
              </button>
            </div>
            <span v-else class="text-xs text-gray-400">※ PDF 파일만 업로드 가능합니다</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BaseModal
    v-if="showFileTypeModal"
    @close="closeFileTypeModal"
    :closable="false"
    maxWidth="max-w-[420px]"
  >
    <div class="-m-6 overflow-hidden rounded-md">
      <div class="bg-red-50 p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="rounded-full bg-red-100 p-2">
              <IconError class="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-red-900">파일 형식 오류</h3>
            <p class="mt-2 text-sm text-red-700">PDF 파일만 업로드 가능합니다.</p>
          </div>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-gray-600">
          등기부등본 또는 건축물대장을 PDF 형식으로 준비해 주세요.
        </p>
      </div>
      <div class="px-5 py-4">
        <BaseButton @click="closeFileTypeModal" variant="danger-outline" class="w-full">
          확인
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
