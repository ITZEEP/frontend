import { ref } from 'vue'
import websocketService from '@/components/chat/apis/websocket'

export function useWebSocket() {
  const isConnected = ref(false)
  const connectionStatus = ref('disconnected') // 'connecting', 'connected', 'disconnected'

  const connect = async () => {
    connectionStatus.value = 'connecting'
    await websocketService.connect() // 연결 완료까지 기다림
    connectionStatus.value = 'connected'
  }

  const disconnect = () => {
    websocketService.disconnect()
    connectionStatus.value = 'disconnected'
  }

  const sendMessage = (destination, message) => {
    return websocketService.sendMessage(destination, message)
  }

  const sendChatMessage = (chatRoomId, senderId, receiverId, content, type = 'TEXT') => {
    return websocketService.sendChatMessage(chatRoomId, senderId, receiverId, content, type)
  }

  // 연결 상태 감지
  websocketService.onConnection((connected) => {
    isConnected.value = connected
    connectionStatus.value = connected ? 'connected' : 'disconnected'
  })

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendChatMessage,
  }
}
