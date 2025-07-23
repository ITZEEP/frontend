import { ref } from 'vue'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = ref(false)
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
    this.messageHandlers = new Map()
    this.connectionHandlers = []
  }

  // WebSocket 연결
  connect() {
    try {
      // 백엔드 WebSocket 엔드포인트
      this.socket = new WebSocket('ws://localhost:8080/ws')

      this.socket.onopen = () => {
        console.log('WebSocket 연결됨')
        this.isConnected.value = true
        this.reconnectAttempts = 0

        // 연결 핸들러들 실행
        this.connectionHandlers.forEach((handler) => handler(true))
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket 메시지 수신:', data)

          // 메시지 타입별 핸들러 실행
          this.messageHandlers.forEach((handler, type) => {
            if (data.type === type || type === 'all') {
              handler(data)
            }
          })
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error)
        }
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket 연결 종료:', event.code, event.reason)
        this.isConnected.value = false

        // 연결 핸들러들 실행
        this.connectionHandlers.forEach((handler) => handler(false))

        // 자동 재연결 시도
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket 오류:', error)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
    }
  }

  // 재연결 스케줄링
  scheduleReconnect() {
    this.reconnectAttempts++
    console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  // 메시지 전송
  sendMessage(destination, message) {
    if (!this.isConnected.value) {
      console.error('WebSocket이 연결되지 않음')
      return false
    }

    try {
      const payload = {
        destination,
        ...message,
        timestamp: new Date().toISOString(),
      }

      this.socket.send(JSON.stringify(payload))
      console.log('WebSocket 메시지 전송:', payload)
      return true
    } catch (error) {
      console.error('WebSocket 메시지 전송 오류:', error)
      return false
    }
  }

  // 채팅 메시지 전송
  sendChatMessage(chatRoomId, senderId, receiverId, content, type = 'TEXT', fileUrl = null) {
    return this.sendMessage('/app/chat.send', {
      chatRoomId,
      senderId,
      receiverId,
      content,
      type,
      fileUrl,
    })
  }

  // 메시지 핸들러 등록
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  // 메시지 핸들러 제거
  offMessage(type) {
    this.messageHandlers.delete(type)
  }

  // 연결 상태 핸들러 등록
  onConnection(handler) {
    this.connectionHandlers.push(handler)
  }

  // 특정 채팅방 구독
  subscribeToChatRoom(chatRoomId, handler) {
    const topic = `/topic/chatroom/${chatRoomId}`
    this.onMessage(topic, handler)
  }

  // 연결 종료
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isConnected.value = false
    }
  }

  // 연결 상태 확인
  getConnectionStatus() {
    return this.isConnected.value
  }
}

// 싱글톤 인스턴스
export const websocketService = new WebSocketService()
export default websocketService
