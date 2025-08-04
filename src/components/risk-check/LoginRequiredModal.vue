<script setup>
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import IconLock from '@/components/icons/IconLock.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '로그인이 필요합니다',
  },
  message: {
    type: String,
    default: '이 기능을 사용하려면 로그인이 필요합니다.',
  },
})

const emit = defineEmits(['close'])
const router = useRouter()

const handleClose = () => {
  emit('close')
}

const goToLogin = () => {
  emit('close')
  router.push('/auth/signin')
}
</script>

<template>
  <BaseModal v-if="isOpen" @close="handleClose" :closable="false">
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
        <IconLock class="h-8 w-8 text-yellow-600" />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
      <div class="flex gap-3">
        <BaseButton @click="handleClose" variant="outline" class="flex-1">
          취소
        </BaseButton>
        <BaseButton @click="goToLogin" variant="primary" class="flex-1">
          로그인하러 가기
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>