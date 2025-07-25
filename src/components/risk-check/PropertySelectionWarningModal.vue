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
      <div class="bg-yellow-50 p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="rounded-full bg-yellow-100 p-2">
              <IconWarning class="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-yellow-900">매물 선택 필요</h3>
            <p class="mt-2 text-sm text-yellow-700">
              AI 위험도 분석을 위해 매물을 선택해주세요.
            </p>
          </div>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-gray-600">
          즐겨찾기 매물 또는 채팅 매물 중에서 분석하고자 하는 매물을 선택해주세요.
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