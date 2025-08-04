<template>
  <form @submit.prevent="onSubmit" class="max-w-4xl mx-auto p-4 space-y-6 border rounded-md">
    <h2 class="text-lg font-semibold mb-2">상세 정보</h2>
    <p class="mb-4 text-gray-700">전용면적과 건물 정보를 입력해주세요.</p>

    <!-- 숫자 입력 1단 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 font-semibold" for="yearsOfService">
          전용면적 <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <input
            id="exclusiveArea"
            type="number"
            min="0"
            class="border rounded p-2 pr-20 w-full no-spin"
            v-model.number="form.exclusiveArea"
            required
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            제곱미터
          </span>
        </div>
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="supplyArea">공급면적</label>
        <div class="relative">
          <input
            id="supplyArea"
            type="number"
            min="0"
            class="border rounded p-2 pr-20 w-full no-spin"
            v-model.number="form.supplyArea"
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            제곱미터
          </span>
        </div>
      </div>
    </div>

    <!-- 숫자 입력 2단 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 font-semibold" for="bedroomCount">
          방 개수 <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <input
            id="bedroomCount"
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            v-model.number="form.bedroomCount"
            required
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            개
          </span>
        </div>
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="bathroomCount">
          욕실 개수 <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <input
            id="bathroomCount"
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            v-model.number="form.bathroomCount"
            required
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            개
          </span>
        </div>
      </div>
    </div>

    <!-- 숫자 입력 3단 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 font-semibold" for="currentFloor">
          현재 층 <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <input
            id="currentFloor"
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            v-model.number="form.currentFloor"
            required
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            층
          </span>
        </div>
      </div>

      <div>
        <label class="block mb-1 font-semibold" for="totalFloor">
          총 층수 <span class="text-red-600">*</span>
        </label>
        <div class="relative">
          <input
            id="totalFloor"
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            v-model.number="form.totalFloor"
            required
            placeholder="0"
          />
          <span
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none"
          >
            층
          </span>
        </div>
      </div>
    </div>

    <!-- 체크박스 단 -->
    <div class="flex items-center gap-6">
      <label class="inline-flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" v-model="form.isDetached" />
        <span>반지하</span>
      </label>
      <label class="inline-flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" v-model="form.isRooftop" />
        <span>옥탑</span>
      </label>
    </div>

    <!-- 날짜 -->
    <div>
      <label for="usageDate" class="block mb-2 font-semibold">사용 승인일</label>
      <input
        id="usageDate"
        type="date"
        v-model="form.usageDate"
        class="border rounded p-2 w-full max-w-xs"
        placeholder="-/-/-"
      />
    </div>

    <!-- 방향 -->
    <fieldset>
      <legend class="font-semibold mb-2">방향</legend>
      <div class="grid grid-cols-4 gap-2 max-w-xl w-full">
        <button
          v-for="opt in orientationOptions"
          :key="opt.value"
          type="button"
          @click="form.orientation = opt.value"
          :class="[
            'py-2 px-4 border rounded text-center cursor-pointer select-none w-full',
            form.orientation === opt.value
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </fieldset>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const onSubmit = () => {
  // 폼 제출 로직 구현 필요
  console.log('Form submitted:', form)
}

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const form = reactive({
  exclusiveArea: 0,
  supplyArea: 0,
  bedroomCount: 0,
  bathroomCount: 0,
  currentFloor: 0,
  totalFloor: 0,
  isDetached: false,
  isRooftop: false,
  usageDate: '',
  orientation: '',
  ...props.modelValue,
})

// 부모에게 변경사항 전달
watchEffect(() => {
  emit('update:modelValue', { ...form })
})
const orientationOptions = [
  { label: '남향', value: '남향' },
  { label: '동향', value: '동향' },
  { label: '서향', value: '서향' },
  { label: '북향', value: '북향' },
  { label: '남동향', value: '남동향' },
  { label: '남서향', value: '남서향' },
  { label: '북동향', value: '북동향' },
  { label: '북서향', value: '북서향' },
]
</script>

<style>
/* 숫자 input 스핀버튼 완전 제거 */
input[type='number'].no-spin::-webkit-inner-spin-button,
input[type='number'].no-spin::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'].no-spin {
  -moz-appearance: textfield;
}
</style>
