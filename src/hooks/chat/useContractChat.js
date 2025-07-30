// composables/useContractChat.js
import { ref, onUnmounted, watch, onMounted } from 'vue'
import websocketService from '@/apis/websocket'

export function useContractChat(contractChatId, currentUserId, contractData) {
  const messages = ref([])
  const onlineUsers = ref([])
  const isReady = ref(false)
  const isTyping = ref(false)
  const errorCallbacks = ref([])

  const isInitialized = ref(false)

  const checkReadyState = () => {
    const ready = currentUserId.value && contractChatId.value && contractData.value
    isReady.value = ready
    console.log('useContractChat 준비 상태:', {
      currentUserId: currentUserId.value,
      contractChatId: contractChatId.value,
      ready,
      isInitialized: isInitialized.value,
    })
    return ready
  }

  const getOtherUserId = () => {
    if (!contractData.value || !currentUserId.value) return null

    const { ownerId, buyerId } = contractData.value
    const currentId = String(currentUserId.value)
    if (currentId === String(ownerId)) {
      return buyerId
    } else if (currentId === String(buyerId)) {
      return ownerId
    }
    return null
  }

  const handleNewMessage = (message) => {
    if (String(message.senderId) === String(currentUserId.value)) {
      return
    }

    const isDuplicate = messages.value.some(
      (existingMsg) =>
        existingMsg.id === message.id ||
        (existingMsg.content === message.content &&
          existingMsg.sendTime === message.sendTime &&
          existingMsg.senderId === message.senderId),
    )

    if (isDuplicate) {
      console.warn('중복 메시지 감지됨, 무시:', message)
      return
    }

    messages.value.push(message)
  }

  const handleContractError = (errorData) => {
    errorCallbacks.value.forEach((callback) => {
      try {
        callback(errorData)
      } catch (error) {
        console.error('에러 콜백 실행 실패:', error)
      }
    })
  }

  const handleOnlineStatusChange = (statusData) => {
    console.log('온라인 상태 변경 수신:', statusData)
  }

  // 🔧 구독 - 브로드캐스트만 사용
  const subscribeToContractRoom = (roomId) => {
    if (!roomId) return

    // 🔧 브로드캐스트 토픽만 구독 (중복 수신 방지)
    websocketService.onMessage(`/topic/contract-chat/${roomId}`, handleNewMessage)

    // 타이핑 구독
    websocketService.onMessage(`/topic/contract-chat/${roomId}/typing`, (typingData) => {
      isTyping.value = typingData.isTyping
    })

    // 사용자별 구독
    if (currentUserId.value) {
      websocketService.onMessage(
        `/user/${currentUserId.value}/queue/contract/error`,
        handleContractError,
      )
      websocketService.onMessage(
        `/user/${currentUserId.value}/queue/contract/online-status`,
        handleOnlineStatusChange,
      )
    }
  }

  // 구독 해제
  const unsubscribeFromContractRoom = (roomId) => {
    if (!roomId) return

    console.log('계약 채팅방 구독 해제:', roomId)

    websocketService.offMessage(`/topic/contract-chat/${roomId}`)
    websocketService.offMessage(`/topic/contract-chat/${roomId}/typing`)

    if (currentUserId.value) {
      websocketService.offMessage(`/user/${currentUserId.value}/queue/contract/error`)
      websocketService.offMessage(`/user/${currentUserId.value}/queue/contract/online-status`)
    }
  }

  // WebSocket 초기화
  const initializeWebSocket = async () => {
    if (!checkReadyState()) return

    if (isInitialized.value) {
      console.log('⏸️ 이미 초기화됨')
      return
    }

    try {
      isInitialized.value = true

      await websocketService.connect()

      if (contractChatId.value) {
        subscribeToContractRoom(contractChatId.value)

        websocketService.sendMessage('/app/contract/chat/enter', {
          userId: currentUserId.value,
          contractChatId: contractChatId.value,
        })
      }
    } catch (err) {
      console.error('계약 채팅 WebSocket 연결 실패:', err)
      isInitialized.value = false
    }
  }

  // 메시지 전송
  const sendContractMessage = (content, type = 'TEXT', fileUrl = null) => {
    if (!contractChatId.value || !currentUserId.value) return false

    const receiverId = getOtherUserId()
    if (!receiverId) return false

    try {
      return websocketService.sendMessage('/app/contract/chat/send', {
        contractChatId: contractChatId.value,
        senderId: currentUserId.value,
        receiverId: receiverId,
        content: content,
        type: type,
        fileUrl: fileUrl,
      })
    } catch (error) {
      console.error('계약 채팅 메시지 전송 중 오류:', error)
      return false
    }
  }

  // 🔧 Watch 수정
  watch(
    [currentUserId, contractData, contractChatId],
    ([newUserId, newContractData, newChatId], oldValues) => {
      const oldChatId = oldValues?.[2]

      console.log('Watch 트리거:', {
        newUserId,
        hasContractData: !!newContractData,
        newChatId,
        oldChatId,
      })

      // 채팅방 변경 시 구독 해제
      if (oldChatId && oldChatId !== newChatId) {
        unsubscribeFromContractRoom(oldChatId)
        isInitialized.value = false
      }

      // 모든 조건이 준비된 경우 초기화
      if (newUserId && newContractData && newChatId && !isInitialized.value) {
        initializeWebSocket()
      }
    },
    { immediate: true, deep: false },
  )

  onMounted(() => {
    checkReadyState()
  })

  onUnmounted(() => {
    if (contractChatId.value) {
      unsubscribeFromContractRoom(contractChatId.value)

      // 퇴장 알림
      websocketService.sendMessage('/app/contract/chat/leave', {
        userId: currentUserId.value,
        contractChatId: contractChatId.value,
      })
    }

    // 상태 초기화
    isInitialized.value = false
  })

  return {
    messages,
    onlineUsers,
    isReady,
    isTyping,
    sendContractMessage,
    getOtherUserId,
    onContractError: (callback) => errorCallbacks.value.push(callback),
    offContractError: (callback) => {
      const index = errorCallbacks.value.indexOf(callback)
      if (index > -1) errorCallbacks.value.splice(index, 1)
    },
  }
}
