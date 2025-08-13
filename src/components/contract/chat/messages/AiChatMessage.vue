<template>
  <div class="w-full flex flex-col items-start mb-3 animate-fade-in">
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

      <!-- 메시지 내용 (접기/펼치기 가능) -->
      <div class="relative">
        <p class="text-sm whitespace-pre-line break-words text-white">
          {{ displayText }}
        </p>

        <!-- 길이/토글 -->
        <div class="mt-1 flex items-center gap-2" v-if="showLength || showToggle">
          <span v-if="showLength" class="text-xs opacity-60 text-white"
            >{{ message.length }}자</span
          >
          <button
            v-if="showToggle"
            class="text-xs underline opacity-80 hover:opacity-100"
            @click="expanded = !expanded"
          >
            {{ expanded ? '접기' : '더보기' }}
          </button>
        </div>
      </div>

      <!-- 메시지 액션 버튼들 -->
      <div v-if="safeButtons.length" class="mt-3 flex gap-2 flex-wrap">
        <BaseButton
          v-for="(button, index) in safeButtons"
          :key="index"
          :disabled="clickLocked || button.disabled"
          variant="outline"
          @click="onClick(button)"
          @keydown.enter.prevent="onClick(button)"
          @keydown.space.prevent="onClick(button)"
          :data-action="button.action"
        >
          {{ button.label }}
        </BaseButton>
      </div>
    </div>

    <!-- 시간 -->
    <div class="flex items-center gap-2 mt-1">
      <p class="text-xs text-gray-400">
        {{ formattedTime }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AiIcon from '@/assets/icons/AiIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  message: { type: String, required: true },
  buttons: { type: Array, default: () => [] },
  sentAt: { type: [String, Number, Date], default: null },
  collapseAt: { type: Number, default: 280 },
  showLengthBadge: { type: Boolean, default: true },
})

const emit = defineEmits(['action'])

const expanded = ref(false)
const clickLocked = ref(false)

const safeButtons = computed(() => (Array.isArray(props.buttons) ? props.buttons : []))

const showToggle = computed(() => props.message.length > props.collapseAt)
const showLength = computed(() => props.showLengthBadge && props.message.length > 100)

const displayText = computed(() => {
  if (expanded.value || !showToggle.value) return props.message
  return props.message.slice(0, props.collapseAt) + '…'
})

const formattedTime = computed(() => {
  const date = props.sentAt ? new Date(props.sentAt) : new Date()
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
})

function onClick(button) {
  if (clickLocked.value) return
  clickLocked.value = true
  emit('action', {
    action: button.action,
    label: button.label,
    message: props.message,
  })
  setTimeout(() => (clickLocked.value = false), 250)
}
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
