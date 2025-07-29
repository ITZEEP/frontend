<template>
  <div class="flex items-center justify-center gap-2">
    <span class="w-3 h-3 rounded-full" :class="isAi ? 'bg-blue-500' : 'bg-green-500'"></span>
    <div class="flex gap-1 justify-center items-center">
      <component :is="isAi ? AiIcon : UserIcon" class="w-6 h-6 pt-1 text-gray-700" />

      <span class="text-gray-800 font-medium">
        {{ isAi ? 'AI 어시스턴트' : `${role} (${name})` }}
      </span>
    </div>
    <span class="text-sm" :class="isAi ? 'text-blue-500' : 'text-green-600'">
      {{ isOnline ? (isAi ? '활성' : '온라인') : '' }}
    </span>
  </div>
</template>

<script setup>
import AiIcon from '@/assets/icons/AiIcon.vue'
import UserIcon from '@/assets/icons/UserIcon.vue'

defineProps({
  name: String,
  role: String,
  isOnline: Boolean,
  isAi: Boolean,
})
</script>
