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
          :modelValue="form[category].includes(item)"
          @update:modelValue="(checked) => updateCheckbox(category, item, checked)"
        />
      </div>
    </fieldset>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseCheckBox from '@/components/common/BaseCheckBox.vue'

//  props 및 emit
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      appliances: [],
      kitchen: [],
      heatingCooling: [],
      furniture: [],
      bathroom: [],
      security: [],
      etc: [],
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

//  양방향 바인딩용 로컬 form 상태
const form = reactive({
  appliances: [...props.modelValue.appliances],
  kitchen: [...props.modelValue.kitchen],
  heatingCooling: [...props.modelValue.heatingCooling],
  furniture: [...props.modelValue.furniture],
  bathroom: [...props.modelValue.bathroom],
  security: [...props.modelValue.security],
  etc: [...props.modelValue.etc],
})

//  카테고리 → 한글 라벨
const categoryLabels = {
  appliances: '가전',
  kitchen: '주방',
  heatingCooling: '냉난방',
  furniture: '가구',
  bathroom: '욕실',
  security: '보안/안전',
  etc: '기타',
}

//  카테고리별 항목
const utilityItems = {
  appliances: ['TV', '세탁기', '냉장고', '전자레인지'],
  kitchen: ['인덕션', '가스레인지', '싱크대'],
  heatingCooling: ['에어컨', '벽걸이 에어컨', '빌트인 에어컨', '개별난방', '전체 난방'],
  furniture: ['책상', '옷장', '붙박이장', '신발장'],
  bathroom: ['욕조'],
  security: [
    '현관 보안',
    'CCTV',
    '인터폰',
    '도어락',
    '카드키',
    '방범창',
    '경비',
    '화재 경보기',
    '소화기',
  ],
  etc: ['엘리베이터', '주차', '반려동물 가능'],
}

//  체크박스 업데이트 핸들러
function updateCheckbox(category, item, checked) {
  const list = form[category]
  const idx = list.indexOf(item)
  if (checked && idx === -1) {
    list.push(item)
  } else if (!checked && idx !== -1) {
    list.splice(idx, 1)
  }
  emit('update:modelValue', { ...form })
}

//  modelValue가 외부에서 변경되면 반영
watch(
  () => props.modelValue,
  (newVal) => {
    for (const key in newVal) {
      form[key] = [...newVal[key]]
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* Tailwind 사용 중이므로 커스텀 스타일은 불필요 */
</style>
