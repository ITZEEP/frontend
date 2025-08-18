<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconWarning from '@/components/icons/IconWarning.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '경고',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: '계속 진행',
  },
  cancelText: {
    type: String,
    default: '취소',
  },
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

// 메시지에서 \n을 실제 줄바꿈으로 변환
const formattedMessage = computed(() => {
  if (!props.message) return ''
  return props.message.replace(/\\n/g, '\n')
})
</script>

<template>
  <BaseModal v-if="isOpen" @close="handleCancel" :closable="false">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-yellow-100">
        <IconWarning class="h-8 w-8 text-yellow-600" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 whitespace-pre-line mb-6">{{ formattedMessage }}</p>
      <div class="flex gap-3">
        <BaseButton @click="handleCancel" variant="secondary" class="flex-1">
          {{ cancelText }}
        </BaseButton>
        <BaseButton @click="handleConfirm" variant="primary" class="flex-1">
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>