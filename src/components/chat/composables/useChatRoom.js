import { ref, onUnmounted, watch } from 'vue'
import websocketService from '@/components/chat/apis/websocket'

export function useChatRoom(chatRoomId, currentUserId, roomData) {
  const messages = ref([])
  const isTyping = ref(false)
  const onlineUsers = ref([])

  // 상대방 ID 가져오기
  const getOtherUserId = () => {
    if (!roomData.value || !currentUserId.value) return null

    // 현재 사용자가 소유자인지 구매자인지 확인 후 상대방 ID 반환
    if (currentUserId.value === roomData.value.ownerId) {
      return roomData.value.buyerId
    } else if (currentUserId.value === roomData.value.buyerId) {
      return roomData.value.ownerId
    }

    // 혹시 otherUserId가 직접 제공되는 경우
    return roomData.value.otherUserId || null
  }

  // 새 메시지 수신 핸들러
  const handleNewMessage = (message) => {
    console.log('새 메시지 수신:', message)
    messages.value.push(message)

    // 메시지를 읽음으로 표시 (내가 받은 메시지가 아닐 때)
    if (message.receiverId === currentUserId.value) {
      // TODO: 읽음 처리 API 호출
    }
  }

  // 타이핑 상태 핸들러
  const handleTypingStatus = (data) => {
    if (data.userId !== currentUserId.value) {
      isTyping.value = data.isTyping
    }
  }

  // 채팅방 구독
  const subscribeToRoom = (roomId) => {
    if (!roomId) return

    // 채팅방 메시지 구독
    websocketService.onMessage(`/topic/chatroom/${roomId}`, handleNewMessage)

    // 타이핑 상태 구독
    websocketService.onMessage(`/topic/room/${roomId}/typing`, handleTypingStatus)
  }

  // 구독 해제
  const unsubscribeFromRoom = (roomId) => {
    if (!roomId) return

    websocketService.offMessage(`/topic/chatroom/${roomId}`)
    websocketService.offMessage(`/topic/room/${roomId}/typing`)
  }

  // 메시지 전송
  const sendMessage = (content, type = 'TEXT', fileUrl = null) => {
    if (!chatRoomId.value || !currentUserId.value) {
      console.error('채팅방 ID 또는 사용자 ID가 없습니다')
      return false
    }

    const receiverId = getOtherUserId()
    if (!receiverId) {
      console.error('상대방 ID를 찾을 수 없습니다')
      return false
    }

    return websocketService.sendChatMessage(
      chatRoomId.value,
      currentUserId.value,
      receiverId,
      content,
      type,
      fileUrl,
    )
  }

  // 타이핑 상태 전송
  const sendTypingStatus = (isTyping) => {
    if (!chatRoomId.value) return

    websocketService.sendMessage(`/app/chat/${chatRoomId.value}/typing`, {
      userId: currentUserId.value,
      isTyping,
    })
  }

  // 채팅방 변경 감지
  watch(
    chatRoomId,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        unsubscribeFromRoom(oldRoomId)
      }
      if (newRoomId) {
        subscribeToRoom(newRoomId)
      }
    },
    { immediate: true },
  )

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    if (chatRoomId.value) {
      unsubscribeFromRoom(chatRoomId.value)
    }
  })

  return {
    messages,
    isTyping,
    onlineUsers,
    sendMessage,
    sendTypingStatus,
    getOtherUserId,
  }
}
