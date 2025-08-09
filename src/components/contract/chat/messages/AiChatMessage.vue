<template>
  <div class="w-full flex flex-col items-start mb-3 animate-fade-in m-2">
    <!-- 메시지 버블 -->
    <div
      class="flex flex-col gap-1 p-3 rounded-xl w-fit max-w-xs lg:max-w-md relative transition-all duration-200 shadow-md bg-gradient-to-r from-blue-400 to-purple-400 text-white"
    >
      <!-- 사용자 정보 -->
      <div class="flex gap-1 items-center">
        <AiIcon class="shrink-0 text-white" width="20px" height="20px" />
        <p class="text-sm font-medium text-white">
          AI 어시스턴트 <span class="font-semibold">뀨</span>
        </p>
      </div>

      <!-- 메시지 내용 -->
      <div class="relative">
        <p class="text-sm whitespace-pre-line break-words text-white">
          {{ props.message }}
        </p>

        <!-- 메시지 길이 표시 -->
        <div v-if="props.message.length > 100" class="mt-1">
          <span class="text-xs opacity-60 text-white">{{ props.message.length }}자</span>
        </div>
      </div>

      <!-- 메시지 액션 버튼들: 항상 표시, 메시지 아래에 배치 -->
      <div v-if="props.buttons.length" class="mt-3 flex gap-2 flex-wrap">
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
    <div class="flex items-center gap-2 mt-1">
      <p class="text-xs text-gray-400">
        {{ time }}
      </p>
    </div>
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

// 시간 포맷
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
