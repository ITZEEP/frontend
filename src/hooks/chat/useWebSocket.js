import { ref } from 'vue'
import websocketService from '@/apis/websocket'

export function useWebSocket() {
  const isConnected = ref(false)
  const connectionStatus = ref('disconnected')

  const connect = async () => {
    try {
      connectionStatus.value = 'connecting'
      await websocketService.connect()
      connectionStatus.value = 'connected'
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      connectionStatus.value = 'disconnected'
    }
  }

  const disconnect = () => {
    websocketService.disconnect()
    connectionStatus.value = 'disconnected'
  }

  const sendMessage = async (destination, message) => {
    return websocketService.sendMessage(destination, message)
  }

  const sendChatMessage = async (chatRoomId, senderId, receiverId, content, type = 'TEXT') => {
    return websocketService.sendChatMessage(chatRoomId, senderId, receiverId, content, type)
  }

  // 🔧 계약 채팅 메시지 전송 메서드 추가
  const sendContractChatMessage = async (
    contractChatId,
    senderId,
    receiverId,
    content,
    type = 'TEXT',
  ) => {
    return websocketService.sendContractChatMessage(
      contractChatId,
      senderId,
      receiverId,
      content,
      type,
    )
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
    sendContractChatMessage,
  }
}
