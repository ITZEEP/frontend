import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ref } from 'vue'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.isConnected = ref(false)
    this.messageHandlers = new Map()
    this.connectionHandlers = []
    this.pendingSubscriptions = [] // 대기 중인 구독들
  }

  connect() {
    return new Promise((resolve, reject) => {
      const socket = new SockJS('http://localhost:8080/ws')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP]', str),
        onConnect: () => {
          this.isConnected.value = true

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
          this.connectionHandlers.forEach((handler) => handler(false))
        },
        onStompError: (frame) => {
          console.error('STOMP 에러:', frame)
          reject(frame)
        },
      })

      this.stompClient.activate()
    })
  }

  sendMessage(destination, message) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP가 연결되지 않음')
      return false
    }

    try {
      const payload = {
        ...message,
      }

      this.stompClient.publish({
        destination,
        body: JSON.stringify(payload),
      })
      return true
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      return false
    }
  }

  sendChatMessage(chatRoomId, senderId, receiverId, content, type = 'TEXT', fileUrl = null) {
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

  onMessage(topic, handler) {
    if (!this.stompClient) {
      console.warn('TOMP 클라이언트가 초기화되지 않았습니다.')
      return
    }

    // 연결 상태를 더 정확히 체크
    if (!this.isConnected.value || !this.stompClient.connected) {
      this.pendingSubscriptions.push({ topic, handler })
      return
    }

    // 연결되어 있으면 바로 구독
    this.subscribeToTopic(topic, handler)
  }

  subscribeToTopic(topic, handler) {
    // 연결 상태 재확인
    if (!this.stompClient || !this.stompClient.connected || !this.isConnected.value) {
      console.warn('구독 불가 - STOMP 연결 상태 불안정:', {
        hasClient: !!this.stompClient,
        clientConnected: this.stompClient?.connected,
        isConnected: this.isConnected.value,
      })
      if (!this.pendingSubscriptions.find((p) => p.topic === topic)) {
        this.pendingSubscriptions.push({ topic, handler })
      }
      return
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
    }
  }

  getConnectionStatus() {
    return this.isConnected.value
  }
}

export const websocketService = new WebSocketService()
export default websocketService
