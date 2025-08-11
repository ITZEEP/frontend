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
          :key="item"
          :label="item"
          :modelValue="(form[category] ?? []).includes(item)"
          @update:modelValue="(checked) => updateCheckbox(category, item, checked)"
        />
      </div>
    </fieldset>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'

// props 및 emit
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

// 모든 카테고리 키
const categories = ['appliances', 'furniture', 'security', 'convenience']

// reactive form 초기화
const form = reactive({})
categories.forEach((key) => {
  form[key] = [...(props.modelValue[key] ?? [])]
})

// 카테고리 → 한글 라벨 (DB 기준)
const categoryLabels = {
  appliances: '가전제품',
  furniture: '가구',
  security: '보안시설',
  convenience: '편의시설',
}

// 카테고리별 항목 (DB 기준)
const utilityItems = {
  appliances: [
    '에어컨',
    '세탁기',
    '냉장고',
    '전자레인지',
    'TV',
    '인덕션',
    '가스레인지',
    '벽걸이 에어컨',
    '빌트인 에어컨',
  ],
  furniture: ['침대', '책상', '옷장', '소파', '욕조', '싱크대', '붙박이장', '신발장'],
  security: [
    '도어락',
    'CCTV',
    '인터폰',
    '카드키',
    '방범창',
    '경비',
    '화재경보기',
    '소화기',
    '현관보안',
  ],
  convenience: [
    '엘리베이터',
    '주차장',
    '택배보관함',
    '전체난방',
    '반려동물 가능', // '반려동물 가능'은 DB에 없지만 추가했습니다.
  ],
}

// 체크박스 업데이트 핸들러
function updateCheckbox(category, item, checked) {
  const list = form[category]
  const idx = list.indexOf(item)
  if (checked && idx === -1) {
    list.push(item)
  } else if (!checked && idx !== -1) {
    list.splice(idx, 1)
  }

  // 깊은 복사해서 emit
  emit('update:modelValue', JSON.parse(JSON.stringify(form)))
}

// 외부에서 modelValue 변경 시 내부 반영
watch(
  () => props.modelValue,
  (newVal) => {
    categories.forEach((key) => {
      form[key] = [...(newVal[key] ?? [])]
    })
  },
  { deep: true },
)
</script>

<style scoped>
/* Tailwind 사용 중이므로 커스텀 스타일은 생략 */
</style>
