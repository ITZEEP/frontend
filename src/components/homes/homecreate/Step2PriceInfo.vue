<script setup>
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'

const emit = defineEmits(['update:form'])
const props = defineProps({ form: Object })

// 천 단위 콤마 포맷 함수
function formatCurrency(value) {
  const number = value.replace(/[^\d]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function handleInput(field, event) {
  const raw = event.target.value.replace(/[^\d]/g, '')
  const parsed = raw ? parseInt(raw, 10) : 0

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

function displayValue(field) {
  const value = props.form[field]
  return value || value === 0 ? formatCurrency(String(value)) : '0'
}

// 공과금 항목
const utilityItems = {
  electricity: '전기료',
  gas: '가스료',
  water: '수도료',
  internet: '인터넷',
  cableTV: '케이블TV',
  heating: '난방비',
}

// 관리비 항목 토글
function toggleMaintenanceItem(label, checked) {
  let newFees = [...(props.form.maintenanceFees || [])]

  if (checked) {
    // 추가
    if (!newFees.some((fee) => fee.itemName === label)) {
      newFees.push({ itemName: label })
    }
  } else {
    // 제거
    newFees = newFees.filter((fee) => fee.itemName !== label)
  }

  emit('update:form', {
    ...props.form,
    maintenanceFees: newFees,
  })
}

// 체크 여부 반환
function isChecked(label) {
  return (props.form.maintenanceFees || []).some((fee) => fee.itemName === label)
}
</script>

<template>
  <div>
    <h3 class="font-semibold mb-2">가격 정보</h3>
    <p class="text-sm text-gray-500 mb-4">
      금액은 숫자로만 입력해주세요. 천 단위로 자동 표기됩니다.
    </p>

    <!-- 전세 -->
    <div v-if="form.leaseType === 'JEONSE'" class="space-y-4">
      <div>
        <label class="block mb-1 text-sm font-medium"
          >전세금 <span class="text-red-500">*</span></label
        >
        <div class="relative w-full">
          <input
            type="text"
            :value="displayValue('depositPrice')"
            @input="handleInput('depositPrice', $event)"
            class="w-full border rounded px-3 py-2 pr-16 text-right"
            placeholder="0"
            required
          />
          <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >만원</span
          >
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">관리비 총액</label>
        <div class="relative w-full">
          <input
            type="text"
            :value="displayValue('maintenanceFee')"
            @input="handleInput('maintenanceFee', $event)"
            class="w-full border rounded px-3 py-2 pr-16 text-right"
            placeholder="0"
          />
          <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >만원</span
          >
        </div>
      </div>

      <div>
        <h4 class="font-semibold mt-4 mb-2">관리비 포함 항목</h4>
        <div class="grid grid-cols-2 gap-2">
          <BaseCheckBox
            v-for="(label, key) in utilityItems"
            :key="key"
            :label="label"
            :modelValue="isChecked(label)"
            @update:modelValue="(checked) => toggleMaintenanceItem(label, checked)"
          />
        </div>
      </div>
    </div>

    <!-- 월세 -->
    <div v-else-if="form.leaseType === 'WOLSE'" class="space-y-4">
      <div>
        <label class="block mb-1 text-sm font-medium"
          >보증금 <span class="text-red-500">*</span></label
        >
        <div class="relative w-full">
          <input
            type="text"
            :value="displayValue('depositPrice')"
            @input="handleInput('depositPrice', $event)"
            class="w-full border rounded px-3 py-2 pr-16 text-right"
            placeholder="0"
            required
          />
          <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >만원</span
          >
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium"
          >월세 <span class="text-red-500">*</span></label
        >
        <div class="relative w-full">
          <input
            type="text"
            :value="displayValue('monthlyRent')"
            @input="handleInput('monthlyRent', $event)"
            class="w-full border rounded px-3 py-2 pr-16 text-right"
            placeholder="0"
            required
          />
          <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >만원</span
          >
        </div>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">관리비 총액</label>
        <div class="relative w-full">
          <input
            type="text"
            :value="displayValue('maintenanceFee')"
            @input="handleInput('maintenanceFee', $event)"
            class="w-full border rounded px-3 py-2 pr-16 text-right"
            placeholder="0"
          />
          <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
            >만원</span
          >
        </div>
      </div>

      <div>
        <h4 class="font-semibold mt-4 mb-2">관리비 포함 항목</h4>
        <div class="grid grid-cols-2 gap-2">
          <BaseCheckBox
            v-for="(label, key) in utilityItems"
            :key="key"
            :label="label"
            :modelValue="isChecked(label)"
            @update:modelValue="(checked) => toggleMaintenanceItem(label, checked)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
