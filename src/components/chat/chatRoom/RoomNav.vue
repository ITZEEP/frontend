<template>
  <div class="bg-white border-b border-gray-200">
    <!-- 모바일 최적화된 네비게이션 헤더 -->
    <div class="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-gray-100">
      <div class="flex items-center space-x-2 md:space-x-3">
        <!-- 모바일 뒤로가기 버튼 -->
        <button
          @click="handleBack"
          class="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <!-- 계약 작성 버튼 - 구매자에게만 보임, 모바일 최적화 -->
        <BaseButton 
          v-if="isBuyer" 
          @click="handleClickGoToContract" 
          variant="gray"
          class="text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
        >
          <span class="hidden md:inline">계약서 작성하기</span>
          <span class="md:hidden">계약서</span>
        </BaseButton>
      </div>
    </div>

    <!-- 매물 정보 섹션 - 모바일 최적화 -->
    <div v-if="propertyInfo && propertyInfo.propertyAddress" class="px-3 md:px-4 py-2 md:py-3">
      <div class="flex items-center space-x-2 md:space-x-3">
        <!-- 매물 이미지 - 모바일에서 작게 -->
        <div class="flex-shrink-0">
          <img
            :src="propertyInfo.propertyImageUrl"
            :alt="propertyInfo.propertyAddress"
            class="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-gray-200"
            @error="handleImageError"
          />
        </div>

        <!-- 매물 정보 - 모바일 폰트 크기 조정 -->
        <div class="flex-1 min-w-0">
          <div class="text-xs md:text-sm font-medium text-gray-800 truncate">
            {{ propertyInfo.propertyAddress }}
          </div>
          <div class="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
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

const emit = defineEmits(['back'])

const propertyInfo = ref(null)
const loadingProperty = ref(false)

// const router = useRouter()

const isBuyer = computed(() => {
  return props.currentUserId === props.room?.buyerId
})

// 뒤로가기 핸들러
const handleBack = () => {
  emit('back')
}

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
