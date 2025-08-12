<template>
  <div>
    <component
      :is="currentIntroComponent"
      v-if="currentIntroComponent"
      :scenario="scenario"
      @action="handleAction"
    />

    <!-- 모달 컴포넌트들 -->
    <component
      :is="modalStore.currentModalComponent"
      v-if="modalStore.isOpen"
      v-bind="modalStore.modalProps"
    />
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()
</script>
