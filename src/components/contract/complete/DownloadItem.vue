<template>
  <button
    type="button"
    class="w-full flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left hover:bg-gray-50 transition"
    :disabled="disabled"
    @click.stop="onClick"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-yellow-primary"
    >
      <i :class="['fa-solid', faClass, 'text-xl']"></i>
    </div>

    <div class="flex-1">
      <p class="font-semibold text-gray-800 leading-tight">{{ title }}</p>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>

    <i class="fa-solid fa-chevron-right text-gray-300"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['activate'])

const faClass = computed(() => {
  switch (props.icon) {
    case 'pdf':
      return 'fa-file-pdf'
    case 'print':
      return 'fa-print'
    case 'email':
      return 'fa-envelope'
    default:
      return 'fa-file'
  }
})

const onClick = () => {
  if (props.disabled) return
  emit('activate')
}
</script>
