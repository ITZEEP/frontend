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
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const localSelectedIds = ref([...props.modelValue])

// 'itemMap'은 이제 사용되지 않습니다.
const utilityItems = {
  appliances: [
    { id: 1, name: '에어컨' },
    { id: 2, name: '세탁기' },
    { id: 3, name: '냉장고' },
    { id: 4, name: '전자레인지' },
    { id: 5, name: 'TV' },
    { id: 6, name: '인덕션' },
    { id: 7, name: '가스레인지' },
    { id: 8, name: '벽걸이 에어컨' },
    { id: 9, name: '빌트인 에어컨' },
  ],
  furniture: [
    { id: 10, name: '침대' },
    { id: 11, name: '책상' },
    { id: 12, name: '옷장' },
    { id: 13, name: '소파' },
    { id: 14, name: '욕조' },
    { id: 15, name: '싱크대' },
    { id: 16, name: '붙박이장' },
    { id: 17, name: '신발장' },
  ],
  security: [
    { id: 18, name: '도어락' },
    { id: 19, name: 'CCTV' },
    { id: 20, name: '인터폰' },
    { id: 21, name: '카드키' },
    { id: 22, name: '방범창' },
    { id: 23, name: '경비' },
    { id: 24, name: '화재경보기' },
    { id: 25, name: '소화기' },
    { id: 26, name: '현관보안' },
  ],
  convenience: [
    { id: 27, name: '엘리베이터' },
    { id: 28, name: '주차장' },
    { id: 29, name: '택배보관함' },
    { id: 30, name: '전체난방' },
    { id: 31, name: '반려동물 가능' },
  ],
}

const categoryLabels = {
  appliances: '가전제품',
  furniture: '가구',
  security: '보안시설',
  convenience: '편의시설',
}

function updateCheckbox(itemId, checked) {
  const index = localSelectedIds.value.indexOf(itemId)
  if (checked && index === -1) {
    localSelectedIds.value.push(itemId)
  } else if (!checked && index !== -1) {
    localSelectedIds.value.splice(index, 1)
  }
  emit('update:modelValue', localSelectedIds.value)
}

watch(
  () => props.modelValue,
  (newVal) => {
    localSelectedIds.value = [...newVal]
  },
  { deep: true },
)
</script>

<style scoped>
/* Tailwind 사용 중이므로 커스텀 스타일은 생략 */
</style>
