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
            <div class="flex-1">
              <div class="w-full flex justify-between items-center">
                <!-- 제목 -->
                <p class="text-sm font-medium mb-1">
                  {{ clause.order ?? clause.id ?? clause.clauseId }}.
                  <template v-if="isOwner && isEditing(clause.order)">
                    <input
                      v-model="editTitleMap[clause.order]"
                      type="text"
                      class="border rounded px-2 py-1 w-96 text-sm"
                      :placeholder="clause.title ?? clause.name ?? '제목'"
                    />
                  </template>
                  <template v-else>
                    {{ clause.title ?? clause.name }}
                  </template>
                </p>
                <!-- 임대인만 수정/삭제 버튼 노출 -->
                <div v-if="isOwner" class="flex items-center gap-3 ml-4 shrink-0">
                  <button
                    class="text-yellow-primary hover:text-yellow-500"
                    title="수정"
                    @click="toggleEdit(clause)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="text-gray-500 hover:text-red-500"
                    title="삭제"
                    :disabled="deleting[clause.order]"
                    @click="confirmDelete(clause.order)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <!-- 내용 -->
              <div>
                <template v-if="isOwner && isEditing(clause.order)">
                  <div class="flex items-center gap-2">
                    <textarea
                      v-model="editContentMap[clause.order]"
                      type="text"
                      class="border rounded px-2 py-1 w-full text-sm"
                      :placeholder="clause.content ?? clause.text ?? '내용'"
                    ></textarea>
                    <BaseButton
                      class="w-14"
                      size="sm"
                      :loading="saving[clause.order]"
                      :disabled="saving[clause.order]"
                      @click="submitModification(clause.order)"
                    >
                      수정 요청
                    </BaseButton>
                    <button
                      class="text-xs w-10 text-gray-500 hover:underline"
                      @click="cancelEdit(clause.order)"
                    >
                      취소
                    </button>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm text-gray-600 whitespace-pre-wrap mt-1">
                    {{ clause.content ?? clause.text }}
                  </p>
                </template>
              </div>
            </div>
          </div>
        </li>

        <!-- 임대인만 최종 확정 버튼 노출 -->
        <!-- 임대인만 최종 확정 버튼 노출 -->
        <BaseButton
          v-if="isOwner"
          :loading="confirming"
          :disabled="confirming"
          @click="confirmFinal"
        >
          특약 최종 확정하기
        </BaseButton>
      </ul>
    </div>

    <!-- 전체 완료가 아니면: 기존 조율 목록 -->
    <div v-else>
      <div v-if="clauses.length === 0">조율 중인 특약이 없습니다.</div>
      <ul v-else class="space-y-4 bg-gray-100 p-4 rounded-md flex flex-col">
        <li
          v-for="clause in clauses"
          :key="clause.id"
          class="flex flex-col gap-2 bg-white p-4 rounded-md shadow-sm"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="w-full flex justify-between">
                <p class="text-sm font-medium">{{ clause.id }}. {{ clause.title }}</p>
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
import {
  getSpecialContractForUser,
  getFinalContract,
  getContractInfo,
  postFinalModificationRequest,
  postFinalDeletionRequest,
  postFinalConfirmRequest,
} from '@/apis/contractChatApi'
import { useSpecialContractStore } from '@/stores/useContractTermStore'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  contractChatId: { type: [String, Number], required: false },
})

const clauses = ref([])
const finalClauses = ref([])
const openDetails = ref({})
const role = ref('')

/* inline-edit 상태 */
const editing = ref({})
const editTitleMap = ref({})
const editContentMap = ref({})
const saving = ref({})
const deleting = ref({})

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

// "임대인" 문자열이 포함되면 true
const isOwner = computed(() => (role.value || '').includes('임대인'))

const fetchClauses = async (id) => {
  if (!id) return
  const res = await getSpecialContractForUser(id)
  const list = res?.clauses || []
  clauses.value = list
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

const fetchRole = async (id) => {
  try {
    const res = await getContractInfo(String(id))
    role.value = res?.data?.role || ''
  } catch (e) {
    console.error('[Step3Terms] getContractInfo 실패:', e)
    role.value = ''
  }
}

const toggleDetails = (id) => {
  openDetails.value[id] = !openDetails.value[id]
}

/* ----- inline-edit helpers ----- */
const isEditing = (order) => !!editing.value[order]

const toggleEdit = (clause) => {
  const order = clause.order ?? clause.id ?? clause.clauseId
  if (!order) return
  if (!editing.value[order]) {
    editTitleMap.value[order] = clause.title ?? clause.name ?? ''
    editContentMap.value[order] = clause.content ?? clause.text ?? ''
    editing.value[order] = true
  } else {
    // 편집 모드 종료
    editing.value[order] = false
  }
}

const cancelEdit = (order) => {
  editing.value[order] = false
}

/* 수정 요청 */
const submitModification = async (order) => {
  if (!contractChatId.value || saving.value[order]) return
  const payload = {
    clauseOrder: Number(order),
    newTitle: editTitleMap.value[order] ?? '',
    newContent: editContentMap.value[order] ?? '',
  }

  try {
    saving.value[order] = true
    await postFinalModificationRequest(contractChatId.value, payload)

    await fetchFinalClauses(contractChatId.value)
    editing.value[order] = false
  } catch (e) {
    console.error('[Step3Terms] 최종 특약 수정 요청 실패:', e)
  } finally {
    saving.value[order] = false
  }
}

const confirmDelete = async (order) => {
  if (!contractChatId.value || deleting.value[order]) return
  const ok = window.confirm('해당 최종 특약을 삭제 요청하시겠습니까?')
  if (!ok) return

  try {
    deleting.value[order] = true
    await postFinalDeletionRequest(contractChatId.value, Number(order))

    await fetchFinalClauses(contractChatId.value)
  } catch (e) {
    console.error('[Step3Terms] 최종 특약 삭제 요청 실패:', e)
  } finally {
    deleting.value[order] = false
  }
}

const confirming = ref(false)

const confirmFinal = async () => {
  if (!contractChatId.value) return
  try {
    confirming.value = true
    const res = await postFinalConfirmRequest(String(contractChatId.value))
    if (res?.success) {
      alert('최종 확정 요청을 보냈습니다. 임차인의 승인 대기 중입니다.')
    } else {
      alert(res?.message || '최종 확정 요청에 실패했습니다.')
    }
  } catch (e) {
    console.error('[Step3Terms] 최종 확정 요청 실패:', e)
    alert('최종 확정 요청 중 오류가 발생했습니다.')
  } finally {
    confirming.value = false
  }
}

watch(
  [contractChatId, isAllDone, () => store.finalContractVersion],
  async ([id, done]) => {
    if (!id) return
    await fetchRole(id)
    if (done) await fetchFinalClauses(id)
    else await fetchClauses(id)
  },
  { immediate: true },
)

watch(
  () => store.currentRound,
  async () => {
    const id = contractChatId.value
    if (!id || isAllDone.value) return
    await fetchClauses(id)
  },
)
</script>
