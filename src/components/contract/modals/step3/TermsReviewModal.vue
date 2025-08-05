<template>
  <Modal :closable="true" :maskCloseable="true" @close="onClose">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">특약 조항 검토</h2>
        <span class="text-sm text-gray-500">남은 조율 기회: {{ remainingChances }}/3</span>
      </div>

      <div class="flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        <TermsReviewCard
          v-for="clause in clauses"
          :key="clause.id"
          :clause="clause"
          @selection-changed="handleSelectionChange"
        />
      </div>

      <BaseButton variant="yellow" class="mt-6 w-full" @click="confirm">검토 완료</BaseButton>
    </div>
  </Modal>
</template>

<script setup>
import Modal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import TermsReviewCard from './TermsReviewCard.vue'
import { useRoute } from 'vue-router'
import { getSpecialContractForUser } from '@/apis/contractChatApi'
import { onMounted, ref } from 'vue'
import { postSpecialContractSelection } from '@/apis/contractChatApi'
import { useModalStore } from '@/stores/modal'

const route = useRoute()
const contractChatId = route.query.id || route.params.id

const modalStore = useModalStore()

const props = defineProps({
  remainingChances: Number,
  onClose: Function,
})

const clauses = ref([])
const selections = ref({})

onMounted(async () => {
  const result = await getSpecialContractForUser(contractChatId)
  clauses.value = result
})

const handleSelectionChange = ({ id, selected }) => {
  selections.value[id] = selected
  console.log('제출 결과: ', selections.value)
}

const confirm = async () => {
  try {
    console.log('제출할 데이터:', selections.value)
    const result = await postSpecialContractSelection(contractChatId, selections.value)
    console.log(result)
    modalStore.close()
  } catch (error) {
    console.error('제출 실패......', error)
  }
}

const onClose = () => {
  modalStore.close()
  props.onClose?.()
}
</script>
