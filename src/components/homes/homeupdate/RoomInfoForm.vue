<template>
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">기본 정보</h2>

    <!-- 방 수 버튼 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">방 수</label>
      <div class="flex gap-2">
        <button
          v-for="num in 5"
          :key="num"
          type="button"
          @click="selectedRooms = num"
          :class="[
            'px-4 py-2 rounded border',
            selectedRooms === num
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-white border-gray-300',
          ]"
        >
          {{ num }}개
        </button>
      </div>
    </div>

    <!-- 욕실 수 버튼 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">욕실 수</label>
      <div class="flex gap-2">
        <button
          v-for="num in 3"
          :key="num"
          type="button"
          @click="selectedBathrooms = num"
          :class="[
            'px-4 py-2 rounded border',
            selectedBathrooms === num
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-white border-gray-300',
          ]"
        >
          {{ num }}개
        </button>
      </div>
    </div>

    <!-- 방향 버튼 -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">방향</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="dir in directions"
          :key="dir"
          type="button"
          @click="selectedDirection = dir"
          :class="[
            'px-4 py-2 rounded border',
            selectedDirection === dir
              ? 'bg-yellow-500 text-white border-yellow-500'
              : 'bg-white border-gray-300',
          ]"
        >
          {{ dir }}
        </button>
      </div>
    </div>

    <!-- 상세내용 -->
    <div>
      <label for="details" class="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
      <textarea
        id="details"
        v-model="details"
        rows="5"
        placeholder="매물에 대한 상세한 설명을 입력하세요."
        class="w-full border rounded p-3 resize-none"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedRooms = ref(null)
const selectedBathrooms = ref(null)
const selectedDirection = ref(null)
const details = ref('')

const directions = ['동향', '서향', '남향', '북향', '동남향', '동북향', '서남향', '서북향']
</script>
