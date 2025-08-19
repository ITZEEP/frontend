import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ref } from 'vue'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.isConnected = ref(false)
    this.isConnecting = ref(false)
    this.messageHandlers = new Map()
    this.connectionHandlers = []
    this.pendingSubscriptions = [] // 대기 중인 구독들
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected.value) {
        console.log('이미 WebSocket이 연결되어 있습니다.')
        resolve()
        return
      }

      if (this.isConnecting.value) {
        console.log('WebSocket 연결이 이미 진행 중입니다.')
        const checkConnection = () => {
          if (this.isConnected.value) {
            resolve()
          } else if (!this.isConnecting.value) {
            reject(new Error('연결 실패'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
        return
      }

      this.isConnecting.value = true

      const socket = new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 2000, // 재연결 지연 시간 단축
        debug: (str) => console.log('[STOMP DEBUG]', str),
        onConnect: (frame) => {
          console.log('STOMP 연결 성공:', frame)
          this.isConnected.value = true
          this.isConnecting.value = false

          // 대기 중인 구독들을 실행
          this.pendingSubscriptions.forEach(({ topic, handler }) => {
            this.subscribeToTopic(topic, handler)
          })
          this.pendingSubscriptions = []

          // 연결 핸들러들 실행
          this.connectionHandlers.forEach((handler) => handler(true))
          resolve()
        },
        onDisconnect: () => {
          this.isConnected.value = false
          this.isConnecting.value = false
          this.connectionHandlers.forEach((handler) => handler(false))
        },
        onStompError: (frame) => {
          console.error('STOMP 에러 발생:', frame)
          console.error('에러 헤더:', frame.headers)
          console.error('에러 바디:', frame.body)
          this.isConnecting.value = false
          this.isConnected.value = false
          reject(frame)
        },
        onWebSocketError: (error) => {
          console.error('WebSocket 에러:', error)
        },
        onWebSocketClose: (event) => {
          console.log('WebSocket 연결 종료:', event)
        },
      })

      this.stompClient.activate()
    })
  }

  async sendMessage(destination, message, retryCount = 30) {
    console.log('sendMessage 호출:', { destination, message })
    console.log('STOMP 클라이언트 상태:', {
      hasClient: !!this.stompClient,
      isConnected: this.stompClient?.connected,
      internalConnected: this.isConnected.value,
    })

    if (!this.stompClient || !this.stompClient.connected) {
      try {
        await this.connect()
      } catch (e) {
        console.error('STOMP 연결 실패:', e)
        return false
      }
    }

    // 연결 준비될 때까지 폴링 (connected 플래그만 사용)
    let attempts = retryCount
    while ((!this.stompClient || !this.stompClient.connected) && attempts > 0) {
      console.warn(`STOMP 연결 대기... (남은 시도: ${attempts})`)
      await new Promise((r) => setTimeout(r, 200))
      attempts--
    }
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP 연결 실패 - 재시도 횟수 초과')
      return false
    }

    try {
      const payload = {
        ...message,
      }

      console.log('전송할 페이로드:', payload)
      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload),
      })
      console.log('메시지 전송 성공')
      return true
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      if (retryCount > 0) {
        console.log(`메시지 전송 재시도... (남은 시도: ${retryCount})`)
        await new Promise((resolve) => setTimeout(resolve, 200))
        return this.sendMessage(destination, message, retryCount - 1)
      }
      return false
    }
  }

  async sendChatMessage(chatRoomId, senderId, receiverId, content, type = 'TEXT', fileUrl = null) {
    const success = this.sendMessage('/app/chat/send', {
      chatRoomId,
      senderId,
      receiverId,
      content,
      type,
      fileUrl,
    })
    return success
  }

  // websocketService.js에 추가
  notifyEnterChatRoom(userId, chatRoomId) {
    return this.sendMessage('/app/chat/enter', {
      userId,
      chatRoomId,
    })
  }

  notifyLeaveChatRoom(userId) {
    return this.sendMessage('/app/chat/leave', {
      userId,
    })
  }

  setUserOffline(userId) {
    return this.sendMessage('/app/user/offline', {
      userId,
    })
  }

  async sendContractChatMessage(contractChatId, senderId, receiverId, content, type = 'TEXT') {
    const success = this.sendMessage('/app/contract/chat/send', {
      contractChatId,
      senderId,
      receiverId,
      content,
      type,
    })
    return success
  }

  notifyContractChatEnter(userId, contractChatId) {
    return this.sendMessage('/app/contract/chat/enter', {
      userId,
      contractChatId,
    })
  }

  notifyContractChatLeave(userId, contractChatId) {
    return this.sendMessage('/app/contract/chat/leave', {
      userId,
      contractChatId,
    })
  }

  notifyContractUserOffline(userId, contractChatId) {
    return this.sendMessage('/app/contract/user/offline', {
      userId,
      contractChatId,
    })
  }

  // 계약서 내보내기 관련 메서드
  sendContractExportSignature(contractChatId, signatureData) {
    return this.sendMessage(`/app/contract/${contractChatId}/export/signature`, signatureData)
  }

  sendContractExportPassword(contractChatId, passwordData) {
    return this.sendMessage(`/app/contract/${contractChatId}/export/password`, passwordData)
  }

  getContractExportStatus(contractChatId) {
    return this.sendMessage(`/app/contract/${contractChatId}/export/status`, {})
  }

  onMessage(topic, handler) {
    if (!this.stompClient) {
      console.warn('STOMP 클라이언트가 초기화되지 않았습니다.')
      return
    }

    // 연결 상태를 더 정확히 체크
    if (!this.isConnected.value || !this.stompClient.connected) {
      if (!this.pendingSubscriptions.find((p) => p.topic === topic)) {
        this.pendingSubscriptions.push({ topic, handler })
      }
      return
    }

    // 연결되어 있으면 바로 구독
    this.subscribeToTopic(topic, handler)
  }

  subscribeToTopic(topic, handler) {
    if (!this.stompClient || !this.stompClient.connected || !this.isConnected.value) {
      console.warn('구독 불가 - STOMP 연결 상태 불안정')
      if (!this.pendingSubscriptions.find((p) => p.topic === topic)) {
        this.pendingSubscriptions.push({ topic, handler })
      }
      return
    }

    // 🔧 이미 구독된 토픽인지 확인 (빠른 리턴)
    const existingSubscription = this.messageHandlers.get(topic)
    if (existingSubscription) {
      return existingSubscription
    }

    try {
      const subscription = this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body)
          const result = handler(data)
          console.log('핸들러 호출 완료! 결과:', result)
        } catch (e) {
          console.error('파싱 실패:', e)
          console.error('Raw body:', message.body)
          console.error('Body 타입:', typeof message.body)
        }
      })

      this.messageHandlers.set(topic, subscription)
      return subscription
    } catch (error) {
      console.error('구독 실패:', topic, error)
      console.error('에러 스택:', error.stack)
    }
  }

  offMessage(topic) {
    const subscription = this.messageHandlers.get(topic)
    if (subscription) {
      subscription.unsubscribe()
      this.messageHandlers.delete(topic)
    }
  }

  onConnection(handler) {
    this.connectionHandlers.push(handler)
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.isConnected.value = false
      this.isConnecting.value = false
    }
  }

  getConnectionStatus() {
    return this.isConnected.value
  }

  getStompClient() {
    return this.stompClient
  }
}

export const websocketService = new WebSocketService()
export default websocketService
