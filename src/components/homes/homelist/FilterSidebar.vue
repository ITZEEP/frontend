<template>
  <aside class="w-full md:w-64 bg-white px-4 py-6 border-r border-gray-200 space-y-6">
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

    <div>
      <h3 class="font-bold text-gray-800 mb-2">매물종류</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in ['전체', '원룸', '투룸', '빌라', '오피스텔']"
          :key="type"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.houseType === type ? 'bg-yellow-primary text-white' : 'bg-white text-gray-700',
          ]"
          @click="sethouseType(type)"
          type="button"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div>
      <h3 class="font-bold text-gray-800 mb-2">거래유형</h3>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="deal in ['월세', '전세']"
          :key="deal"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.dealType === (deal === '월세' ? 'WOLSE' : 'JEONSE')
              ? 'bg-yellow-primary text-white'
              : 'bg-white text-gray-700',
          ]"
          @click="setDealType(deal)"
          type="button"
        >
          {{ deal }}
        </button>
      </div>

      <div v-if="filters.dealType === 'WOLSE'">
        <label class="text-sm font-semibold">보증금</label>
        <input
          type="range"
          v-model="filters.depositRange"
          min="0"
          max="200000"
          step="100"
          class="w-full custom-range"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.depositRange }}만원</div>

        <label class="text-sm font-semibold mt-2">월세</label>
        <input
          type="range"
          v-model="filters.monthlyRange"
          min="0"
          max="5000"
          step="10"
          class="w-full custom-range"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.monthlyRange }}만원</div>
      </div>

      <div v-else-if="filters.dealType === 'JEONSE'">
        <label class="text-sm font-semibold">전세가</label>
        <input
          type="range"
          v-model="filters.leaseRange"
          min="0"
          max="200000"
          step="100"
          class="w-full custom-range"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.leaseRange }}만원</div>
      </div>
    </div>

    <div>
      <h3 class="font-bold text-gray-800 mb-2">평수</h3>
      <input
        type="range"
        v-model="filters.area"
        min="0"
        max="70"
        step="1"
        class="w-full custom-range"
      />
      <div class="text-xs text-gray-500">최대: {{ filters.area }}평</div>
    </div>

    <div>
      <h3 class="font-bold text-gray-800 mb-2">층수</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="floor in floors"
          :key="floor"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.floor === floor ? 'bg-yellow-primary text-white' : 'bg-white text-gray-700',
          ]"
          @click="setFloor(floor)"
          type="button"
        >
          {{ floor }}
        </button>
      </div>
    </div>

    <div>
      <h3 class="font-bold text-gray-800 mb-2">매물조건</h3>
      <div class="flex flex-col gap-1">
        <label v-for="opt in conditions" :key="opt" class="flex items-center gap-2 text-sm">
          <input type="checkbox" :value="opt" v-model="filters.conditions" />
          {{ opt }}
        </label>
      </div>
    </div>

    <div class="pt-4 space-y-2">
      <button
        class="w-full bg-yellow-primary hover:bg-yellow-500 text-white py-2 rounded font-bold"
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
  houseType: '전체',
  dealType: '전체',
  depositRange: 0,
  monthlyRange: 0,
  leaseRange: 0,
  area: 0,
  direction: null,
  floor: null,
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

function sethouseType(type) {
  // '원룸', '투룸'과 '빌라'를 분리하여 필터링
  if (type === '원룸') {
    filters.value.houseType = ['OPEN_ONE_ROOM', 'SEPARATED_ONE_ROOM']
  } else if (type === '투룸') {
    filters.value.houseType = 'TWO_ROOM'
  } else if (type === '빌라') {
    filters.value.houseType = 'VILLA'
  } else if (type === '오피스텔') {
    filters.value.houseType = 'OFFICETEL'
  } else {
    filters.value.houseType = '전체'
  }
}

function setDealType(deal) {
  if (deal === '월세') {
    filters.value.dealType = 'WOLSE'
  } else if (deal === '전세') {
    filters.value.dealType = 'JEONSE'
  } else {
    filters.value.dealType = '전체'
  }
}

function setFloor(floor) {
  filters.value.floor = filters.value.floor === floor ? null : floor
}

function resetFilters() {
  filters.value = {
    city: '전체',
    district: '전체',
    houseType: '전체',
    dealType: '전체',
    depositRange: 0,
    monthlyRange: 0,
    leaseRange: 0,
    area: 0,
    direction: null,
    floor: null,
    conditions: [],
  }
  districtList.value = []
  emit('filter-change', filters.value)
}

function emitFilterChange() {
  emit('filter-change', filters.value)
}

const floors = ['반지하', '1층', '2~5층', '6~9층', '10층 이상']
const conditions = ['주차 가능', '반려동물 가능', '엘리베이터']
</script>
