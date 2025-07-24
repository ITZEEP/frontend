<template>
  <div class="flex flex-col gap-4 w-full">
    <h2 class="text-gray-warm-700 font-bold">원상복구 및 입주 상태 기록</h2>
    <ToggleRadio
      label="퇴거 시 원상복구 범위는 어떻게 되나요?"
      v-model="restoreCategory"
      :options="[
        { label: '벽지', value: 'wallpaper' },
        { label: '장판', value: 'floor' },
        { label: '못자국 등 모두', value: 'all' },
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
import ToggleRadio from '@/components/common/ToggleRadio.vue'
import { ref, computed } from 'vue'
import { usePreContractStore } from '@/stores/ownerPreContractStore'

const store = usePreContractStore()
const rentType = computed(() => store.rent_type)

const restoreCategory = ref('')
const hasConditionLog = ref(null)
const hasPenalty = ref(null)
const hasPriorityExtension = ref(null)
const hasAutoPriceAdjustment = ref(null)
const allowJeonseRight = ref(null)

const autoAdjustmentLabel = computed(() =>
  rentType.value === 'JEONSE'
    ? '계약 갱신 시 보증금이 자동으로 조정되나요?'
    : '계약 갱신 시 보증금 또는 월세가 자동으로 조정되나요?',
)
</script>
