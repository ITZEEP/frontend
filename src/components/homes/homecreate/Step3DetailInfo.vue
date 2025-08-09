<script setup>
import { toRefs } from 'vue'
import OptionChecklist from './OptionChecklist.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['update:form'])

const { form } = toRefs(props)

const handleChange = (key, value) => {
  emit('update:form', {
    ...props.form,
    [key]: value,
  })
}

const homeDirectionOptions = [
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

<template>
  <form class="max-w-4xl mx-auto p-6 space-y-6 border rounded-md">
    <h2 class="text-lg font-semibold mb-2">상세 정보</h2>
    <p class="mb-4 text-gray-700">전용면적과 건물 정보를 입력해주세요.</p>

    <!-- 전용면적 & 공급면적 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 text-sm font-medium"
          >전용면적 <span class="text-red-500">*</span></label
        >
        <div class="relative">
          <input
            type="number"
            min="0"
            class="border rounded p-2 pr-20 w-full no-spin"
            :value="form.exclusiveArea"
            @input="handleChange('exclusiveArea', $event.target.valueAsNumber)"
            required
            placeholder="0"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">제곱미터</span>
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">공급면적</label>
        <div class="relative">
          <input
            type="number"
            min="0"
            class="border rounded p-2 pr-20 w-full no-spin"
            :value="form.supplyArea"
            @input="handleChange('supplyArea', $event.target.valueAsNumber)"
            placeholder="0"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">제곱미터</span>
        </div>
      </div>
    </div>

    <!-- 방/욕실 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 text-sm font-medium"
          >방 개수 <span class="text-red-500">*</span></label
        >
        <div class="relative">
          <input
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            :value="form.roomCnt"
            @input="handleChange('roomCnt', $event.target.valueAsNumber)"
            required
            placeholder="0"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">개</span>
        </div>
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium"
          >욕실 개수 <span class="text-red-500">*</span></label
        >
        <div class="relative">
          <input
            type="number"
            min="0"
            class="border rounded p-2 pr-12 w-full no-spin"
            :value="form.bathroomCount"
            @input="handleChange('bathroomCount', $event.target.valueAsNumber)"
            required
            placeholder="0"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">개</span>
        </div>
      </div>
    </div>

    <!-- 층 정보 -->
    <div class="grid grid-cols-2 gap-6">
      <div>
        <label class="block mb-1 text-sm font-medium"
          >현재 층 <span class="text-red-500">*</span></label
        >
        <input
          type="number"
          min="0"
          class="border rounded p-2 w-full"
          :value="form.homeFloor"
          @input="handleChange('homeFloor', $event.target.valueAsNumber)"
          required
          placeholder="0"
        />
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium"
          >총 층수 <span class="text-red-500">*</span></label
        >
        <input
          type="number"
          min="0"
          class="border rounded p-2 w-full"
          :value="form.buildingTotalFloors"
          @input="handleChange('buildingTotalFloors', $event.target.valueAsNumber)"
          required
          placeholder="0"
        />
      </div>
    </div>

    <!-- 사용 승인일 -->
    <div>
      <label class="block mb-1 text-sm font-medium"
        >사용 승인일<span class="text-red-500">*</span></label
      >
      <input
        type="date"
        class="border rounded p-2 w-full max-w-xs"
        :value="form.buildDate"
        @input="handleChange('buildDate', $event.target.value)"
      />
    </div>

    <!-- 방향 -->
    <fieldset>
      <legend class="font-semibold mb-2">방향</legend>
      <div class="grid grid-cols-4 gap-2 max-w-xl">
        <button
          v-for="opt in homeDirectionOptions"
          :key="opt.value"
          type="button"
          @click="handleChange('homeDirection', opt.value)"
          :class="[
            'py-2 px-4 border rounded text-center cursor-pointer w-full',
            form.homeDirection === opt.value
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </fieldset>

    <!-- 옵션 체크리스트 -->
    <fieldset class="rounded-md p-4">
      <OptionChecklist
        :modelValue="form.options"
        @update:modelValue="(val) => handleChange('options', val)"
      />
    </fieldset>
  </form>
</template>

<style scoped>
input[type='number'].no-spin::-webkit-inner-spin-button,
input[type='number'].no-spin::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'].no-spin {
  -moz-appearance: textfield;
}
</style>
