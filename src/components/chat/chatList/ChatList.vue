<template>
  <div>
    <div class="flex border-b mb-2">
      <button
        class="flex-1 py-2 text-center font-semibold"
        :class="
          selectedTab === 'owner' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="selectedTab = 'owner'"
      >
        임대인
      </button>
      <button
        class="flex-1 py-2 text-center font-semibold"
        :class="
          selectedTab === 'buyer' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
        "
        @click="selectedTab = 'buyer'"
      >
        임차인
      </button>
    </div>

    <div v-if="loading" class="p-4 text-center text-gray-500">로딩 중...</div>
    <div v-else-if="error" class="p-4 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <ChatItem
        v-for="room in filteredRooms"
        :key="room.chatRoomId"
        :room="room"
        @click="select(room)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatItem from './ChatItem.vue'
import { getOwnerChatRooms, getBuyerChatRooms } from '@/components/chat/apis/chatApi'

const emit = defineEmits(['selectRoom'])

const chatRooms = ref([]) // 전체 채팅방 리스트
const ownerRooms = ref([]) // 임대인 방
const buyerRooms = ref([]) // 임차인 방
const selectedTab = ref('owner') // 선택된 탭: 'owner' | 'buyer'
const loading = ref(false)
const error = ref(null)

const filteredRooms = computed(() =>
  selectedTab.value === 'owner' ? ownerRooms.value : buyerRooms.value,
)

async function loadChatRooms() {
  try {
    loading.value = true
    error.value = null

    const [ownerRes, buyerRes] = await Promise.all([
      getOwnerChatRooms().catch(() => ({ data: [] })),
      getBuyerChatRooms().catch(() => ({ data: [] })),
    ])

    // 정렬: 최신 메시지 기준
    ownerRooms.value = ownerRes.data.sort(
      (a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt),
    )
    buyerRooms.value = buyerRes.data.sort(
      (a, b) => new Date(b.lastMessageAt || b.createdAt) - new Date(a.lastMessageAt || a.createdAt),
    )

    // 전체 리스트도 백업해둠 (필요 시)
    chatRooms.value = [...ownerRooms.value, ...buyerRooms.value]
  } catch (err) {
    error.value = '채팅방 목록을 불러올 수 없습니다.'
    console.error('채팅방 로드 오류:', err)
  } finally {
    loading.value = false
  }
}

function select(room) {
  emit('selectRoom', room)
}

onMounted(() => {
  loadChatRooms()
})
</script>

<style scoped>
button {
  transition: all 0.2s;
}
</style>
