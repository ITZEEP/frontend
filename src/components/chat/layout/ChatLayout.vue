<template>
  <div class="flex h-full">
    <div class="w-1/3 border-r">
      <ChatList @selectRoom="handleRoomSelection" ref="chatListRef" />
    </div>
    <div class="flex-1">
      <!--  선택된 채팅방이 있을 때만 렌더링 -->
      <ChatRoom
        v-if="selectedRoom"
        :room="selectedRoom"
        :key="`room-${selectedRoom.chatRoomId}`"
        @room-closed="handleRoomClosed"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md mx-4">
          <!-- 채팅 아이콘 -->
          <div class="mb-8 flex items-center justify-center text-gray-300">
            <IconChatWait />
          </div>
          <!-- 제목 -->
          <h2 class="text-2xl font-bold text-gray-800 mb-8">채팅 에티켓 안내</h2>

          <!-- 에티켓 리스트 -->
          <div class="space-y-6 text-left">
            <!-- 첫 번째 항목 -->
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">
                상호 존중하며 정중한 언어를 사용해주세요
              </p>
            </div>

            <!-- 두 번째 항목 -->
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">
                개인정보 보호를 위해 필요한 정보만 공유해주세요
              </p>
            </div>

            <!-- 세 번째 항목 -->
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">
                매물 문의는 구체적이고 명확하게 해주세요
              </p>
            </div>

            <!-- 네 번째 항목 -->
            <div class="flex items-center space-x-4">
              <div
                class="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">
                약속 시간을 지키고 변경 시 미리 알려주세요
              </p>
            </div>
          </div>

          <!-- 하단 안내 텍스트 -->
          <div class="mt-10 pt-6 border-t border-gray-200">
            <p class="text-gray-600 text-sm leading-relaxed">
              왼쪽에서 대화를 선택하여 메시지를 시작하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatList from '@/components/chat/chatList/ChatList.vue'
import ChatRoom from '@/components/chat/chatRoom/ChatRoom.vue'
import IconChatWait from '@/components/icons/IconChatWait.vue'

const selectedRoom = ref(null) //  초기값을 null로 설정
const chatListRef = ref(null)

//  채팅방 선택 핸들러
function handleRoomSelection(room) {
  console.log('채팅방 선택 변경:', {
    이전: selectedRoom.value?.chatRoomId,
    현재: room?.chatRoomId,
  })

  selectedRoom.value = room // null일 수도 있음
}

//  채팅방 닫힘 핸들러 (ChatRoom 컴포넌트에서 발생)
function handleRoomClosed() {
  console.log('채팅방이 닫혔습니다')
  selectedRoom.value = null

  // ChatList의 현재 채팅방 ID도 초기화
  if (chatListRef.value && chatListRef.value.setCurrentChatRoom) {
    chatListRef.value.setCurrentChatRoom(null)
  }
}
</script>
