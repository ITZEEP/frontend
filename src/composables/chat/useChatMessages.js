// 초기 메시지 로드 + 에러상태 + 스크롤 헬퍼
import { ref, nextTick } from 'vue'
import { getContractMessages } from '@/apis/contractChatApi'

export function useChatMessages() {
  const apiMessages = ref([])
  const loadingMessages = ref(false)
  const messagesError = ref(null)
  const messagesContainer = ref(null)

  const forceScrollToBottom = () => {
    const el = messagesContainer.value
    if (!el) return
    el.scrollTop = el.scrollHeight
    nextTick(() => {
      el.scrollTop = el.scrollHeight
    })
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight
    })
  }

  const loadMessages = async (chatId) => {
    if (!chatId) return
    loadingMessages.value = true
    messagesError.value = null
    try {
      const res = await getContractMessages(chatId)
      if (res?.success) {
        apiMessages.value = res.data || []
      } else {
        messagesError.value = res?.message || '메시지 로드 실패'
      }
      await nextTick()
      forceScrollToBottom()
    } catch (e) {
      messagesError.value = e?.message || '메시지 로드 실패'
    } finally {
      loadingMessages.value = false
    }
  }

  return {
    apiMessages,
    loadingMessages,
    messagesError,
    messagesContainer,
    loadMessages,
    forceScrollToBottom,
  }
}
