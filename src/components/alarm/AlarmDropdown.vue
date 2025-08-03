<template>
  <div class="absolute right-0 mt-2 w-80 white-box shadow-lg" v-show="isVisible" ref="dropdownRef">
    <div class="pb-2 border-b border-gray-200 font-semibold">알림</div>
    <div class="min-h-24 max-h-80 overflow-y-auto flex flex-col" v-if="alarms.length">
      <AlarmCard
        v-for="(item, index) in alarms"
        :key="index"
        :title="item.title"
        :time="item.time"
      />
    </div>
    <div v-else class="min-h-24 flex items-center text-sm text-gray-400">
      새로운 알림이 없습니다.
    </div>
  </div>
</template>

<script setup>
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'
import AlarmCard from './AlarmCard.vue'

defineProps({
  isVisible: Boolean,
})

const emit = defineEmits(['close'])
const dropdownRef = ref(null)

onClickOutside(dropdownRef, (event) => {
  if (event.target.closest('.alarm-toggle-button')) return
  emit('close')
})

const alarms = [
  { title: '계약서 수정 요청이 도착했어요.', time: '3분 전' },
  { title: '새 채팅 메시지가 있어요.', time: '10분 전' },
  { title: '임차인이 계약을 수락했습니다.', time: '1시간 전' },
  { title: '계약서 수정 요청이 도착했어요.', time: '16시간 전' },
  { title: '새 채팅 메시지가 있어요.', time: '1일 전' },
  { title: '임차인이 계약을 수락했습니다.', time: '3일 전' },
]
</script>
