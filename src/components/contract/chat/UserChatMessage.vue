<template>
  <div :class="isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'">
    <div
      class="flex flex-col gap-1 p-3 rounded-xl w-fit"
      :class="isMine ? 'bg-yellow-primary' : 'bg-gray-100'"
    >
      <div class="flex gap-1 items-center">
        <UserIcon
          class="shrink-0"
          :class="isMine ? 'text-white' : 'text-gray-700'"
          width="20px"
          height="20px"
        />
        <p class="text-sm font-medium" :class="isMine ? 'text-white' : 'text-gray-800'">
          {{ name }}
        </p>
      </div>

      <!-- 메시지 -->
      <p class="text-sm whitespace-pre-line" :class="isMine ? 'text-white' : 'text-gray-700'">
        {{ message }}
      </p>
    </div>

    <!-- 시간 -->
    <p class="text-xs text-gray-400 mt-1" :class="isMine ? 'text-right' : ''">{{ time }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import UserIcon from '@/assets/icons/UserIcon.vue'

const props = defineProps({
  name: String,
  message: String,
  time: String,
  userId: Number,
  myUserId: Number,
})

const isMine = computed(() => props.userId === props.myUserId)
</script>
