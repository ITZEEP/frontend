<template>
  <Modal :closable="true" :maskCloseable="true" @close="onClose">
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">최종 특약 조항 선택</h2>

      <ToggleRadio v-model="selectedRound" :options="roundOptions" label="회차 선택" />

      <div class="flex flex-col gap-4 mt-4 max-h-[50vh] overflow-y-auto">
        <div
          v-for="(clause, index) in clausesByRound[selectedRound]"
          :key="index"
          class="bg-white border rounded-md p-4"
        >
          <p class="text-sm text-gray-700">{{ clause.content }}</p>
        </div>
      </div>

      <BaseButton variant="yellow" class="mt-6 w-full" @click="onSelect">최종 확정</BaseButton>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'

const props = defineProps({
  clausesByRound: Object,
  onClose: Function,
  onSelect: Function,
})

const selectedRound = ref(Object.keys(props.clausesByRound)[0] || '1')

const roundOptions = Object.keys(props.clausesByRound).map((r) => ({
  label: `${r}회차`,
  value: r,
}))

const onClose = () => props.onClose?.()
const onSelect = () => props.onSelect?.(selectedRound.value)
</script>
