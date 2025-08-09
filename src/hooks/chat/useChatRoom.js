import { ref, onUnmounted, watch, onMounted } from 'vue'
import websocketService from '@/apis/websocket'

export function useChatRoom(chatRoomId, currentUserId, roomData) {
  const messages = ref([])
  const onlineUsers = ref([])
  const isReady = ref(false)
  // 준비 상태 체크
  const checkReadyState = () => {
    const ready = currentUserId.value && chatRoomId.value && roomData.value
    isReady.value = ready
    return ready
  }

  // 상대방 ID 가져오기
  const getOtherUserId = () => {
    if (!roomData.value || !currentUserId.value) {
      console.log('상대방 ID 가져오기 실패 - 데이터 부족:', {
        roomData: roomData.value,
        currentUserId: currentUserId.value,
      })
      return null
    }
    // 현재 사용자가 소유자인지 구매자인지 확인 후 상대방 ID 반환
    if (currentUserId.value === roomData.value.ownerId) {
      return roomData.value.buyerId
    } else if (currentUserId.value === roomData.value.buyerId) {
      return roomData.value.ownerId
    }

    // 혹시 otherUserId가 직접 제공되는 경우
    const otherUserId = roomData.value.otherUserId || null
    return otherUserId
  }

  // 새 메시지 수신 핸들러
  const handleNewMessage = (message) => {
    // 메시지 추가
    messages.value.push(message)
    const newArray = [...messages.value]
    messages.value = newArray
    // 메시지를 읽음으로 표시 (내가 받은 메시지가 아닐 때)
    if (message.receiverId === currentUserId.value) {
      console.log('내가 받은 메시지 - 읽음 처리 필요')
    }
  }

  // 채팅방 구독
  const subscribeToRoom = (roomId) => {
    if (!roomId) {
      console.warn('구독할 채팅방 ID가 없습니다.')
      return
    }

    // 채팅방 메시지 구독
    websocketService.onMessage(`/topic/chatroom/${roomId}`, handleNewMessage)
  }

  // 구독 해제
  const unsubscribeFromRoom = (roomId) => {
    if (!roomId) return
    websocketService.offMessage(`/topic/chatroom/${roomId}`)
  }

  // WebSocket 초기화 및 구독
  const initializeWebSocket = async () => {
    if (!checkReadyState()) {
      return
    }

    try {
      await websocketService.connect()
      console.log('WebSocket 연결 완료')

      if (chatRoomId.value) {
        subscribeToRoom(chatRoomId.value)
      }
    } catch (err) {
      console.error('WebSocket 연결 실패:', err)
    }
  }

  // 메시지 전송
  const sendMessage = (content, type = 'TEXT', fileUrl = null) => {
    // 필수 조건 체크 - undefined와 null 모두 체크
    if (!chatRoomId.value) {
      console.error('채팅방 ID가 없습니다:', chatRoomId.value)
      return false
    }

    if (!currentUserId.value || currentUserId.value === undefined) {
      console.error('현재 사용자 ID가 없거나 undefined입니다:', currentUserId.value)
      return false
    }

    if (!roomData.value) {
      console.error('채팅방 데이터가 없습니다:', roomData.value)
      return false
    }

    const receiverId = getOtherUserId()
    if (!receiverId) {
      console.error('상대방 ID를 찾을 수 없습니다')
      return false
    }
    try {
      return websocketService.sendChatMessage(
        chatRoomId.value,
        currentUserId.value,
        receiverId,
        content,
        type,
        fileUrl,
      )
    } catch (error) {
      console.error('메시지 전송 중 오류:', error)
      return false
    }
  }

  // currentUserId 변경 감지
  watch(
    currentUserId,
    (newUserId) => {
      if (newUserId) {
        checkReadyState()
        initializeWebSocket()
      }
    },
    { immediate: true },
  )

  // roomData 변경 감지
  watch(
    roomData,
    (newRoomData) => {
      if (newRoomData) {
        checkReadyState()
        initializeWebSocket()
      }
    },
    { immediate: true },
  )

  // 채팅방 변경 감지
  watch(
    chatRoomId,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        unsubscribeFromRoom(oldRoomId)
      }

      if (newRoomId) {
        checkReadyState()
        if (isReady.value) {
          subscribeToRoom(newRoomId)
        }
      }
    },
    { immediate: true },
  )

  // 준비 상태 변경 감지
  watch(isReady, (ready) => {
    if (ready) {
      initializeWebSocket()
    }
  })

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    checkReadyState()
  })

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    if (chatRoomId.value) {
      unsubscribeFromRoom(chatRoomId.value)
    }
  })

  return {
    messages,
    onlineUsers,
    isReady,
    sendMessage,
    getOtherUserId,
  }
}
