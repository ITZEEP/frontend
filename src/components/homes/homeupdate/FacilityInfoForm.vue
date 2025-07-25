<template>
  <div class="bg-white p-6 rounded-lg space-y-6">
    <h2 class="text-lg font-semibold">시설 정보</h2>

    <!-- 건물 정보 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">건물 정보</label>
      <div class="flex gap-4">
        <label><input type="checkbox" v-model="buildingFacilities.elevator" /> 엘리베이터</label>
      </div>
    </div>

    <!-- 생활 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">생활 시설</label>
      <div class="grid grid-cols-3 gap-2">
        <label v-for="item in livingFacilitiesList" :key="item">
          <input type="checkbox" v-model="livingFacilities" :value="item" /> {{ item }}
        </label>
      </div>
    </div>

    <!-- 난방 방식 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">난방 방식</label>
      <div class="flex gap-2">
        <button
          v-for="option in heatingOptions"
          :key="option"
          type="button"
          @click="selectedHeating = option"
          :class="[
            'px-4 py-2 rounded border',
            selectedHeating === option
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white border-gray-300',
          ]"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <!-- 냉방 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">냉방 시설</label>
      <div class="flex gap-2">
        <button
          v-for="option in coolingOptions"
          :key="option"
          type="button"
          @click="selectedCooling = option"
          :class="[
            'px-4 py-2 rounded border',
            selectedCooling === option
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white border-gray-300',
          ]"
        >
          {{ option }}
        </button>
      </div>
    </div>

    <!-- 보안 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">보안 시설</label>
      <div class="grid grid-cols-3 gap-2">
        <label v-for="item in securityFacilitiesList" :key="item">
          <input type="checkbox" v-model="securityFacilities" :value="item" /> {{ item }}
        </label>
      </div>
    </div>

    <!-- 기타 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">기타 시설</label>
      <div class="grid grid-cols-3 gap-2">
        <label v-for="item in otherFacilitiesList" :key="item">
          <input type="checkbox" v-model="otherFacilities" :value="item" /> {{ item }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 체크박스 및 선택 버튼용 상태
const buildingFacilities = ref({
  elevator: false,
})

const livingFacilitiesList = [
  '에어컨',
  'TV',
  '세탁기',
  '냉장고',
  '인덕션',
  '가스레인지',
  '인덕션레인지',
  '전자레인지',
  '욕조',
  '싱크대',
  '책상',
  '옷장',
  '붙박이장',
  '신발장',
]
const livingFacilities = ref([])

const heatingOptions = ['개별난방', '전체난방']
const selectedHeating = ref(null)

const coolingOptions = ['벽걸이 에어컨', '빌트인 에어컨']
const selectedCooling = ref(null)

const securityFacilitiesList = ['현관보안', 'CCTV', '인터폰', '카드키 도어락', '방범창', '경비']
const securityFacilities = ref([])

const otherFacilitiesList = ['화재 경보기', '소화기', '주차']
const otherFacilities = ref([])
</script>
