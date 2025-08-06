<template>
  <div class="bg-white p-6 rounded-lg space-y-6">
    <h2 class="text-lg font-semibold">시설 정보</h2>

    <!-- 건물 정보 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">건물 정보</label>
      <div class="flex gap-4">
        <BaseCheckbox v-model="localListing.buildingFacilities.elevator" label="엘리베이터" />
      </div>
    </div>

    <!-- 생활 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">생활 시설</label>
      <div class="grid grid-cols-3 gap-2">
        <BaseCheckbox
          v-for="item in livingFacilitiesList"
          :key="item"
          :label="item"
          :modelValue="localListing.livingFacilities.includes(item)"
          @update:modelValue="
            (checked) => updateArray(localListing.livingFacilities, item, checked)
          "
        />
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
          @click="localListing.selectedHeating = option"
          :class="[
            'px-4 py-2 rounded border',
            localListing.selectedHeating === option
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
          @click="localListing.selectedCooling = option"
          :class="[
            'px-4 py-2 rounded border',
            localListing.selectedCooling === option
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
        <BaseCheckbox
          v-for="item in securityFacilitiesList"
          :key="item"
          :label="item"
          :modelValue="localListing.securityFacilities.includes(item)"
          @update:modelValue="
            (checked) => updateArray(localListing.securityFacilities, item, checked)
          "
        />
      </div>
    </div>

    <!-- 기타 시설 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">기타 시설</label>
      <div class="grid grid-cols-3 gap-2">
        <BaseCheckbox
          v-for="item in otherFacilitiesList"
          :key="item"
          :label="item"
          :modelValue="localListing.otherFacilities.includes(item)"
          @update:modelValue="(checked) => updateArray(localListing.otherFacilities, item, checked)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])

// reactive 복사본 (로컬 상태)
const localListing = reactive({
  buildingFacilities: props.modelValue.buildingFacilities || { elevator: false },
  livingFacilities: props.modelValue.livingFacilities || [],
  selectedHeating: props.modelValue.selectedHeating || null,
  selectedCooling: props.modelValue.selectedCooling || null,
  securityFacilities: props.modelValue.securityFacilities || [],
  otherFacilities: props.modelValue.otherFacilities || [],
})

// props 변경 감지 후 동기화
watch(
  () => props.modelValue,
  (newVal) => {
    localListing.buildingFacilities = newVal.buildingFacilities || { elevator: false }
    localListing.livingFacilities = newVal.livingFacilities || []
    localListing.selectedHeating = newVal.selectedHeating || null
    localListing.selectedCooling = newVal.selectedCooling || null
    localListing.securityFacilities = newVal.securityFacilities || []
    localListing.otherFacilities = newVal.otherFacilities || []
  },
  { deep: true },
)

// localListing 변경 시 부모에 emit
watch(
  localListing,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true },
)

// 체크박스 목록
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

const heatingOptions = ['개별난방', '전체난방']
const coolingOptions = ['벽걸이 에어컨', '빌트인 에어컨']

const securityFacilitiesList = ['현관보안', 'CCTV', '인터폰', '카드키 도어락', '방범창', '경비']

const otherFacilitiesList = ['화재 경보기', '소화기', '주차']

// 배열에 항목 추가/삭제 함수
function updateArray(arr, item, checked) {
  if (checked && !arr.includes(item)) {
    arr.push(item)
  } else if (!checked && arr.includes(item)) {
    const idx = arr.indexOf(item)
    if (idx > -1) arr.splice(idx, 1)
  }
}
</script>
