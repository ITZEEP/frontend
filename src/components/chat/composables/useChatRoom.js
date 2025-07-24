import { ref, onUnmounted, watch, onMounted } from 'vue'
import websocketService from '@/components/chat/apis/websocket'

export function useChatRoom(chatRoomId, currentUserId, roomData) {
  const messages = ref([])
  const isTyping = ref(false)
  const onlineUsers = ref([])
  const isReady = ref(false)

  console.log('🔧 useChatRoom 초기화:', {
    chatRoomId: chatRoomId.value,
    currentUserId: currentUserId.value,
    roomData: roomData.value,
  })

  // 준비 상태 체크
  const checkReadyState = () => {
    const ready = currentUserId.value && chatRoomId.value && roomData.value
    isReady.value = ready
    console.log('🔄 useChatRoom 준비 상태:', {
      ready,
      currentUserId: currentUserId.value,
      chatRoomId: chatRoomId.value,
      roomData: !!roomData.value,
    })
    return ready
  }

  // 상대방 ID 가져오기
  const getOtherUserId = () => {
    console.log('🔍 상대방 ID 계산 시작')
    console.log('🔍 현재 사용자 ID:', currentUserId.value)
    console.log('🔍 방 데이터:', roomData.value)

    if (!roomData.value || !currentUserId.value) {
      console.log('❌ 상대방 ID 가져오기 실패 - 데이터 부족:', {
        roomData: roomData.value,
        currentUserId: currentUserId.value,
      })
      return null
    }

    console.log('🔍 채팅방 참여자:', {
      ownerId: roomData.value.ownerId,
      buyerId: roomData.value.buyerId,
      currentUserId: currentUserId.value,
    })

    // 현재 사용자가 소유자인지 구매자인지 확인 후 상대방 ID 반환
    if (currentUserId.value === roomData.value.ownerId) {
      console.log('📍 현재 사용자는 소유자, 상대방은 구매자:', roomData.value.buyerId)
      return roomData.value.buyerId
    } else if (currentUserId.value === roomData.value.buyerId) {
      console.log('📍 현재 사용자는 구매자, 상대방은 소유자:', roomData.value.ownerId)
      return roomData.value.ownerId
    }

    // 혹시 otherUserId가 직접 제공되는 경우
    const otherUserId = roomData.value.otherUserId || null
    console.log('📍 기타 상대방 ID:', otherUserId)
    console.log('⚠️ 현재 사용자가 채팅방 참여자가 아님!')

    return otherUserId
  }

  // 새 메시지 수신 핸들러
  const handleNewMessage = (message) => {
    console.log('🚨🚨🚨🚨🚨 handleNewMessage 호출됨!')
    console.log('📨 받은 메시지 상세:', message)
    console.log('📨 메시지 구조:', Object.keys(message))
    console.log('📨 메시지 타입:', typeof message)

    // 현재 메시지 배열 상태
    console.log('📋 현재 메시지 배열 길이:', messages.value.length)
    console.log('📋 현재 메시지 배열:', messages.value)

    // 메시지 추가
    messages.value.push(message)

    console.log('📋 메시지 추가 후 배열 길이:', messages.value.length)
    console.log('📋 메시지 추가 후 배열:', messages.value)
    console.log('🔥🔥🔥 messages.value 업데이트 완료!')
    const newArray = [...messages.value]
    messages.value = newArray
    // 메시지를 읽음으로 표시 (내가 받은 메시지가 아닐 때)
    if (message.receiverId === currentUserId.value) {
      console.log('👀 내가 받은 메시지 - 읽음 처리 필요')
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
    if (!roomId) {
      console.warn('⚠️ 구독할 채팅방 ID가 없습니다.')
      return
    }

    console.log('🔔 채팅방 구독:', roomId)

    // 채팅방 메시지 구독
    websocketService.onMessage(`/topic/chatroom/${roomId}`, handleNewMessage)

    // 타이핑 상태 구독
    websocketService.onMessage(`/topic/room/${roomId}/typing`, handleTypingStatus)
  }

  // 구독 해제
  const unsubscribeFromRoom = (roomId) => {
    if (!roomId) return

    console.log('🔕 채팅방 구독 해제:', roomId)
    websocketService.offMessage(`/topic/chatroom/${roomId}`)
    websocketService.offMessage(`/topic/room/${roomId}/typing`)
  }

  // WebSocket 초기화 및 구독
  const initializeWebSocket = async () => {
    if (!checkReadyState()) {
      console.log('⏳ 아직 준비되지 않음, WebSocket 초기화 대기')
      return
    }

    try {
      await websocketService.connect()
      console.log('✅ WebSocket 연결 완료')

      if (chatRoomId.value) {
        subscribeToRoom(chatRoomId.value)
      }
    } catch (err) {
      console.error('❌ WebSocket 연결 실패:', err)
    }
  }

  // 메시지 전송
  const sendMessage = (content, type = 'TEXT', fileUrl = null) => {
    console.log('📤 메시지 전송 시도:', {
      content,
      chatRoomId: chatRoomId.value,
      currentUserId: currentUserId.value,
      roomData: roomData.value,
    })

    // 필수 조건 체크 - undefined와 null 모두 체크
    if (!chatRoomId.value) {
      console.error('❌ 채팅방 ID가 없습니다:', chatRoomId.value)
      return false
    }

    if (!currentUserId.value || currentUserId.value === undefined) {
      console.error('❌ 현재 사용자 ID가 없거나 undefined입니다:', currentUserId.value)
      return false
    }

    if (!roomData.value) {
      console.error('❌ 채팅방 데이터가 없습니다:', roomData.value)
      return false
    }

    const receiverId = getOtherUserId()
    if (!receiverId) {
      console.error('❌ 상대방 ID를 찾을 수 없습니다')
      return false
    }

    console.log('✅ 메시지 전송 조건 충족, WebSocket으로 전송:', {
      chatRoomId: chatRoomId.value,
      senderId: currentUserId.value,
      receiverId,
      content,
      type,
    })

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
      console.error('❌ 메시지 전송 중 오류:', error)
      return false
    }
  }

  // 타이핑 상태 전송
  const sendTypingStatus = (typing) => {
    if (!chatRoomId.value) {
      console.warn('⚠️ 타이핑 상태 전송 실패 - 채팅방 ID 없음')
      return
    }

    if (!currentUserId.value) {
      console.warn('⚠️ 타이핑 상태 전송 실패 - 사용자 ID 없음')
      return
    }

    console.log('⌨️ 타이핑 상태 전송:', { chatRoomId: chatRoomId.value, typing })

    try {
      websocketService.sendMessage(`/app/chat/${chatRoomId.value}/typing`, {
        userId: currentUserId.value,
        isTyping: typing,
      })
    } catch (error) {
      console.error('❌ 타이핑 상태 전송 오류:', error)
    }
  }

  // currentUserId 변경 감지
  watch(
    currentUserId,
    (newUserId) => {
      console.log('👤 사용자 ID 변경:', newUserId)
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
      console.log('🏠 방 데이터 변경:', newRoomData)
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
      console.log('🔄 채팅방 변경 감지:', { old: oldRoomId, new: newRoomId })

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
    console.log('🎯 준비 상태 변경:', ready)
    if (ready) {
      initializeWebSocket()
    }
  })

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    console.log('🚀 useChatRoom 마운트됨')
    checkReadyState()
  })

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    console.log('🧹 useChatRoom 정리')
    if (chatRoomId.value) {
      unsubscribeFromRoom(chatRoomId.value)
    }
  })

  return {
    messages,
    isTyping,
    onlineUsers,
    isReady,
    sendMessage,
    sendTypingStatus,
    getOtherUserId,
  }
}
