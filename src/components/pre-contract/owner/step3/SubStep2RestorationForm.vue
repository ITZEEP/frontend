<template>
  <div class="flex flex-col gap-4 w-full">
    <h2 class="text-gray-warm-700 font-bold">원상복구 및 입주 상태 기록</h2>
    <ToggleCheckbox
      label="퇴거 시 원상복구 범위는 어떻게 되나요?"
      v-model="restoreCategory"
      :options="[
        { label: '바닥재', value: '바닥재' },
        { label: '배관', value: '배관' },
        { label: '벽지/도배', value: '벽지/도배' },
        { label: '전기시설', value: '전기시설' },
        { label: '타일', value: '타일' },
        { label: '페인트', value: '페인트' },
      ]"
    />

    <ToggleRadio
      label="입주 상태를 사진·영상으로 기록하고 계약서에 명시할 예정인가요?"
      v-model="hasConditionLog"
      :options="[
        { label: '예', value: true },
        { label: '아니오', value: false },
      ]"
    />

    <h2 class="text-gray-warm-700 font-bold">계약 조항</h2>
    <ToggleRadio
      label="임차인이 중도 퇴거할 경우 위약금 조건이 있나요?"
      v-model="hasPenalty"
      :options="[
        { label: '있음', value: true },
        { label: '없음', value: false },
      ]"
    />
    <ToggleRadio
      label="계약 연장 시 기존 세입자와 우선 협의 조건이 있나요?"
      v-model="hasPriorityExtension"
      :options="[
        { label: '있음', value: true },
        { label: '없음', value: false },
      ]"
    />
    <ToggleRadio
      :label="autoAdjustmentLabel"
      v-model="hasAutoPriceAdjustment"
      :options="[
        { label: '예', value: true },
        { label: '아니오', value: false },
      ]"
    />

    <!-- 전세 조건 -->
    <div v-if="rentType === 'JEONSE'">
      <h2 class="text-gray-warm-700 font-bold">전세 조건</h2>
      <ToggleRadio
        label="전세권 설정을 허용하나요?"
        v-model="allowJeonseRight"
        :options="[
          { label: '허용', value: true },
          { label: '불허', value: false },
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import ToggleCheckbox from '@/components/common/ToggleCheckbox.vue'
import { usePreContractStore } from '@/stores/preContract'
import { useRoute } from 'vue-router'
import { OwnerPreContractAPI } from '@/apis/preContractOwner'

const store = usePreContractStore()
const route = useRoute()
const contractChatId = route.params.id

const rentType = computed(() => localStorage.getItem('rent_type'))

const autoAdjustmentLabel = computed(() =>
  rentType.value === 'JEONSE'
    ? '계약 갱신 시 보증금이 자동으로 조정되나요?'
    : '계약 갱신 시 보증금 또는 월세가 자동으로 조정되나요?',
)

const restoreCategory = ref([])
const hasConditionLog = ref(false)
const hasPenalty = ref(false)
const hasPriorityExtension = ref(false)
const hasAutoPriceAdjustment = ref(false)
const allowJeonseRight = ref(false)
const isInitialized = ref(false)

watch(
  [
    restoreCategory,
    hasConditionLog,
    hasPenalty,
    hasPriorityExtension,
    hasAutoPriceAdjustment,
    allowJeonseRight,
    rentType,
  ],
  ([restore, log, penalty, priority, auto, jeonse, lease]) => {
    const commonValid =
      restore.length > 0 &&
      typeof log === 'boolean' &&
      typeof penalty === 'boolean' &&
      typeof priority === 'boolean' &&
      typeof auto === 'boolean'

    const isValid = lease === 'JEONSE' ? commonValid && typeof jeonse === 'boolean' : commonValid

    store.setCanProceed(isValid)
  },
)

onMounted(async () => {
  if (!isInitialized.value) {
    store.setCanProceed(false)
    try {
      const response = await OwnerPreContractAPI.getContractStep2(contractChatId)
      const data = response.data

      restoreCategory.value = data.restoreCategories ?? []
      hasConditionLog.value = data.hasConditionLog ?? false
      hasPenalty.value = data.hasPenalty ?? false
      hasPriorityExtension.value = data.hasPriorityForExtension ?? false
      hasAutoPriceAdjustment.value = data.hasAutoPriceAdjustment ?? false
      allowJeonseRight.value = data.allowJeonseRightRegistration ?? false
    } catch (error) {
      console.error('계약 정보 설정 Step 2 조회 실패', error)
    }
    isInitialized.value = true
  }
})
</script>
