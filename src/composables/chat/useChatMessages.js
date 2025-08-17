import { ref, nextTick } from 'vue'
import { getContractMessages } from '@/apis/contractChatApi'

export function useChatMessages() {
  const apiMessages = ref([])
  const loadingMessages = ref(false)
  const refreshingMessages = ref(false)
  const hasLoadedOnce = ref(false)
  const messagesError = ref(null)
  const messagesContainer = ref(null)

  const forceScrollToBottom = () => {
    const el = messagesContainer.value
    if (!el) return
    el.scrollTop = el.scrollHeight
    nextTick(() => (el.scrollTop = el.scrollHeight))
    requestAnimationFrame(() => (el.scrollTop = el.scrollHeight))
  }

  const loadMessages = async (chatId, { silent = false } = {}) => {
    if (!chatId) return
    messagesError.value = null
    if (silent) {
      if (refreshingMessages.value) return
      refreshingMessages.value = true
    } else {
      loadingMessages.value = true
    }

    try {
      const res = await getContractMessages(chatId)
      if (res?.success) {
        apiMessages.value = res.data || []
        hasLoadedOnce.value = true
      } else {
        messagesError.value = res?.message || '메시지 로드 실패'
      }
      await nextTick()
      forceScrollToBottom()
    } catch (e) {
      messagesError.value = e?.message || '메시지 로드 실패'
    } finally {
      if (silent) refreshingMessages.value = false
      else loadingMessages.value = false
    }
  }

  return {
    apiMessages,
    loadingMessages,
    refreshingMessages,
    hasLoadedOnce,
    messagesError,
    messagesContainer,
    loadMessages,
    forceScrollToBottom,
  }
}
