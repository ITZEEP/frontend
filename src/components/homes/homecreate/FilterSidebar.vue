<template>
  <aside class="w-full md:w-64 bg-white px-4 py-6 border-r border-gray-200 space-y-6">
    <!-- 지역 선택 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">지역선택</h3>
      <select
        v-model="filters.city"
        class="w-full border rounded px-2 py-1 mb-2"
        @change="onCityChange"
      >
        <option value="전체">구 선택</option>
        <option v-for="gu in guList" :key="gu" :value="gu">{{ gu }}</option>
      </select>

      <select
        v-model="filters.district"
        class="w-full border rounded px-2 py-1"
        :disabled="districtList.length === 0"
      >
        <option value="전체">동 선택</option>
        <option v-for="dong in districtList" :key="dong" :value="dong">{{ dong }}</option>
      </select>
    </div>

    <!-- 매물종류 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">매물종류</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in ['전체', '원룸', '투룸/빌라', '오피스텔']"
          :key="type"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.propertyType === type ? 'bg-yellow-400 text-white' : 'bg-white text-gray-700',
          ]"
          @click="setPropertyType(type)"
          type="button"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- 거래유형 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">거래유형</h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="deal in ['월세', '전세']"
          :key="deal"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.dealType === deal ? 'bg-yellow-400 text-white' : 'bg-white text-gray-700',
          ]"
          @click="setDealType(deal)"
          type="button"
        >
          {{ deal }}
        </button>
      </div>

      <!-- 월세 -->
      <div v-if="filters.dealType === '월세'">
        <label class="text-sm font-semibold">보증금</label>
        <input
          type="range"
          v-model="filters.depositRange"
          min="0"
          max="200000"
          step="100"
          class="w-full accent-yellow-400"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.depositRange }}만원</div>

        <label class="text-sm font-semibold mt-2">월세</label>
        <input
          type="range"
          v-model="filters.monthlyRange"
          min="0"
          max="5000"
          step="10"
          class="w-full accent-yellow-400"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.monthlyRange }}만원</div>
      </div>

      <!-- 전세 -->
      <div v-else-if="filters.dealType === '전세'">
        <label class="text-sm font-semibold">전세가</label>
        <input
          type="range"
          v-model="filters.leaseRange"
          min="0"
          max="200000"
          step="100"
          class="w-full accent-yellow-400"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.leaseRange }}만원</div>
      </div>
    </div>

    <!-- 평수 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">평수</h3>
      <input
        type="range"
        v-model="filters.sizeRange"
        min="0"
        max="70"
        step="1"
        class="w-full accent-yellow-400"
      />
      <div class="text-xs text-gray-500">최대: {{ filters.sizeRange }}평</div>
    </div>

    <!-- 방향 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">방향</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="dir in directions"
          :key="dir"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.directions.includes(dir)
              ? 'bg-yellow-400 text-white'
              : 'bg-white text-gray-700',
          ]"
          @click="toggleDirection(dir)"
          type="button"
        >
          {{ dir }}
        </button>
      </div>
    </div>

    <!-- 층수 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">층수</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="floor in floors"
          :key="floor"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.floors.includes(floor) ? 'bg-yellow-400 text-white' : 'bg-white text-gray-700',
          ]"
          @click="toggleFloor(floor)"
          type="button"
        >
          {{ floor }}
        </button>
      </div>
    </div>

    <!-- 매물조건 -->
    <div>
      <h3 class="font-bold text-gray-800 mb-2">매물조건</h3>
      <div class="flex flex-col gap-1">
        <label v-for="opt in conditions" :key="opt" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :value="opt" v-model="filters.conditions" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="pt-4 space-y-2">
      <button
        class="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded font-bold"
        type="button"
        @click="emitFilterChange"
      >
        검색
      </button>
      <button
        class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-bold"
        type="button"
        @click="resetFilters"
      >
        초기화
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { guToDong } from './gu-to-dong'

const emit = defineEmits(['filter-change'])

const filters = ref({
  city: '전체',
  district: '전체',
  propertyType: '전체',
  dealType: '월세',
  depositRange: 500,
  monthlyRange: 50,
  leaseRange: 10000,
  sizeRange: 30,
  directions: [],
  floors: [],
  conditions: [],
})

const guList = Object.keys(guToDong)
const districtList = ref([])

function onCityChange() {
  if (filters.value.city === '전체') {
    districtList.value = []
    filters.value.district = '전체'
  } else {
    districtList.value = guToDong[filters.value.city] || []
    filters.value.district = '전체'
  }
}

function toggleDirection(dir) {
  const index = filters.value.directions.indexOf(dir)
  if (index >= 0) filters.value.directions.splice(index, 1)
  else filters.value.directions.push(dir)
}

function toggleFloor(floor) {
  const index = filters.value.floors.indexOf(floor)
  if (index >= 0) filters.value.floors.splice(index, 1)
  else filters.value.floors.push(floor)
}

function resetFilters() {
  filters.value = {
    city: '전체',
    district: '전체',
    propertyType: '전체',
    dealType: '월세',
    depositRange: 500, // 수정: 초기값과 일치시킴
    monthlyRange: 50,
    leaseRange: 10000,
    sizeRange: 30,
    directions: [],
    floors: [],
    conditions: [],
  }
  districtList.value = []
  emit('filter-change', filters.value)
}

function setPropertyType(type) {
  filters.value.propertyType = type
}

function setDealType(deal) {
  filters.value.dealType = deal
}

function emitFilterChange() {
  emit('filter-change', filters.value)
}

// filters 객체 변경시 자동 emit (선택적)
// watch(filters, (newVal) => {
//   emit('filter-change', newVal)
// }, { deep: true })

const directions = ['남향', '동향', '서향', '북향', '남동향', '남서향', '북동향', '북서향']
const floors = ['반지하', '1층', '2~5층', '6~9층', '10층 이상']
const conditions = ['주차 가능', '반려동물 가능', '대출 가능', '엘리베이터', '옥탑', '복층', '신축']
</script>

<style>
input[type='range'].accent-yellow-400::-webkit-slider-thumb {
  background-color: #facc15;
}

input[type='range'].accent-yellow-400::-moz-range-thumb {
  background-color: #facc15;
}

input[type='range'].accent-yellow-400::-ms-thumb {
  background-color: #facc15;
}
</style>
