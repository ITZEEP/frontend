<template>
  <Modal :closable="true" :maskCloseable="true" @close="onClose">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">특약 조항 검토</h2>
        <span class="text-sm text-gray-500">남은 조율 기회: {{ remainingChances }}/3</span>
      </div>

      <div class="flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        <TermsReviewCard v-for="clause in clauses" :key="clause.id" :clause="clause" />
      </div>

      <BaseButton variant="yellow" class="mt-6 w-full" @click="onConfirm">검토 완료</BaseButton>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import TermsReviewCard from './TermsReviewCard.vue'

const props = defineProps({
  clauses: Array,
  remainingChances: Number,
  onClose: Function,
  onConfirm: Function,
})

const onClose = () => props.onClose?.()
const onConfirm = () => props.onConfirm?.()
</script>
