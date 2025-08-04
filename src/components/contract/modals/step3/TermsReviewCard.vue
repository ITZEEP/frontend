<template>
  <div class="bg-white border rounded-xl p-4 shadow-sm">
    <div class="flex items-start justify-between mb-2">
      <div>
        <p class="text-sm font-semibold text-gray-900">{{ clause.title }}</p>
        <p class="text-sm text-gray-600 mt-1">{{ clause.content }}</p>
      </div>
      <div class="flex gap-1">
        <button
          @click="select('check')"
          :class="[
            'w-8 h-8 rounded-full flex justify-center items-center p-0 leading-none text-center',
            selected === 'check' ? 'bg-green-100' : 'hover:bg-green-100',
          ]"
        >
          <CheckIcon class="w-4 h-4" />
        </button>
        <button
          @click="select('x')"
          :class="[
            'w-8 h-8 rounded-full flex justify-center items-center p-0 leading-none text-center',
            selected === 'x' ? 'bg-red-100' : 'hover:bg-red-100',
          ]"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 평가 박스 (주의 / 안심) -->
    <div v-if="clause.assessment" class="mt-3">
      <div
        v-if="clause.assessment.owner.level === '주의'"
        class="bg-red-50 border danger-box rounded-md p-3 text-sm"
      >
        <div class="flex items-center gap-1 mb-1 font-semibold">⚠️ 주의</div>
        <p class="text-xm text-gray-700 font-light text-left">
          {{ clause.assessment.owner.reason }}
        </p>
      </div>

      <div
        v-else-if="clause.assessment.owner.level === '안심'"
        class="safe-box rounded-md p-3 text-sm"
      >
        <div class="flex items-center gap-1 mb-1 font-semibold">✅ 안심</div>
        <p class="text-xm text-gray-700 font-light text-left">
          {{ clause.assessment.owner.reason }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CheckIcon from '@/assets/icons/CheckIcon.vue'
import XIcon from '@/assets/icons/XIcon.vue'

defineProps({
  clause: Object,
})

// 선택 상태: 'check', 'x', null
const selected = ref(null)

const select = (type) => {
  selected.value = type
}
</script>
