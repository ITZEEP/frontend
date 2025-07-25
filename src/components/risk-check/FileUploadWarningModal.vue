<script setup>
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconWarning from '@/components/icons/IconWarning.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  missingFiles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['confirm'])

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <BaseModal
    v-if="isOpen"
    :closable="false"
    :closeOnClickOutside="false"
    maxWidth="max-w-[420px]"
  >
    <div class="-m-6 overflow-hidden rounded-md">
      <div class="bg-yellow-50 p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="rounded-full bg-yellow-100 p-2">
              <IconWarning class="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-yellow-900">파일 업로드 필요</h3>
            <p class="mt-2 text-sm text-yellow-700">
              AI 위험도 분석을 위해 필요한 서류가 업로드되지 않았습니다.
            </p>
          </div>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-gray-600 mb-3">
          다음 서류를 업로드해주세요:
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li v-for="file in missingFiles" :key="file">{{ file }}</li>
        </ul>
        <p class="text-xs text-gray-500 mt-3">
          ※ 모든 서류는 PDF 형식으로 업로드해주세요.
        </p>
      </div>
      <div class="px-5 py-4 bg-gray-50">
        <BaseButton @click="handleConfirm" variant="primary" class="w-full">
          확인
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>