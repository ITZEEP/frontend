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

  const canSendMessage = ref(false)
  const onlineStatus = ref({
    ownerInContractRoom: false,
    buyerInContractRoom: false,
    bothInRoom: false,
    canChat: false,
  })

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

  // useContractChat.js에서 에러 핸들러 수정
  const handleContractError = (errorData) => {
    console.log('💥 계약 채팅 에러 수신:', errorData)

    if (errorData.error === 'OFFLINE_USER') {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && String(lastMessage.senderId) === String(currentUserId.value)) {
        messages.value.pop() // 마지막 메시지 제거
        console.log('오프라인으로 인해 마지막 메시지 제거됨')
      }
    }

    errorCallbacks.value.forEach((callback) => {
      try {
        callback(errorData)
      } catch (error) {
        console.error('에러 콜백 실행 실패:', error)
      }
    })
  }

  // 🔧 온라인 상태 변경 핸들러 수정
  const handleOnlineStatusChange = (statusData) => {
    console.log('온라인 상태 변경 수신:', statusData)

    // 서버가 전체 상태맵을 주는 경우 그대로 사용
    if (
      statusData &&
      (Object.prototype.hasOwnProperty.call(statusData, 'bothInRoom') ||
        Object.prototype.hasOwnProperty.call(statusData, 'ownerInContractRoom') ||
        Object.prototype.hasOwnProperty.call(statusData, 'buyerInContractRoom'))
    ) {
      onlineStatus.value = statusData
      canSendMessage.value = !!(statusData.bothInRoom || statusData.canChat)
      return
    }

    // 서버가 단순 { userId, isOnline } 로 주는 경우, 클라이언트에서 보강
    const cd = contractData.value || {}
    const ownerId = cd.ownerId
    const buyerId = cd.buyerId

    const prev = onlineStatus.value || {}
    const ownerOnline =
      String(statusData?.userId) === String(ownerId)
        ? !!statusData?.isOnline
        : !!prev.ownerInContractRoom
    const buyerOnline =
      String(statusData?.userId) === String(buyerId)
        ? !!statusData?.isOnline
        : !!prev.buyerInContractRoom

    const enriched = {
      ownerId,
      buyerId,
      ownerInContractRoom: ownerOnline,
      buyerInContractRoom: buyerOnline,
      bothInRoom: ownerOnline && buyerOnline,
      canChat: ownerOnline && buyerOnline,
      // 원본 필드도 유지
      ...statusData,
    }

    onlineStatus.value = enriched
    canSendMessage.value = enriched.bothInRoom || enriched.canChat
  }

  // 🔧 온라인 상태 확인 API 호출 함수 추가
  const checkOnlineStatus = async () => {
    if (!contractChatId.value) return

    try {
      // chatApi와 동일한 패턴으로 토큰 및 헤더 설정
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access-token')
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      }

      const response = await fetch(`/api/chat/contract/${contractChatId.value}/online-status`, {
        method: 'GET',
        headers: headers,
      })

      if (response.ok) {
        const apiResponse = await response.json()
        // ApiResponse<Map<String, Object>> 구조에 맞게 데이터 추출
        if (apiResponse.success && apiResponse.data) {
          handleOnlineStatusChange(apiResponse.data)
        } else {
          console.warn('온라인 상태 API 응답 실패:', apiResponse.message)
        }
      } else {
        console.error('온라인 상태 확인 API 응답 오류:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('온라인 상태 확인 실패:', error)
    }
  }

  const subscribeToContractRoom = (roomId) => {
    if (!roomId) return

    websocketService.onMessage(`/topic/contract-chat/${roomId}`, (msg) => {
      if (msg?.type === 'PRESENCE') {
        return handleOnlineStatusChange(msg)
      }
      handleNewMessage(msg)
    })

    // 타이핑 토픽
    websocketService.onMessage(`/topic/contract-chat/${roomId}/typing`, (typingData) => {
      isTyping.value = typingData.isTyping
    })

    // 에러/온라인 상태는 user 큐
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

  // useContractChat.js의 initializeWebSocket 함수 수정
  const initializeWebSocket = async () => {
    if (!checkReadyState()) return

    if (isInitialized.value) {
      console.log('⏸️ 이미 초기화됨')
      return
    }

    try {
      console.log('🚀 WebSocket 초기화 시작')
      isInitialized.value = true

      await websocketService.connect()
      console.log('✅ WebSocket 연결 완료')

      if (contractChatId.value) {
        console.log('📡 채팅방 구독 시작:', contractChatId.value)
        subscribeToContractRoom(contractChatId.value)

        // 🔥 입장 메시지 강제 전송 (수정된 부분)
        console.log('🚪 입장 메시지 전송 시도')
        console.log('전송할 데이터:', {
          userId: currentUserId.value,
          contractChatId: contractChatId.value,
        })

        const enterResult = websocketService.sendMessage('/app/contract/chat/enter', {
          userId: currentUserId.value,
          contractChatId: contractChatId.value,
        })

        console.log('🚪 입장 메시지 전송 결과:', enterResult)

        // 만약 실패하면 재시도
        if (!enterResult) {
          console.log('❌ 입장 메시지 전송 실패, 1초 후 재시도')
          setTimeout(() => {
            const retryResult = websocketService.sendMessage('/app/contract/chat/enter', {
              userId: currentUserId.value,
              contractChatId: contractChatId.value,
            })
            console.log('🔄 입장 메시지 재시도 결과:', retryResult)
          }, 1000)
        }

        // 🔧 온라인 상태 초기 확인
        setTimeout(() => {
          checkOnlineStatus()
        }, 1000)
      }
    } catch (err) {
      console.error('계약 채팅 WebSocket 연결 실패:', err)
      isInitialized.value = false
    }
  }

  // 🔧 메시지 전송 함수 수정 - 온라인 상태 체크 추가
  const sendContractMessage = (content, type = 'TEXT', fileUrl = null) => {
    if (!contractChatId.value || !currentUserId.value) {
      console.error('필수 정보 부족')
      return { success: false, error: '필수 정보가 부족합니다.' }
    }

    // 🔧 온라인 상태 체크
    if (!canSendMessage.value) {
      console.warn('메시지 전송 차단 - 상대방이 오프라인 상태')
      return {
        success: false,
        error: '상대방이 오프라인 상태입니다. 상대방이 접속한 후 메시지를 보내주세요.',
        isOffline: true,
      }
    }

    const receiverId = getOtherUserId()
    if (!receiverId) {
      return { success: false, error: '수신자를 찾을 수 없습니다.' }
    }

    try {
      const result = websocketService.sendMessage('/app/contract/chat/send', {
        contractChatId: contractChatId.value,
        senderId: currentUserId.value,
        receiverId: receiverId,
        content: content,
        type: type,
        fileUrl: fileUrl,
      })

      return { success: result }
    } catch (error) {
      console.error('계약 채팅 메시지 전송 중 오류:', error)
      return { success: false, error: error.message }
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
    canSendMessage,
    onlineStatus,
    checkOnlineStatus,

    onContractError: (callback) => errorCallbacks.value.push(callback),
    offContractError: (callback) => {
      const index = errorCallbacks.value.indexOf(callback)
      if (index > -1) errorCallbacks.value.splice(index, 1)
    },
  }
}
