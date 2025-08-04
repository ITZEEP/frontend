<template>
  <div class="bg-white border-b border-gray-200">
    <!-- 기존 네비게이션 헤더 -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div class="flex items-center space-x-3"></div>
      <div class="flex items-center space-x-2">
        <!-- 계약 작성 버튼 - 구매자에게만 보임 -->
        <BaseButton v-if="isBuyer" @click="handleClickGoToContract" variant="gray">
          계약서 작성하기
        </BaseButton>
      </div>
    </div>

    <!-- 매물 정보 섹션 -->
    <div v-if="propertyInfo && propertyInfo.propertyAddress" class="px-4 py-3">
      <div class="flex items-center space-x-3">
        <!-- 매물 이미지 -->
        <div class="flex-shrink-0">
          <img
            :src="propertyInfo.propertyImageUrl"
            :alt="propertyInfo.propertyAddress"
            class="w-12 h-12 rounded-lg object-cover border border-gray-200"
            @error="handleImageError"
          />
        </div>

        <!-- 매물 정보 -->
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">
            {{ propertyInfo.propertyAddress }}
          </div>
          <div class="text-sm text-gray-600 mt-1">
            {{ propertyInfo.propertyTitle }}
          </div>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="loadingProperty" class="px-4 py-3">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div class="h-5 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getChatRoomInfo, requestContract } from '@/apis/chatApi'
import BaseButton from '@/components/common/BaseButton.vue'
// import { useRouter } from 'vue-router'

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
  currentUserId: {
    // 현재 로그인된 사용자 ID 추가
    type: Number,
    required: true,
  },
})

const propertyInfo = ref(null)
const loadingProperty = ref(false)

// const router = useRouter()

const isBuyer = computed(() => {
  return props.currentUserId === props.room?.buyerId
})

// 계약서 작성하러 가기
const handleClickGoToContract = () => {
  if (!props.room?.chatRoomId) return

  requestContract(props.room?.chatRoomId)
}

// 매물 정보 API 호출
const fetchPropertyInfo = async () => {
  if (!props.room?.chatRoomId) {
    return
  }

  try {
    loadingProperty.value = true
    const result = await getChatRoomInfo(props.room.chatRoomId)

    if (result.success && result.data) {
      propertyInfo.value = result.data
    }
  } catch (error) {
    console.error('매물 정보 로드 실패:', error)
    // 에러 시 정보 초기화
    propertyInfo.value = null
  } finally {
    loadingProperty.value = false
  }
}

watch(
  () => props.room,
  (newRoom, oldRoom) => {
    console.log('채팅방 변경 감지:', {
      old: oldRoom?.chatRoomId,
      new: newRoom?.chatRoomId,
    })

    // 채팅방이 실제로 변경된 경우에만 API 호출
    if (newRoom?.chatRoomId !== oldRoom?.chatRoomId) {
      // 이전 정보 초기화
      propertyInfo.value = null
      // 새 정보 로드
      fetchPropertyInfo()
    }
  },
  { immediate: false },
)

// 이미지 로드 실패 시 기본 이미지로 변경
const handleImageError = (event) => {
  event.target.src = ''
}

// 컴포넌트 마운트 시 매물 정보 로드
onMounted(() => {
  fetchPropertyInfo()
})
</script>

<style scoped>
/* 반응형 디자인 */
@media (max-width: 640px) {
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* 스켈레톤 로딩 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
