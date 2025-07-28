<script setup>
const props = defineProps({
  form: {
    type: Object,
    required: true,
    validator(value) {
      return value && typeof value === 'object' && 'houseType' in value && 'dealType' in value
    },
  },
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">기본 정보</h2>

    <!-- 매물 종류 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        매물 종류 <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="type in [
            '오픈형 원룸',
            '분리형 원룸',
            '투룸',
            '오피스텔',
            '아파트',
            '단독/다가구주택',
          ]"
          :key="type"
          :class="[
            'py-2 px-4 border rounded-md text-sm font-medium transition',
            form.houseType === type
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white text-gray-700 hover:bg-gray-50',
          ]"
          @click="form.houseType = type"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- 거래유형 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        거래 유형 <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-6">
        <label
          v-for="type in ['월세', '전세']"
          :key="type"
          class="flex items-center cursor-pointer text-gray-700"
        >
          <input
            type="radio"
            class="form-radio accent-blue-500 w-4 h-4"
            name="dealType"
            :value="type"
            v-model="form.dealType"
          />
          <span class="ml-2 select-none">{{ type }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
