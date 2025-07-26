<script setup>
const props = defineProps({
  form: Object,
})

// 천 단위 콤마 포맷
function formatCurrency(value) {
  const number = value.replace(/[^\d]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 인풋 이벤트 핸들러
function handleInput(field, event) {
  const raw = event.target.value.replace(/[^\d]/g, '')
  props.form[field] = raw ? parseInt(raw) : 0
  const formatted = formatCurrency(raw || '0')
  event.target.value = formatted

  // 커서를 맨 뒤로 이동
  requestAnimationFrame(() => {
    const len = formatted.length
    event.target.setSelectionRange(len, len)
  })
}

// 표시값 포맷 (0도 출력되게)
function displayValue(field) {
  const value = props.form[field]
  return value === 0 || value ? formatCurrency(String(value)) : '0'
}
</script>

<template>
  <div>
    <h3 class="font-semibold mb-2">가격 정보</h3>
    <p class="text-sm text-gray-500 mb-4">
      금액은 숫자로만 입력해주세요. 천 단위로 자동 표기됩니다.
    </p>

    <!-- 전세 -->
    <div v-if="form.dealType === '전세'" class="space-y-4">
      <!-- 전세금 -->
      <div>
        <label class="block mb-1 text-sm font-medium">
          전세금 <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            type="text"
            :value="displayValue('deposit')"
            @input="handleInput('deposit', $event)"
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400 appearance-none"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 -->
      <div>
        <label class="block mb-1 text-sm font-medium">관리비</label>
        <div class="relative">
          <input
            type="text"
            :value="displayValue('maintenanceFee')"
            @input="handleInput('maintenanceFee', $event)"
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400 appearance-none"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 항목 -->
      <div class="grid grid-cols-2 gap-2">
        <label
          class="inline-flex items-center"
          v-for="(label, key) in {
            electricity: '전기료',
            gas: '가스료',
            water: '수도료',
            internet: '인터넷',
            cableTV: '케이블TV',
            heating: '난방비',
          }"
          :key="key"
        >
          <input type="checkbox" v-model="form.utilities[key]" class="form-checkbox" />
          <span class="ml-2">{{ label }}</span>
        </label>
      </div>
    </div>

    <!-- 월세 -->
    <div v-else-if="form.dealType === '월세'" class="space-y-4">
      <!-- 보증금 -->
      <div>
        <label class="block mb-1 text-sm font-medium">
          보증금 <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            type="text"
            :value="displayValue('deposit')"
            @input="handleInput('deposit', $event)"
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400 appearance-none"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 월세 -->
      <div>
        <label class="block mb-1 text-sm font-medium">
          월세 <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            type="text"
            :value="displayValue('monthlyRent')"
            @input="handleInput('monthlyRent', $event)"
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400 appearance-none"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 -->
      <div>
        <label class="block mb-1 text-sm font-medium">관리비</label>
        <div class="relative">
          <input
            type="text"
            :value="displayValue('maintenanceFee')"
            @input="handleInput('maintenanceFee', $event)"
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400 appearance-none"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 항목 -->
      <div class="grid grid-cols-2 gap-2">
        <label
          class="inline-flex items-center"
          v-for="(label, key) in {
            electricity: '전기료',
            gas: '가스료',
            water: '수도료',
            internet: '인터넷',
            cableTV: '케이블TV',
            heating: '난방비',
          }"
          :key="key"
        >
          <input type="checkbox" v-model="form.utilities[key]" class="form-checkbox" />
          <span class="ml-2">{{ label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
