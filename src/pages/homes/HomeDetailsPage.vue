<template>
  <div>
    <!-- 뒤로 가기 버튼 -->
    <div class="max-w-4xl mx-auto px-4 md:px-6 py-2">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>

    <!-- 이미지 갤러리 - 전체 화면 크기 (모바일에서만) -->
    <div
      class="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] md:w-full md:left-0 md:right-0 md:ml-0 md:mr-0 md:max-w-4xl md:mx-auto"
    >
      <ImageGallery
        v-if="!isLoading && images.length > 0"
        :images="images"
        :homeId="id"
        :initialIsFavorite="isFavorite"
      />
    </div>

    <!-- 나머지 콘텐츠 - 적절한 여백으로 -->
    <div class="max-w-4xl mx-auto px-4 md:px-6 my-6">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="text-center text-gray-400 mt-10">불러오는 중입니다...</div>

      <!-- 데이터 있음 -->
      <div v-else-if="listing" class="mt-6 space-y-10">
        <ListingBasicInfo :listing="listing" />
        <RoomDetails :listing="listing" />

        <TravelMap
          :title="listing.residenceType + ' 매물 위치'"
          :address="processedAddress"
          class="rounded-md shadow-md"
        />

        <div class="w-full flex gap-3">
          <BaseButton class="flex-1" variant="primary" size="md" @click="goToChat">
            연락하기
          </BaseButton>
          <BaseButton class="flex-1" variant="secondary" size="md" @click="goRiskCheck">
            사기위험도 분석
          </BaseButton>
        </div>
      </div>

      <!-- 데이터 없음 -->
      <div v-else class="text-center text-gray-400 mt-10">매물을 찾을 수 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ImageGallery from '@/components/homes/homedetails/ImageGallery.vue'
import ListingBasicInfo from '@/components/homes/homedetails/ListingBasicInfo.vue'
import RoomDetails from '@/components/homes/homedetails/RoomDetails.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import TravelMap from '@/components/travel/TravelMap.vue'

import { fetchListingById } from '@/apis/listing.js'
import { createChatRoom } from '@/apis/chatApi.js'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.no)

const isLoading = ref(true)
const listing = ref(null)
const images = ref([])
const isFavorite = ref(false)
const processedAddress = ref('')

onMounted(async () => {
  try {
    const data = await fetchListingById(id)
    if (data) {
      listing.value = data
      images.value = data.imageUrls || []
      processedAddress.value = data.addr1 || data.addr2 || '주소정보 없음'
    }
  } catch (err) {
    console.error('매물 조회 실패:', err)
  } finally {
    isLoading.value = false
  }
})

const isCreatingChat = ref(false)

const goToChat = async () => {
  if (!id) {
    alert('매물 정보를 찾을 수 없습니다. 페이지를 새로고침 해주세요.')
    return
  }
  isCreatingChat.value = true
  try {
    const response = await createChatRoom(id)
    if (response && response.data) {
      router.push(`/chat?roomId=${response.data}`)
    } else {
      alert('채팅방 생성에 실패했습니다. 다시 시도해주세요.')
    }
  } catch (error) {
    console.error('채팅방 생성 오류 상세:', error.response || error)
    alert('채팅방 생성 중 오류가 발생했습니다.')
  } finally {
    isCreatingChat.value = false
  }
}

function goRiskCheck() {
  router.push('/risk-check')
}

function goBack() {
  // 이전 페이지가 있으면 뒤로 가고, 없으면 매물 목록으로
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/homes')
  }
}
</script>
