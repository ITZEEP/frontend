<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconBuilding from '@/components/icons/IconBuilding.vue'
import IconLink from '@/components/icons/IconLink.vue'
import IconClose from '@/components/icons/IconClose.vue'
import IconError from '@/components/icons/IconError.vue'
import { useModalStore } from '@/stores/modal'

const props = defineProps({
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

const fileInput등기부등본 = ref(null)
const fileInput건축물대장 = ref(null)

const isDragging = ref({
  등기부등본: false,
  건축물대장: false,
})

const isUploading = ref({
  등기부등본: false,
  건축물대장: false,
})

const showFileTypeModal = ref(false)

const handleFileUpload = async (event, fileType) => {
  const file = event.target.files[0]
  if (file) {
    const allowedTypes = ['application/pdf']
    if (allowedTypes.includes(file.type)) {
      isUploading.value[fileType] = true

      await new Promise((resolve) => setTimeout(resolve, 1000))

      emit('update-files', fileType, file)
      isUploading.value[fileType] = false
    } else {
      showFileTypeModal.value = true
      modalStore.open()
      event.target.value = ''
    }
  }
}

const triggerFileUpload = (fileType) => {
  if (fileType === '등기부등본') {
    fileInput등기부등본.value?.click()
  } else if (fileType === '건축물대장') {
    fileInput건축물대장.value?.click()
  }
}

const removeFile = (fileType) => {
  emit('update-files', fileType, null)
  if (fileType === '등기부등본' && fileInput등기부등본.value) {
    fileInput등기부등본.value.value = ''
  } else if (fileType === '건축물대장' && fileInput건축물대장.value) {
    fileInput건축물대장.value.value = ''
  }
}

const handleFileDrop = async (event, fileType) => {
  isDragging.value[fileType] = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    const allowedTypes = ['application/pdf']
    if (allowedTypes.includes(file.type)) {
      isUploading.value[fileType] = true

      await new Promise((resolve) => setTimeout(resolve, 1000))

      emit('update-files', fileType, file)
      isUploading.value[fileType] = false
    } else {
      showFileTypeModal.value = true
      modalStore.open()
    }
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
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h2 class="text-xl font-semibold text-gray-warm-700 mb-6">서류 업로드</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div class="flex items-center gap-2 mb-4">
          <IconLink class="w-3.5 h-3.5 text-blue-600" />
          <a
            @click="openRegistrationSite"
            class="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            등기부등본 발급받기
          </a>
        </div>

        <div
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragging.등기부등본
              ? 'border-yellow-primary bg-yellow-50 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400',
          ]"
          @click="triggerFileUpload('등기부등본')"
          @dragenter.prevent="handleDragEnter('등기부등본')"
          @dragover.prevent
          @dragleave.prevent="handleDragLeave($event, '등기부등본')"
          @drop.prevent="handleFileDrop($event, '등기부등본')"
        >
          <input
            ref="fileInput등기부등본"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleFileUpload($event, '등기부등본')"
          />

          <div class="relative">
            <IconDocument
              :class="[
                'w-6 h-8 mx-auto mb-4 text-gray-500 transition-opacity',
                isUploading.등기부등본 ? 'opacity-50' : '',
              ]"
            />
            <div
              v-if="isUploading.등기부등본"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-6 h-6 border-2 border-yellow-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-warm-700 mb-2">등기부등본</h3>
          <p class="text-sm text-gray-600 mb-4">파일을 드래그하거나 클릭하여 업로드</p>

          <div class="flex justify-center">
            <BaseButton
              @click.stop="triggerFileUpload('등기부등본')"
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
        <div class="flex items-center gap-2 mb-4">
          <IconLink class="w-3.5 h-3.5 text-blue-600" />
          <a
            @click="openBuildingRegisterSite"
            class="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            건축물대장 발급받기
          </a>
        </div>

        <div
          :class="[
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragging.건축물대장
              ? 'border-yellow-primary bg-yellow-50 scale-[1.02]'
              : 'border-gray-300 hover:border-gray-400',
          ]"
          @click="triggerFileUpload('건축물대장')"
          @dragenter.prevent="handleDragEnter('건축물대장')"
          @dragover.prevent
          @dragleave.prevent="handleDragLeave($event, '건축물대장')"
          @drop.prevent="handleFileDrop($event, '건축물대장')"
        >
          <input
            ref="fileInput건축물대장"
            type="file"
            accept=".pdf"
            class="hidden"
            @change="handleFileUpload($event, '건축물대장')"
          />

          <div class="relative">
            <IconBuilding
              :class="[
                'w-7 h-9 mx-auto mb-4 text-gray-500 transition-opacity',
                isUploading.건축물대장 ? 'opacity-50' : '',
              ]"
            />
            <div
              v-if="isUploading.건축물대장"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div
                class="w-6 h-6 border-2 border-yellow-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-warm-700 mb-2">건축물대장</h3>
          <p class="text-sm text-gray-600 mb-4">파일을 드래그하거나 클릭하여 업로드</p>

          <div class="flex justify-center">
            <BaseButton
              @click.stop="triggerFileUpload('건축물대장')"
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

  <BaseModal v-if="showFileTypeModal" @close="closeFileTypeModal" :closable="false" maxWidth="max-w-[420px]">
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
