<template>
  <form @submit.prevent="onSubmit" class="max-w-4xl mx-auto p-6 space-y-6 rounded-md">
    <h2 class="text-lg font-semibold text-gray mb-2">시설 정보</h2>
    <p class="mb-4 text-gray-700">
      해당되는 시설을 모두 선택해주세요. 임차인이 확인할 수 있습니다.
    </p>

    <fieldset
      v-for="(items, category) in utilityItems"
      :key="category"
      class="border border-gray-300 rounded-md p-4"
    >
      <legend class="font-semibold mb-2">{{ categoryLabels[category] }}</legend>
      <div class="flex flex-wrap gap-6">
        <BaseCheckBox
          v-for="item in items"
          :key="item.id"
          :label="item.name"
          :modelValue="localSelectedIds.includes(item.id)"
          @update:modelValue="(checked) => updateCheckbox(item.id, checked)"
        />
      </div>
    </fieldset>

    <div class="border border-gray-300 rounded-md p-4">
      <h3 class="font-semibold mb-2">기타 상세 정보</h3>
      <div class="flex flex-wrap gap-6">
        <BaseCheckBox
          label="반려동물 가능"
          :modelValue="localIsPet"
          @update:modelValue="(checked) => updateToggleOption('isPet', checked)"
        />
        <BaseCheckBox
          label="주차 가능"
          :modelValue="localIsParking"
          @update:modelValue="(checked) => updateToggleOption('isParking', checked)"
        />
      </div>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      facilityItemIds: [],
      isPet: false,
      isParking: false,
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const localSelectedIds = ref([...props.modelValue.facilityItemIds])
const localIsPet = ref(props.modelValue.isPet)
const localIsParking = ref(props.modelValue.isParking)

watch(
  () => props.modelValue.facilityItemIds,
  (newVal) => {
    localSelectedIds.value = [...newVal]
  },
)

watch(
  () => props.modelValue.isPet,
  (newVal) => {
    localIsPet.value = newVal
  },
)

watch(
  () => props.modelValue.isParking,
  (newVal) => {
    localIsParking.value = newVal
  },
)

const allValidIds = computed(() => {
  return Object.values(utilityItems)
    .flat()
    .map((item) => item.id)
})

const utilityItems = {
  appliances: [
    { id: 1, name: '에어컨' },
    { id: 2, name: '세탁기' },
    { id: 3, name: '냉장고' },
    { id: 4, name: '전자레인지' },
    { id: 16, name: 'TV' },
    { id: 19, name: '인덕션' },
    { id: 20, name: '가스렌지' },
    { id: 22, name: '벽걸이 에어컨' },
    { id: 23, name: '빌트인 에어컨' },
  ],
  furniture: [
    { id: 5, name: '침대' },
    { id: 6, name: '책상' },
    { id: 7, name: '옷장' },
    { id: 8, name: '소파' },
    { id: 24, name: '욕조' },
    { id: 25, name: '싱크대' },
    { id: 28, name: '붙박이장' },
    { id: 29, name: '신발장' },
  ],
  security: [
    { id: 9, name: '도어락' },
    { id: 10, name: 'CCTV' },
    { id: 11, name: '인터폰' },
    { id: 34, name: '카드키' },
    { id: 35, name: '방범창' },
    { id: 36, name: '경비' },
    { id: 37, name: '화재경보기' },
    { id: 38, name: '소화기' },
    { id: 39, name: '현관보안' },
  ],
  convenience: [
    { id: 12, name: '엘리베이터' },
    { id: 14, name: '택배보관함' },
    { id: 41, name: '전체난방' },
  ],
}

const categoryLabels = {
  appliances: '가전제품',
  furniture: '가구',
  security: '보안시설',
  convenience: '편의시설',
}

function updateCheckbox(itemId, checked) {
  const numericItemId = Number(itemId)
  const currentIds = new Set(localSelectedIds.value)

  if (!allValidIds.value.includes(numericItemId)) {
    console.warn(`Attempted to update an invalid itemId: ${itemId}`)
    return
  }

  if (checked) {
    currentIds.add(numericItemId)
  } else {
    currentIds.delete(numericItemId)
  }

  localSelectedIds.value = Array.from(currentIds)
  emit('update:modelValue', {
    ...props.modelValue,
    facilityItemIds: localSelectedIds.value,
  })
}

function updateToggleOption(key, checked) {
  if (key === 'isPet') {
    localIsPet.value = checked
  } else if (key === 'isParking') {
    localIsParking.value = checked
  }
  emit('update:modelValue', {
    ...props.modelValue,
    isPet: localIsPet.value,
    isParking: localIsParking.value,
  })
}
</script>
