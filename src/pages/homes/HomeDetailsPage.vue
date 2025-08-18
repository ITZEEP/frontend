<template>
  <div class="max-w-4xl mx-auto p-4 md:p-6">
    <ImageGallery
      v-if="images.length > 0"
      :images="images"
      :homeId="id"
      :initialIsFavorite="isFavorite"
    />

    <div v-if="listing" class="mt-6 space-y-10">
      <ListingBasicInfo :listing="listing" />
      <RoomDetails :listing="listing" />

      <TravelMap
        :title="listing.residenceType + ' 매물 위치'"
        :address="`${listing.addr1} ${listing.addr2}`"
        class="rounded-md shadow-md"
      />

      <div class="w-full flex flex-col md:flex-row gap-4">
        <BaseButton class="w-full" variant="primary" size="lg" @click="goToChat">
          연락하기
        </BaseButton>
        <BaseButton class="w-full" variant="secondary" size="lg" @click="goRiskCheck">
          <span class="w-full">사기위험도 분석</span>
        </BaseButton>
      </div>
    </div>

    <div v-else class="text-center text-gray-400 mt-10">매물을 찾을 수 없습니다.</div>
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

const listing = ref(null)
const images = ref([])
const isFavorite = ref(false)

onMounted(async () => {
  try {
    const data = await fetchListingById(id)
    if (data) {
      listing.value = data
      images.value = data.imageUrls || []
    }
  } catch (err) {
    console.error('매물 조회 실패:', err)
  }
})

const isCreatingChat = ref(false)

const goToChat = async () => {
  if (!id) {
    console.log('채팅방을 만들 수 없습니다 - 매물 ID 없음')
    alert('매물 정보를 찾을 수 없습니다. 페이지를 새로고침 해주세요.')
    return
  }

  isCreatingChat.value = true
  try {
    const response = await createChatRoom(id)
    if (response && response.data) {
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

function goRiskCheck() {
  router.push('/risk-check')
}
</script>
