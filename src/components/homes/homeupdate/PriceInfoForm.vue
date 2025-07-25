<template>
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">거래 정보</h2>

    <!-- 거래 유형 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">거래 유형</label>
      <div class="flex gap-2">
        <button
          v-for="type in ['월세', '전세']"
          :key="type"
          :class="[
            'px-4 py-2 rounded',
            거래유형 === type ? 'bg-yellow-primary text-white' : 'bg-gray-200',
          ]"
          @click="거래유형 = type"
          type="button"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- 보증금, 월세, 관리비 -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <BaseInput v-model="보증금" label="보증금" placeholder="예: 1000" type="number" min="0" />
      <BaseInput v-model="월세" label="월세" placeholder="예: 100" type="number" min="0" />
      <BaseInput v-model="관리비" label="관리비" placeholder="예: 10" type="number" min="0" />
    </div>

    <!-- 관리비 포함 항목 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">관리비 포함 항목</label>
      <div class="grid grid-cols-4 gap-2">
        <label
          v-for="item in ['전기료', '수도료', '인터넷', '케이블 TV', '가스료', '난방비']"
          :key="item"
        >
          <input type="checkbox" v-model="관리비포함항목" :value="item" />
          {{ item }}
        </label>
      </div>
    </div>

    <!-- 입주 가능일 -->
    <div>
      <label for="move-in-date" class="block text-sm font-medium text-gray-700 mb-1">
        입주 가능일
      </label>
      <input
        type="date"
        id="move-in-date"
        v-model="입주가능일"
        class="border rounded px-3 py-2 w-full"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'

const 거래유형 = ref('월세')
const 보증금 = ref(null)
const 월세 = ref(null)
const 관리비 = ref(null)
const 관리비포함항목 = ref([])
const 입주가능일 = ref('')
</script>
