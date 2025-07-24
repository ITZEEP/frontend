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
          console.log('🚨🚨🚨 STOMP 연결 성공!')
          this.isConnected.value = true

          // 대기 중인 구독들을 실행
          console.log('📋 대기 중인 구독 수:', this.pendingSubscriptions.length)
          this.pendingSubscriptions.forEach(({ topic, handler }) => {
            console.log('⏰ 대기 중이던 구독 실행:', topic)
            this.subscribeToTopic(topic, handler)
          })
          this.pendingSubscriptions = []

          // 연결 핸들러들 실행
          this.connectionHandlers.forEach((handler) => handler(true))
          resolve()
        },
        onDisconnect: () => {
          console.log('🚨 STOMP 연결 해제됨')
          this.isConnected.value = false
          this.connectionHandlers.forEach((handler) => handler(false))
        },
        onStompError: (frame) => {
          console.error('🚨 STOMP 에러:', frame)
          reject(frame)
        },
      })

      this.stompClient.activate()
    })
  }

  sendMessage(destination, message) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('🚨 STOMP가 연결되지 않음')
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

      console.log('📤 메시지 전송됨:', destination, payload)
      return true
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error)
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

    console.log('💬 채팅 메시지 전송 결과:', success)
    return success
  }

  onMessage(topic, handler) {
    console.log('🔔 구독 시도:', topic)
    console.log('🔌 현재 연결 상태:', this.isConnected.value)
    console.log('🔌 STOMP 클라이언트 연결:', this.stompClient?.connected)

    if (!this.stompClient) {
      console.warn('⚠️ STOMP 클라이언트가 초기화되지 않았습니다.')
      return
    }

    // 연결 상태를 더 정확히 체크
    if (!this.isConnected.value || !this.stompClient.connected) {
      console.log('⏳ 연결 대기 중, 구독을 대기열에 추가:', topic)
      this.pendingSubscriptions.push({ topic, handler })
      return
    }

    // 연결되어 있으면 바로 구독
    this.subscribeToTopic(topic, handler)
  }

  subscribeToTopic(topic, handler) {
    // 연결 상태 재확인
    if (!this.stompClient || !this.stompClient.connected || !this.isConnected.value) {
      console.warn('🚫 구독 불가 - STOMP 연결 상태 불안정:', {
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
      console.log('📡📡📡 실제 구독 시작:', topic)
      console.log('📡 STOMP 클라이언트 상태:', this.stompClient.connected)
      console.log('📡 현재 활성 구독 수:', this.messageHandlers.size)

      const subscription = this.stompClient.subscribe(topic, (message) => {
        console.log('💥💥💥💥💥💥💥 STOMP 메시지 수신 감지!!!!!!')
        console.log('💥 수신 Topic:', topic)
        console.log('💥 메시지 Destination:', message.headers.destination)
        console.log('💥 메시지 ID:', message.headers['message-id'])
        console.log('💥 메시지 Body 길이:', message.body?.length)
        console.log('💥 Raw Body:', message.body)

        try {
          const data = JSON.parse(message.body)
          console.log('💥💥💥 파싱 성공! 데이터:', data)
          console.log('💥 데이터 키들:', Object.keys(data))
          console.log('💥 ChatRoomId:', data.chatRoomId)
          console.log('💥 SenderId:', data.senderId)
          console.log('💥 Content:', data.content)

          console.log('🔥🔥🔥🔥🔥 핸들러 호출 직전!')
          console.log('🔥 핸들러 타입:', typeof handler)

          const result = handler(data)
          console.log('🔥🔥🔥🔥🔥 핸들러 호출 완료! 결과:', result)
        } catch (e) {
          console.error('❌❌❌❌❌ 파싱 실패:', e)
          console.error('❌ Raw body:', message.body)
          console.error('❌ Body 타입:', typeof message.body)
        }
      })

      this.messageHandlers.set(topic, subscription)
      console.log('✅✅✅✅✅ 구독 등록 완료:', topic)
      console.log('📋 현재 모든 구독:', Array.from(this.messageHandlers.keys()))
      console.log('📋 구독 객체:', subscription)

      return subscription
    } catch (error) {
      console.error('❌❌❌❌❌ 구독 실패:', topic, error)
      console.error('❌ 에러 스택:', error.stack)
    }
  }
  offMessage(topic) {
    const subscription = this.messageHandlers.get(topic)
    if (subscription) {
      subscription.unsubscribe()
      this.messageHandlers.delete(topic)
      console.log(`🔕 구독 해제됨: ${topic}`)
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
