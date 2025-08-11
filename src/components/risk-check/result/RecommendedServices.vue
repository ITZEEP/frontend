<script setup>
import { useRouter } from 'vue-router'
import IconChart from '@/components/icons/IconChart.vue'
import IconShield from '@/components/icons/IconShield.vue'
import IconChat from '@/components/icons/IconChat.vue'
import { createChatRoom } from '@/apis/chatApi'
import { ref } from 'vue'

const props = defineProps({
  propertyId: {
    type: Number,
    default: null,
  },
  isExternal: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['analyze-another'])
const router = useRouter()
const isCreatingChat = ref(false)

const goToInsurance = () => {
  router.push('/risk-check/insurance')
}

const goToChat = async () => {
  console.log('goToChat called, propertyId:', props.propertyId, 'isExternal:', props.isExternal)
  console.log('propertyId type:', typeof props.propertyId)
  
  if (props.isExternal) {
    console.log('Cannot create chat - External property')
    alert('외부 매물은 채팅 기능을 사용할 수 없습니다.')
    return
  }
  
  if (!props.propertyId) {
    console.log('Cannot create chat - No propertyId')
    alert('매물 정보를 찾을 수 없습니다. 페이지를 새로고침 해주세요.')
    return
  }

  isCreatingChat.value = true
  try {
    // propertyId를 query parameter로 전달
    console.log('Creating chat room with propertyId:', props.propertyId)
    const response = await createChatRoom(props.propertyId)
    console.log('Chat room creation response:', response)
    
    if (response && response.data) {
      // 채팅방 생성 성공 시 해당 채팅방으로 이동
      console.log('Navigating to chat with roomId:', response.data)
      router.push(`/chat?roomId=${response.data}`)
    } else {
      console.error('채팅방 생성 실패: 응답에 chatRoomId가 없습니다', response)
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('채팅방 생성 오류 상세:', error.response || error)
    alert('채팅방 생성 중 오류가 발생했습니다.')
  } finally {
    isCreatingChat.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-300 p-4 sm:p-6 lg:p-8">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-warm-700 mb-4 sm:mb-6">추천 서비스</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
      <!-- 채팅하기 -->
      <div
        @click="goToChat"
        :class="[
          'rounded-xl p-4 sm:p-6 text-center min-h-[140px] sm:h-[172px] flex flex-col items-center justify-center transition-all',
          isExternal
            ? 'bg-gray-200 cursor-not-allowed'
            : 'bg-yellow-primary cursor-pointer hover:opacity-90',
        ]"
      >
        <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center">
          <IconChat :class="isExternal ? 'text-gray-400' : 'text-white'" class="w-full h-full" />
        </div>
        <h4
          :class="isExternal ? 'text-gray-500' : 'text-white'"
          class="font-medium text-sm sm:text-base mb-1.5 sm:mb-2"
        >
          {{ isCreatingChat ? '채팅방 생성 중...' : '채팅하기' }}
        </h4>
        <p :class="isExternal ? 'text-gray-400' : 'text-white opacity-90'" class="text-xs sm:text-sm px-2">
          {{ isExternal ? '서비스 내부 매물만 채팅 가능합니다' : '매물 소유자와 직접 대화해보세요' }}
        </p>
      </div>

      <!-- 보증보험 알아보기 -->
      <div
        @click="goToInsurance"
        class="bg-yellow-400 rounded-xl p-4 sm:p-6 text-center min-h-[140px] sm:h-[172px] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div class="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center">
          <IconShield class="text-white w-full h-full" />
        </div>
        <h4 class="font-medium text-sm sm:text-base text-white mb-1.5 sm:mb-2">보증보험 알아보기</h4>
        <p class="text-xs sm:text-sm text-white opacity-90 px-2">
          안전한 거래를 위한 보증보험 상품을 확인하세요
        </p>
      </div>
    </div>

    <div class="flex justify-center">
      <button
        @click="$emit('analyze-another')"
        class="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-yellow-primary text-yellow-primary rounded hover:bg-yellow-50 transition-colors flex items-center justify-center gap-2 font-medium text-xs sm:text-sm"
      >
        <IconChart class="w-4 h-4 sm:w-5 sm:h-5" />
        다른 매물 분석하기
      </button>
    </div>
  </div>
</template>
