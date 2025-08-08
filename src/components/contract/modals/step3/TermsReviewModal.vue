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
import {
  getSpecialContractForUser,
  postSpecialContractSelection,
  getIncompleteSpecialContracts,
  putRecentData,
  postAiMessage,
  postAutoNextRound,
} from '@/apis/contractChatApi'
import { onMounted, ref } from 'vue'
import { useModalStore } from '@/stores/modal'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

const route = useRoute()
const contractChatId = route.query.id || route.params.id
const store = useSpecialContractStore()
const round = ref()

const modalStore = useModalStore()

const props = defineProps({
  remainingChances: Number,
  onClose: Function,
})

const clauses = ref([])
const selections = ref({})
const contracts = ref([])

onMounted(async () => {
  const result = await getSpecialContractForUser(contractChatId)
  clauses.value = result.clauses
  round.value = result.round || 1
})

const handleSelectionChange = ({ id, selected }) => {
  selections.value[id] = selected
  console.log('제출 결과: ', selections.value)
}

const confirm = async () => {
  try {
    console.log('제출할 데이터:', selections.value)

    const result = await postSpecialContractSelection(contractChatId, selections.value)
    modalStore.close()

    console.log('[확인] 응답 메시지:', result.data.message)
    console.log('[확인] AI 메시지 수신 여부:', store.aiMessageReceived)

    if (result.data.message === '특약 협상이 시작됩니다.') {
      if (round.value >= 2) {
        console.log(`[TermsReviewModal] round=${round.value} → postAutoNextRound 선행 호출`)
        await postAutoNextRound(contractChatId)
      }

      console.log('[TermsReviewModal] AI 메시지 수신됨 → startTermsFlow 실행')
      await startTermsFlow(contractChatId)
      store.clearAiMessageFlag()
    }
  } catch (error) {
    console.error('제출 실패:', error)
  }
}

// 미완료 특약 목록 조회 후 각 조항 별 정보 업데이트
const startTermsFlow = async (contractChatId) => {
  try {
    const result = await getIncompleteSpecialContracts(contractChatId)
    console.log('미완료 특약 목록:', result)
    contracts.value = result
    store.setOrders(result)
    console.log('[TermsReviewModal] setOrders:', result)

    // 첫 미완료 특약 처리
    if (contracts.value.length > 0) {
      const { order } = contracts.value[0]
      console.log('[TermsReviewModal] firstOrder:', order)

      await postAiMessage(contractChatId, order)

      await putRecentData(contractChatId, order)

      store.setOrder(order)
      console.log('[TermsReviewModal] setOrder 호출됨:', store.currentOrder)
    } else {
      store.clearOrder()
    }
  } catch (error) {
    console.error('미완료 특약 목록 조회 실패:', error)
  }
}

const onClose = () => {
  modalStore.close()
  props.onClose?.()
}
</script>
