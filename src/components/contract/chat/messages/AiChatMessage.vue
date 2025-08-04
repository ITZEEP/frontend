<template>
  <div class="flex flex-col items-start mb-3 animate-fade-in m-4">
    <div
      class="flex flex-col gap-2 p-3 rounded-xl w-fit max-w-xs lg:max-w-md text-white bg-gradient-to-r from-blue-400 to-purple-400 shadow"
    >
      <!-- 아이콘 + 이름 -->
      <div class="flex items-center gap-1">
        <AiIcon class="w-5 h-5 text-white" />
        <p class="text-sm">AI 어시스턴트 <span class="pl-1 font-semibold">뀨</span></p>
      </div>

      <!-- 메시지 내용 -->
      <p class="text-sm whitespace-pre-line break-words">
        {{ props.message }}
      </p>

      <!-- 버튼 -->
      <div v-if="props.buttons.length" class="flex gap-2 pt-2">
        <BaseButton
          v-for="(button, index) in props.buttons"
          :key="index"
          @click="$emit('action', button.action)"
          variant="outline"
        >
          {{ button.label }}
        </BaseButton>
      </div>
    </div>

    <!-- 시간 -->
    <p class="text-xs text-gray-400 mt-1">{{ time }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AiIcon from '@/assets/icons/AiIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  buttons: {
    type: Array,
    default: () => [],
  },
})

// 서울 시간 기준 HH:mm 형식으로 시간 적용
const time = computed(() => {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
