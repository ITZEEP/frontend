<template>
  <div>
    <AiChatMessage
      v-for="(message, index) in displayedMessages"
      :key="message.id || index"
      :message="message.content"
      :buttons="message.buttons"
      @action="handleAction(message.action)"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import AiChatMessage from '../messages/AiChatMessage.vue'

const props = defineProps({
  scenario: {
    type: Array,
    required: true,
  },
})

const displayedMessages = ref([])

// 시나리오 플레이 (순차적으로 실행)
const playScenario = async () => {
  for (const message of props.scenario) {
    if (message.type === 'api') {
      // API 타입인 경우, 딜레이 후 API 요청 시뮬레이션 -> 테스트임
      await new Promise((resolve) => setTimeout(resolve, message.delay || 1000))
      // 나중에 API 연동 여기에 작성
      continue
    }

    // 메시지 딜레이 후 표시
    await new Promise((resolve) => setTimeout(resolve, message.delay || 1000))
    displayedMessages.value.push(message)
    await nextTick()
  }
}

// 시나리오가 바뀔 때마다 다시 실행
watch(
  () => props.scenario,
  () => {
    displayedMessages.value = []
    playScenario()
  },
  { immediate: true },
)

// 액션 핸들러 (버튼 클릭 등)
const handleAction = (action) => {
  console.log('사용자 액션:', action)
}
</script>
