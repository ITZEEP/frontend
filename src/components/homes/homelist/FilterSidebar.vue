<template>
  <aside class="w-full md:w-64 bg-white px-4 py-6 border-r border-gray-200 space-y-6">
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 md:hidden text-gray-500 hover:text-gray-800"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>

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
          v-for="type in houseTypes"
          :key="type.value"
          :class="[
            'px-3 py-1 border rounded-full text-sm',
            filters.houseType === type.value
              ? 'bg-yellow-primary text-white'
              : 'bg-white text-gray-700',
          ]"
          @click="setHouseType(type.value)"
          type="button"
        >
          {{ type.label }}
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
          max="30000"
          step="10"
          class="w-full custom-range-deposit"
          ref="depositRangeInput"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.depositRange }}만원</div>

        <label class="text-sm font-semibold mt-2">월세</label>
        <input
          type="range"
          v-model="filters.monthlyRange"
          min="0"
          max="500"
          step="5"
          class="w-full custom-range-monthly"
          ref="monthlyRangeInput"
        />
        <div class="text-xs text-gray-500">최대: {{ filters.monthlyRange }}만원</div>
      </div>

      <div v-else-if="filters.dealType === 'JEONSE'">
        <label class="text-sm font-semibold">전세가</label>
        <input
          type="range"
          v-model="filters.leaseRange"
          min="0"
          max="80000"
          step="10"
          class="w-full custom-range-lease"
          ref="leaseRangeInput"
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
        class="w-full custom-range-area"
        ref="areaRangeInput"
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
        <BaseCheckbox
          v-for="opt in conditions"
          :key="opt"
          :label="opt"
          :modelValue="filters.conditions.includes(opt)"
          @update:modelValue="toggleCondition(opt)"
        />
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
import { onMounted, ref, watch } from 'vue'
import { guToDong } from './gu-to-dong'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const emit = defineEmits(['filter-change', 'close'])

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
  conditions: [], // 초기값은 빈 배열이어야 합니다.
})

const depositRangeInput = ref(null)
const monthlyRangeInput = ref(null)
const leaseRangeInput = ref(null)
const areaRangeInput = ref(null)

const guList = Object.keys(guToDong)
const districtList = ref([])

const houseTypes = [
  { label: '전체', value: '전체' },
  { label: '오픈형 원룸', value: 'OPEN_ONE_ROOM' },
  { label: '분리형 원룸', value: 'SEPARATED_ONE_ROOM' },
  { label: '투룸', value: 'TWO_ROOM' },
  { label: '빌라', value: 'VILLA' },
  { label: '오피스텔', value: 'OFFICETEL' },
]

function onCityChange() {
  if (filters.value.city === '전체') {
    districtList.value = []
    filters.value.district = '전체'
  } else {
    districtList.value = guToDong[filters.value.city] || []
    filters.value.district = '전체'
  }
}

function setHouseType(type) {
  filters.value.houseType = type
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
  const payload = {
    ...filters.value,
    conditions: filters.value.conditions,
  }
  emit('filter-change', payload)
}

const floors = ['1층', '2~5층', '6~9층', '10층 이상']
const conditions = ['주차 가능', '반려동물 가능', '엘리베이터']

// 새롭게 추가된 로직: 체크박스 상태를 수동으로 토글
function toggleCondition(condition) {
  const index = filters.value.conditions.indexOf(condition)
  if (index > -1) {
    filters.value.conditions.splice(index, 1)
  } else {
    filters.value.conditions.push(condition)
  }
}

function updateRangeProgress(inputElement, value, max) {
  if (inputElement) {
    const percentage = (value / max) * 100
    inputElement.style.setProperty('--range-progress', `${percentage}%`)
  }
}

watch(
  () => filters.value.depositRange,
  (newValue) => {
    updateRangeProgress(depositRangeInput.value, newValue, 30000)
  },
)
watch(
  () => filters.value.monthlyRange,
  (newValue) => {
    updateRangeProgress(monthlyRangeInput.value, newValue, 500)
  },
)
watch(
  () => filters.value.leaseRange,
  (newValue) => {
    updateRangeProgress(leaseRangeInput.value, newValue, 80000)
  },
)
watch(
  () => filters.value.area,
  (newValue) => {
    updateRangeProgress(areaRangeInput.value, newValue, 70)
  },
)

onMounted(() => {
  updateRangeProgress(depositRangeInput.value, filters.value.depositRange, 30000)
  updateRangeProgress(monthlyRangeInput.value, filters.value.monthlyRange, 500)
  updateRangeProgress(leaseRangeInput.value, filters.value.leaseRange, 80000)
  updateRangeProgress(areaRangeInput.value, filters.value.area, 70)
})
</script>

<style scoped>
/* 커스텀 CSS는 그대로 유지 */
input[type='range'] {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: transparent;
  border-radius: 4px;
}

input[type='range']::-webkit-slider-runnable-track {
  background: #e5e7eb;
  border-radius: 4px;
  height: 8px;
}

input[type='range']::-moz-range-track {
  background: #e5e7eb;
  border-radius: 4px;
  height: 8px;
}

input[type='range']::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  background-color: #facc15;
  border-radius: 4px;
  width: var(--range-progress, 0%);
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #facc15;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -4px;
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #facc15;
  border-radius: 50%;
  cursor: pointer;
}

.custom-range-deposit,
.custom-range-monthly,
.custom-range-lease,
.custom-range-area {
  position: relative;
  overflow: hidden;
}

input[type='range']::-ms-fill-lower {
  background: #facc15;
  border-radius: 4px;
}
</style>
