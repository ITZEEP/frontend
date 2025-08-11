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

      const socket = new SockJS('http://localhost:8080/ws')
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => console.log('[STOMP]', str),
        onConnect: () => {
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
          console.error('STOMP 에러:', frame)
          this.isConnecting.value = false
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

  sendContractChatMessage(contractChatId, senderId, receiverId, content, type = 'TEXT') {
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

    // 🔧 이미 구독된 토픽인지 확인
    if (this.messageHandlers.has(topic)) {
      console.log('이미 구독된 토픽:', topic)
      return this.messageHandlers.get(topic)
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
}

export const websocketService = new WebSocketService()
export default websocketService
