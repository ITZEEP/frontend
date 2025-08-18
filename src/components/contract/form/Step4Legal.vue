<template>
  <section class="flex flex-col gap-6">
    <!-- 로딩/에러 -->
    <div v-if="loading" class="py-12 text-center text-gray-500">
      적법성 분석 결과 불러오는 중...
    </div>
    <div v-else-if="error" class="py-12 text-center text-red-500">{{ error }}</div>

    <template v-else>
      <!-- 1,2단계 요약 (기존 컴포넌트 그대로 재사용) -->
      <div class="flex flex-col gap-6">
        <Step1Compare :basic="basicLocal" />
        <Step2Price :basic="basicLocal" />
      </div>

      <!-- 최종 계약서 특약 (Step3Terms의 isAllDone 뷰와 동일) -->
      <div class="w-full mt-2">
        <div class="flex items-center gap-2 mb-3">
          <i class="fa-solid fa-list-check text-yellow-primary"></i>
          <h2 class="text-lg font-semibold text-gray-800">최종 확정된 특약</h2>
        </div>

        <div v-if="finalClauses.length === 0">최종 특약이 없습니다.</div>

        <ul v-else class="w-full space-y-4 bg-gray-100 p-4 rounded-md flex flex-col">
          <li
            v-for="clause in finalClauses"
            :key="clause.order ?? clause.id ?? clause.clauseId"
            class="w-full flex flex-col gap-2 bg-white p-4 rounded-md shadow-sm"
          >
            <div class="w-full flex justify-between items-start">
              <div class="w-full flex-1">
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
                    <div class="w-full flex items-center gap-2">
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

          <!-- ✅ Step4 전용: 최종 확정 전달 로직만 변경 -->
          <!-- 임대인: 계약서 최종 확정 "요청" -->
          <BaseButton
            v-if="isOwner"
            :loading="finalBusy"
            :disabled="finalBusy"
            class="bg-yellow-primary text-white hover:bg-yellow-600"
            @click="requestFinalAccept"
          >
            계약서 최종 확정 요청하기
          </BaseButton>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { contractApi } from '@/apis/contractApi'
import {
  getContractInfo,
  postFinalModificationRequest,
  postFinalDeletionRequest,
} from '@/apis/contractChatApi'

import Step1Compare from './step1/Step1Compare.vue'
import Step2Price from './Step2Price.vue'
import { useSpecialContractStore } from '@/stores/useContractTermStore'

const props = defineProps({
  basic: { type: Object, default: null },
})

const route = useRoute()
const contractChatId = route.params.contractChatId || route.params.id || route.query.id || null
const store = useSpecialContractStore()

const loading = ref(false)
const error = ref('')
const basicLocal = ref(props.basic)

/* role 판별 (임대인/임차인) */
const role = ref('')
const isOwner = computed(() => (role.value || '').includes('임대인'))

/* 특약 목록 (최종본) */
const finalClauses = computed(() => {
  const list = basicLocal.value?.specialContracts || []
  return Array.isArray(list) ? [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []
})

const editing = ref({})
const editTitleMap = ref({})
const editContentMap = ref({})
const saving = ref({})
const deleting = ref({})

const isEditing = (order) => !!editing.value[order]
const toggleEdit = (clause) => {
  const order = clause.order ?? clause.id ?? clause.clauseId
  if (!order) return
  if (!editing.value[order]) {
    editTitleMap.value[order] = clause.title ?? clause.name ?? ''
    editContentMap.value[order] = clause.content ?? clause.text ?? ''
    editing.value[order] = true
  } else {
    editing.value[order] = false
  }
}
const cancelEdit = (order) => {
  editing.value[order] = false
}

/* 수정/삭제 요청 (order만 전달) */
const submitModification = async (order) => {
  if (!contractChatId || saving.value[order]) return
  const payload = {
    clauseOrder: Number(order),
    newTitle: editTitleMap.value[order] ?? '',
    newContent: editContentMap.value[order] ?? '',
  }
  try {
    saving.value[order] = true
    await postFinalModificationRequest(String(contractChatId), payload)
    await fetchBasic() // 변경 반영
    editing.value[order] = false
  } catch (e) {
    console.error('[Step4Legal] 최종 특약 수정 요청 실패:', e)
  } finally {
    saving.value[order] = false
  }
}

const confirmDelete = async (order) => {
  if (!contractChatId || deleting.value[order]) return
  const ok = window.confirm('해당 최종 특약을 삭제 요청하시겠습니까?')
  if (!ok) return
  try {
    deleting.value[order] = true
    await postFinalDeletionRequest(String(contractChatId), Number(order))
    await fetchBasic()
  } catch (e) {
    console.error('[Step4Legal] 최종 특약 삭제 요청 실패:', e)
  } finally {
    deleting.value[order] = false
  }
}

/* Step4 전용 최종 확정 요청/응답 */
const finalBusy = ref(false)

const requestFinalAccept = async () => {
  if (!contractChatId) return
  try {
    finalBusy.value = true
    const res = await contractApi.postRequestFinalAccept(String(contractChatId))
    if (res?.success) alert('최종 확정 요청을 보냈습니다. 임차인의 응답 대기 중입니다.')
    else alert(res?.message || '최종 확정 요청에 실패했습니다.')
  } catch (e) {
    console.error('[Step4Legal] 최종 확정 요청 실패:', e)
    alert('최종 확정 요청 중 오류가 발생했습니다.')
  } finally {
    finalBusy.value = false
  }
}

/* 기본 정보 로딩 */
const fetchBasic = async () => {
  if (!contractChatId) {
    error.value = 'contractChatId가 없습니다.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await contractApi.getContractBasic(String(contractChatId))
    if (!res?.success) {
      error.value = res?.message || '계약 기본 정보 조회에 실패했습니다.'
      return
    }
    basicLocal.value = res.data
  } catch (e) {
    console.error('[Step4Legal] getContractBasic 실패:', e)
    error.value = '계약 기본 정보 조회에 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchRole = async (id) => {
  try {
    const res = await getContractInfo(String(id))
    role.value = res?.data?.role || ''
  } catch (e) {
    console.error('[Step4Legal] getContractInfo 실패:', e)
    role.value = ''
  }
}

watch(
  () => props.basic,
  (v) => {
    if (v) basicLocal.value = v
  },
  { immediate: true, deep: true },
)

watch(
  () => store.finalContractVersion,
  async () => {
    if (contractChatId) await fetchBasic()
  },
)

onMounted(async () => {
  if (!basicLocal.value) await fetchBasic()
  if (contractChatId) await fetchRole(contractChatId)
})
</script>

<style scoped>
/* 필요 시 추가 스타일 */
</style>
