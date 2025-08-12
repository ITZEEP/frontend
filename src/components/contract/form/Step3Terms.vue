<!-- src/components/contract/steps/Step3Terms.vue -->
<template>
  <div class="w-full h-[728px] flex flex-col gap-4 overflow-y-auto">
    <h2 class="text-base font-semibold">
      <template v-if="isAllDone">최종 확정된 특약</template>
      <template v-else>현재 조율 중인 특약</template>
      <span v-if="!isAllDone">
        <span v-if="store.currentRound === 0">(초안 수정)</span>
        <span v-else>({{ store.currentRound }}회차 수정)</span>
      </span>
    </h2>

    <!-- 전체 완료인 경우: 최종 계약서 특약 -->
    <div v-if="isAllDone">
      <div v-if="finalClauses.length === 0">최종 특약이 없습니다.</div>
      <ul v-else class="space-y-4 bg-gray-100 p-4 rounded-md flex flex-col">
        <li
          v-for="clause in finalClauses"
          :key="clause.order ?? clause.id ?? clause.clauseId"
          class="flex flex-col gap-2 bg-white p-4 rounded-md shadow-sm"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium">
                {{ clause.order ?? clause.id ?? clause.clauseId }}.
                {{ clause.title ?? clause.name }}
              </p>
              <p class="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                {{ clause.content ?? clause.text }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button class="text-yellow-primary hover:text-yellow-500" title="수정">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-gray-500 hover:text-red-400" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </li>
        <BaseButton>특약 최종 확정하기</BaseButton>
      </ul>
    </div>

    <!-- 전체 완료가 아니면: 기존 조율 목록 -->
    <div v-else>
      <div v-if="clauses.length === 0">조율 중인 특약이 없습니다.</div>
      <ul v-else class="space-y-4 bg-gray-100 p-4 rounded-md flex flex-col">
        <li
          v-for="(clause, index) in clauses"
          :key="clause.id"
          class="flex flex-col gap-2 bg-white p-4 rounded-md shadow-sm"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="w-full flex justify-between">
                <p class="text-sm font-medium">{{ index + 1 }}. {{ clause.title }}</p>
                <button
                  class="text-xs text-blue-600 hover:underline"
                  @click="toggleDetails(clause.id)"
                >
                  {{ openDetails[clause.id] ? '판단 닫기' : '판단 보기' }}
                </button>
              </div>
              <p class="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                {{ clause.content }}
              </p>
            </div>
          </div>

          <div v-if="openDetails[clause.id]" class="mt-2">
            <div
              v-if="clause.level === '주의'"
              class="bg-red-50 border border-red-300 rounded-md p-3 text-sm"
            >
              <div class="flex items-center gap-1 mb-1 font-semibold text-red-600">⚠️ 주의</div>
              <p class="text-xs text-gray-700 font-light whitespace-pre-wrap">
                {{ clause.reason }}
              </p>
            </div>
            <div
              v-else-if="clause.level === '안심'"
              class="bg-green-50 border border-green-300 rounded-md p-3 text-sm"
            >
              <div class="flex items-center gap-1 mb-1 font-semibold text-green-600">✅ 안심</div>
              <p class="text-xs text-gray-700 font-light whitespace-pre-wrap">
                {{ clause.reason }}
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getSpecialContractForUser, getFinalContract } from '@/apis/contractChatApi'
import { useSpecialContractStore } from '@/stores/useContractTermStore'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  contractChatId: { type: [String, Number], required: false },
})

const clauses = ref([])
const finalClauses = ref([])
const openDetails = ref({})

const route = useRoute()
const store = useSpecialContractStore()

const contractChatId = computed(() => {
  return (
    (props.contractChatId && String(props.contractChatId)) ||
    (route.params.contractChatId && String(route.params.contractChatId)) ||
    (route.params.id && String(route.params.id)) ||
    (route.query.id && String(route.query.id)) ||
    null
  )
})

const isAllDone = computed(() => {
  if (store.allCompleted) return true
  if (typeof window !== 'undefined') {
    return localStorage.getItem('specialContract_allCompleted') === 'true'
  }
  return false
})

const fetchClauses = async (id) => {
  if (!id) return
  const res = await getSpecialContractForUser(id)
  const list = res?.clauses || []
  clauses.value = list
  // 펼침 상태 초기화
  openDetails.value = {}
  list.forEach((c) => (openDetails.value[c.id] = false))
}

const fetchFinalClauses = async (id) => {
  if (!id) return
  const res = await getFinalContract(id)
  const list =
    res?.data?.finalClauses || res?.finalClauses || res?.clauses || res?.data?.clauses || []
  finalClauses.value = Array.isArray(list)
    ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []
}

const toggleDetails = (id) => {
  openDetails.value[id] = !openDetails.value[id]
}

/**
 * 최초 로드 & id/isAllDone 변경 시 데이터 로드
 * (기존 watchEffect의 키 충돌 방지를 위해 명시적 watch로 분리)
 */
watch(
  [contractChatId, isAllDone],
  async ([id, done]) => {
    if (!id) return
    if (done) await fetchFinalClauses(id)
    else await fetchClauses(id)
  },
  { immediate: true },
)

/**
 * ✅ currentRound 변경 시 초안/라운드 특약 다시 조회
 * (isAllDone이 false일 때만 의미 있으므로 가드)
 */
watch(
  () => store.currentRound,
  async () => {
    const id = contractChatId.value
    if (!id || isAllDone.value) return
    await fetchClauses(id)
  },
)
</script>
