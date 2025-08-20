<script setup>
import { RouterView } from 'vue-router'
import DefaultLayout from './components/layouts/DefaultLayout.vue'
import LoginModal from './components/common/LoginModal.vue'
import ConfirmModal from './components/common/ConfirmModal.vue'
import { useLoginModal } from '@/composables/useLoginModal'
import { useConfirmModal } from '@/composables/useConfirmModal'

const { isLoginModalOpen, redirectPath, closeLoginModal } = useLoginModal()
const { isConfirmModalOpen, confirmTitle, confirmMessage, handleConfirm, handleCancel } = useConfirmModal()
</script>

<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
  
  <!-- 전역 로그인 모달 -->
  <LoginModal 
    v-model="isLoginModalOpen"
    :redirect-path="redirectPath"
    @cancel="closeLoginModal"
    @confirm="closeLoginModal"
  />
  
  <!-- 전역 확인 모달 -->
  <ConfirmModal
    :is-open="isConfirmModalOpen"
    :title="confirmTitle"
    :message="confirmMessage"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<style scoped></style>
