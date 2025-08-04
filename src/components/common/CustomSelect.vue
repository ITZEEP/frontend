<template>
  <div class="custom-select" ref="selectRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <!-- Select Button -->
      <button
        type="button"
        @click="toggleDropdown"
        :disabled="disabled"
        class="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400"
        :class="{ 
          'border-red-500': error,
          'border-yellow-500': isOpen
        }"
      >
        <span class="block truncate" :class="{ 'text-gray-500': !selectedLabel }">
          {{ selectedLabel || placeholder }}
        </span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2">
          <IconChevronDown 
            class="w-5 h-5 text-gray-400 transition-transform duration-300" 
            :class="{ 'rotate-180': isOpen }"
          />
        </span>
      </button>

      <!-- Dropdown Menu -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          <ul class="py-1">
            <li
              v-for="(option, index) in options"
              :key="option.value"
              @click="selectOption(option)"
              class="relative px-4 py-3 cursor-pointer select-none hover:bg-yellow-50 transition-all duration-150"
              :class="{
                'bg-yellow-100 text-yellow-900 hover:bg-yellow-100': option.value === modelValue,
                'text-gray-700 hover:text-gray-900': option.value !== modelValue,
                'border-b border-gray-100': index < options.length - 1
              }"
            >
              <div class="flex items-center justify-between">
                <span class="block truncate" :class="option.value === modelValue ? 'font-semibold' : 'font-medium'">
                  {{ option.label }}
                </span>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-75"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-75"
                >
                  <IconCheck 
                    v-if="option.value === modelValue" 
                    class="w-5 h-5 text-yellow-600 flex-shrink-0 ml-2" 
                  />
                </transition>
              </div>
            </li>
          </ul>
        </div>
      </transition>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import IconCheck from '@/components/icons/IconCheck.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(option => 
        typeof option === 'object' && 
        'value' in option && 
        'label' in option
      )
    }
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '선택하세요'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const selectRef = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue)
  return selected ? selected.label : ''
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 스크롤바 스타일링 */
.custom-select ::-webkit-scrollbar {
  width: 6px;
}

.custom-select ::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.custom-select ::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-select ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 드롭다운 그림자 효과 */
.custom-select .shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>