<template>
  <button
    class="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
    @click="$emit('click')"
  >
    <div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
      <component :is="iconMap[icon]" class="w-6 h-6 text-yellow-primary" />
    </div>
    <div class="text-left">
      <p class="text-sm font-semibold text-gray-800">{{ title }}</p>
      <p class="text-xs text-gray-500">{{ description }}</p>
    </div>
  </button>
</template>

<script setup>
import PdfIcon from '@/assets/icons/PdfIcon.vue'
import PrintIcon from '@/assets/icons/PrintIcon.vue'
import EmailIcon from '@/assets/icons/EmailIcon.vue'

defineProps({
  icon: String,
  title: String,
  description: String,
})

const iconMap = {
  pdf: PdfIcon,
  print: PrintIcon,
  email: EmailIcon,
}
</script>
