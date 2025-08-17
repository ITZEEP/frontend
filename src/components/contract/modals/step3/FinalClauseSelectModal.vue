<template>
  <Modal :closable="true" :maskCloseable="true" :maxWidth="'max-w-[1200px]'" @close="onClose">
    <div class="p-6">
      <header class="w-full flex justify-between">
        <h2 class="text-xl font-semibold mb-4">최종 특약 조항 확인</h2>
        <p class="text-sm text-red-500">
          최종 특약은 마지막 회차로 저장되지만, 대화 후 임대인의 요청으로 수정이 가능합니다.
        </p>
      </header>

      <div v-if="loading" class="text-center text-gray-500 py-8">불러오는 중...</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="round in rounds"
          :key="round"
          class="bg-white border rounded-lg overflow-hidden"
        >
          <div class="px-4 py-2 bg-gray-50 flex items-center justify-between sticky top-0">
            <h3 class="font-semibold">{{ round }}</h3>
          </div>

          <div class="p-3 space-y-2 overflow-y-auto" style="max-height: 50vh">
            <div
              v-for="(clause, index) in clausesByRound[round]"
              :key="`${round}-${index}`"
              class="bg-white border rounded-md p-3 text-sm text-gray-700 flex flex-col"
            >
              <label class="text-gray-800 font-semibold text-base">
                <span>{{ clause.id ?? clause.clauseId }}. </span>{{ clause.title ?? clause.name }}
              </label>
              <label>{{ clause.content ?? clause.text }}</label>
            </div>
          </div>
        </div>
      </div>

      <BaseButton variant="yellow" class="mt-6 w-full" @click="onSelect">확인</BaseButton>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useRoute } from 'vue-router'
import { getAllRoundsSpecialContract } from '@/apis/contractChatApi'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

const props = defineProps({
  onClose: Function,
  onSelect: Function,
})

const route = useRoute()
const contractChatId = route.query.id || route.params.id
const store = useSpecialContractStore()

const loading = ref(true)
const clausesByRound = ref({})

const labelForRound = (roundNum) => (roundNum === 1 ? '초안' : `${roundNum - 1}회차`)

const rounds = computed(() => Object.keys(clausesByRound.value))

const onClose = () => props.onClose?.()
const onSelect = () => props.onSelect?.()

onMounted(async () => {
  store.markAllCompleted()

  try {
    loading.value = true
    const res = await getAllRoundsSpecialContract(contractChatId)

    const map = {}

    if (Array.isArray(res?.rounds)) {
      res.rounds.forEach((r) => {
        if (r?.clauses?.length) {
          map[labelForRound(Number(r.round))] = r.clauses
        }
      })
    } else if (res?.rounds && typeof res.rounds === 'object') {
      Object.entries(res.rounds).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          if (val.length) map[key] = val
        } else if (val && val.clauses?.length) {
          const label = labelForRound(Number(val.round ?? key))
          map[label] = val.clauses
        }
      })
    }

    clausesByRound.value = map
  } catch (e) {
    console.error('최종 라운드 데이터 로드 실패:', e)
    clausesByRound.value = {}
  } finally {
    loading.value = false
  }
})
</script>
