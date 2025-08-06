<script setup>
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'

const emit = defineEmits(['update:form'])

const props = defineProps({
  form: Object,
})

// 천 단위 콤마 포맷
function formatCurrency(value) {
  const number = value.replace(/[^\d]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 입력 핸들링 (숫자만, 포맷 적용, emit)
function handleInput(field, event) {
  const raw = event.target.value.replace(/[^\d]/g, '')
  const parsed = raw ? parseInt(raw) : 0

  emit('update:form', {
    ...props.form,
    [field]: parsed,
  })

  const formatted = formatCurrency(raw || '0')
  event.target.value = formatted

  requestAnimationFrame(() => {
    const len = formatted.length
    event.target.setSelectionRange(len, len)
  })
}

// 표시값 출력
function displayValue(field) {
  const value = props.form[field]
  return value === 0 || value ? formatCurrency(String(value)) : '0'
}

// 관리비 항목 체크 업데이트
function updateUtility(key, checked) {
  emit('update:form', {
    ...props.form,
    utilities: {
      ...props.form.utilities,
      [key]: checked,
    },
  })
}

// 관리비 항목 정의
const utilityItems = {
  electricity: '전기료',
  gas: '가스료',
  water: '수도료',
  internet: '인터넷',
  cableTV: '케이블TV',
  heating: '난방비',
}
</script>

<template>
  <div>
    <h3 class="font-semibold mb-2">가격 정보</h3>
    <p class="text-sm text-gray-500 mb-4">
      금액은 숫자로만 입력해주세요. 천 단위로 자동 표기됩니다.
    </p>

    <!-- 전세 -->
    <div v-if="form.leaseType === '전세'" class="space-y-4">
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
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400"
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
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 항목 -->
      <div class="grid grid-cols-2 gap-2">
        <BaseCheckBox
          v-for="(label, key) in utilityItems"
          :key="key"
          :label="label"
          :modelValue="form.utilities[key]"
          @update:modelValue="(checked) => updateUtility(key, checked)"
        />
      </div>
    </div>

    <!-- 월세 -->
    <div v-else-if="form.leaseType === '월세'" class="space-y-4">
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
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400"
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
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400"
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
            class="w-full border rounded px-3 py-2 pr-12 text-right placeholder:text-gray-400"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">만원</span>
        </div>
      </div>

      <!-- 관리비 항목 -->
      <div class="grid grid-cols-2 gap-2">
        <BaseCheckBox
          v-for="(label, key) in utilityItems"
          :key="key"
          :label="label"
          :modelValue="form.utilities[key]"
          @update:modelValue="(checked) => updateUtility(key, checked)"
        />
      </div>
    </div>
  </div>
</template>
