<template>
  <div class="white-box hover:bg-yellow-50 cursor-pointer p-4 border-b" @click="$emit('click')">
    <div class="flex items-center space-x-3">
      <!-- 상대방 프로필 이미지 -->
      <div class="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
        <img
          v-if="room.otherUserProfileUrl"
          :src="room.otherUserProfileUrl"
          :alt="room.otherUserNickname"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm"
        >
          {{ getInitial(room.otherUserNickname) }}
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <!-- 상대방 닉네임 -->
        <h3 class="text-base font-semibold text-gray-800 truncate">
          {{ room.otherUserNickname || '알 수 없는 사용자' }}
        </h3>

        <!-- 마지막 메시지 -->
        <p class="text-sm text-gray-500 truncate">
          {{ room.lastMessage || '메시지가 없습니다.' }}
        </p>

        <!-- 시간 및 읽지 않은 메시지 수 -->
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs text-gray-400">
            {{ formatTime(room.lastMessageAt) }}
          </span>
          <span
            v-if="room.unreadMessageCount > 0"
            class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
          >
            {{ room.unreadMessageCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  room: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// 닉네임 첫 글자 가져오기 (프로필 이미지 대체)
function getInitial(nickname) {
  return nickname ? nickname.charAt(0).toUpperCase() : '?'
}

// 시간 포맷팅
function formatTime(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped></style>
