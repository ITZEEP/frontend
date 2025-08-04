<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconExclamation from '@/components/icons/IconExclamation.vue'
import IconDocument from '@/components/icons/IconDocument.vue'
import IconWifiOff from '@/components/icons/IconWifiOff.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '오류 발생',
  },
  message: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: '확인',
  },
  errorType: {
    type: String,
    default: 'unknown_error',
    validator: (value) => ['file_error', 'server_error', 'network_error', 'unknown_error'].includes(value),
  },
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

// 메시지에서 \n을 실제 줄바꿈으로 변환
const formattedMessage = computed(() => {
  if (!props.message) return ''
  return props.message.replace(/\\n/g, '\n')
})

// 에러 타입별 아이콘 컴포넌트
const iconComponent = computed(() => {
  const icons = {
    file_error: IconDocument,
    server_error: IconExclamation,
    network_error: IconWifiOff,
    unknown_error: IconExclamation
  }
  return icons[props.errorType] || IconExclamation
})

// 에러 타입별 색상 클래스
const colorClasses = computed(() => {
  const colors = {
    file_error: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: 'text-yellow-600'
    },
    server_error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    network_error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    unknown_error: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: 'text-red-600'
    }
  }
  return colors[props.errorType] || colors.unknown_error
})
</script>

<template>
  <BaseModal v-if="isOpen" @close="handleClose" :closable="false">
    <div class="text-center">
      <div :class="['mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4', colorClasses.bg]">
        <component :is="iconComponent" :class="['h-8 w-8', colorClasses.icon]" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 whitespace-pre-line mb-6">{{ formattedMessage }}</p>
      <BaseButton @click="handleClose" variant="primary" class="w-full">
        {{ buttonText }}
      </BaseButton>
    </div>
  </BaseModal>
</template>