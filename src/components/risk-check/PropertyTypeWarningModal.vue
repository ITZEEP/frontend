<script setup>
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconWarning from '@/components/icons/IconWarning.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
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
      <div class="bg-blue-50 p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="rounded-full bg-blue-100 p-2">
              <IconWarning class="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-blue-900">매물 유형 선택 필요</h3>
            <p class="mt-2 text-sm text-blue-700">
              AI 위험도 분석을 시작하기 전에 매물 유형을 선택해주세요.
            </p>
          </div>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-gray-600 mb-3">
          다음 중 하나를 선택해주세요:
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>등록된 매물 - 잇집에 등록된 매물</li>
          <li>미등록 매물 - 직접 서류를 업로드하는 매물</li>
        </ul>
      </div>
      <div class="px-5 py-4 bg-gray-50">
        <BaseButton @click="handleConfirm" variant="primary" class="w-full">
          확인
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>