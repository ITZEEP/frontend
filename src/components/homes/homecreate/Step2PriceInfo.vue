<template>
  <div>
    <h3 class="font-semibold mb-2">가격 정보</h3>
    <p class="text-sm text-gray-500 mb-4">
      금액은 숫자로만 입력해주세요. 천 단위로 자동 표기됩니다.
    </p>
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
        <label class="block mb-1 text-sm font-medium"
          >관리비<span class="text-red-500">*</span></label
        >
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
            v-for="item in maintenanceItems"
            :key="item.maintenanceId"
            :label="item.maintenanceName"
            :modelValue="isChecked(item.maintenanceId)"
            @update:modelValue="
              (checked) => toggleMaintenanceItem(item.maintenanceId, item.maintenanceName, checked)
            "
          />
        </div>
      </div>
    </div>
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
        <label class="block mb-1 text-sm font-medium"
          >관리비 <span class="text-red-500">*</span></label
        >
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
            v-for="item in maintenanceItems"
            :key="item.maintenanceId"
            :label="item.maintenanceName"
            :modelValue="isChecked(item.maintenanceId)"
            @update:modelValue="
              (checked) => toggleMaintenanceItem(item.maintenanceId, item.maintenanceName, checked)
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseCheckBox from '@/components/common/BaseCheckbox.vue'
import { toRefs } from 'vue'

const emit = defineEmits(['update:form'])
const props = defineProps({ form: Object })
const { form } = toRefs(props)

// 천 단위 콤마 포맷 함수
function formatCurrency(value) {
  const number = value.replace(/[^\d]/g, '')
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function handleInput(field, event) {
  const raw = event.target.value.replace(/[^\d]/g, '')
  const parsed = raw ? parseInt(raw, 10) : 0
  emit('update:form', { ...props.form, [field]: parsed })
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

// `maintenance_id`와 `item_name`을 포함하는 배열
const maintenanceItems = [
  { maintenanceId: 3, maintenanceName: '가스료' },
  { maintenanceId: 2, maintenanceName: '수도료' },
  { maintenanceId: 4, maintenanceName: '인터넷' },
  { maintenanceId: 1, maintenanceName: '전기료' },
  { maintenanceId: 5, maintenanceName: '청소비' },
]

function toggleMaintenanceItem(id, name, checked) {
  let newItems = [...(props.form.maintenanceFees || [])]
  if (checked) {
    if (!newItems.some((item) => item.maintenanceId === id)) {
      newItems.push({ maintenanceId: id, maintenanceName: name })
    }
  } else {
    newItems = newItems.filter((item) => item.maintenanceId !== id)
  }
  emit('update:form', { ...props.form, maintenanceFees: newItems })
}

function isChecked(id) {
  return (props.form.maintenanceFees || []).some((item) => item.maintenanceId === id)
}
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
</style>
