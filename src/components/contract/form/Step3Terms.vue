<template>
  <div class="w-full h-[728px] flex flex-col gap-4 overflow-y-auto">
    <h2 class="text-base font-semibold">
      현재 조율 중인 특약
      <span v-if="store.currentRound === 0">(초안 수정)</span>
      <span v-else>({{ store.currentRound }}회차 수정)</span>
    </h2>

    <div v-if="clauses.length === 0">조율 중인 특약이 없습니다.</div>

    <ul v-else class="space-y-4 bg-gray-100 p-4 rounded-md flex flex-col">
      <li
        v-for="(clause, index) in clauses"
        :key="clause.id"
        class="flex flex-col gap-2 bg-white p-4 rounded-md shadow-sm"
      >
        <!-- 타이틀 및 내용 -->
        <div class="flex justify-between items-start">
          <div>
            <div class="flex justify-between">
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

        <!-- 판단 박스 -->
        <div v-if="openDetails[clause.id]" class="mt-2">
          <div
            v-if="clause.level === '주의'"
            class="bg-red-50 border border-red-300 rounded-md p-3 text-sm"
          >
            <div class="flex items-center gap-1 mb-1 font-semibold text-red-600">⚠️ 주의</div>
            <p class="text-xs text-gray-700 font-light text-left whitespace-pre-wrap">
              {{ clause.reason }}
            </p>
          </div>

          <div
            v-else-if="clause.level === '안심'"
            class="bg-green-50 border border-green-300 rounded-md p-3 text-sm"
          >
            <div class="flex items-center gap-1 mb-1 font-semibold text-green-600">✅ 안심</div>
            <p class="text-xs text-gray-700 font-light text-left whitespace-pre-wrap">
              {{ clause.reason }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSpecialContractForUser } from '@/apis/contractChatApi'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

const clauses = ref([])
const openDetails = ref({}) // clause.id -> boolean 상태 저장
const route = useRoute()
const contractChatId = route.params.id || route.query.id
const store = useSpecialContractStore()

const fetchClauses = async () => {
  const res = await getSpecialContractForUser(contractChatId)
  clauses.value = res.clauses
  // 초기화
  res.clauses.forEach((c) => (openDetails.value[c.id] = false))
}

const toggleDetails = (id) => {
  openDetails.value[id] = !openDetails.value[id]
}

onMounted(() => {
  fetchClauses()
})

watch(
  () => store.currentRound,
  () => {
    fetchClauses()
  },
)
</script>
