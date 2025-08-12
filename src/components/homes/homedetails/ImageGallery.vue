<template>
  <div class="w-full">
    <div class="relative w-full">
      <img
        v-if="images.length > 0"
        :src="images[currentIndex]"
        alt="매물 이미지"
        class="w-full h-80 object-cover rounded-md"
        @error="handleImageError"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md"
      >
        이미지 없음
      </div>

      <button
        @click="prevImage"
        @keydown.left.prevent="prevImage"
        aria-label="이전 이미지"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1 rounded-full"
      >
        ◀
      </button>
      <button
        @click="nextImage"
        @keydown.right.prevent="nextImage"
        aria-label="다음 이미지"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1 rounded-full"
      >
        ▶
      </button>
    </div>

    <div class="flex justify-end gap-2 mt-2">
      <button
        @click="toggleFavorite"
        :class="[
          'text-sm px-3 rounded border w-[100px] h-8 flex items-center justify-center whitespace-nowrap',
          isFavorite
            ? 'bg-yellow-primary text-white border-yellow-primary'
            : 'bg-white text-yellow-primary border-yellow-primary',
        ]"
      >
        {{ isFavorite ? '★ 찜함' : '☆ 찜하기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toggleHomeLike } from '@/apis/listing.js'
// import { submitReport as apiSubmitReport } from '@/apis/listing.js' // 신고 API import도 주석 처리

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (arr) => arr.length > 0 && arr.every((img) => typeof img === 'string'),
  },
  homeId: {
    type: Number,
    required: true,
  },
  initialIsFavorite: {
    type: Boolean,
    default: false,
  },
})

// const emit = defineEmits(['report-submitted']) // 사용되지 않으므로 주석 처리

const currentIndex = ref(0)
const isFavorite = ref(props.initialIsFavorite)

// 신고 관련 상태 변수 주석 처리
// const showReportModal = ref(false)
// const showReportCompleteModal = ref(false)
// const reportContent = ref('')

const nextImage = () => {
  if (!props.images || props.images.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevImage = () => {
  if (!props.images || props.images.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const handleImageError = (event) => {
  event.target.src = '/fallback-image.png'
}

// 신고 관련 함수들 주석 처리
// const openReportModal = () => {
//   reportContent.value = ''
//   showReportModal.value = true
// }

// const closeReportModal = () => {
//   showReportModal.value = false
// }

// const const submitReport = async () => {
//   if (!reportContent.value.trim()) return
//   try {
//     await apiSubmitReport(props.homeId, reportContent.value)
//     showReportModal.value = false
//     showReportCompleteModal.value = true
//     emit('report-submitted', reportContent.value)
//   } catch (error) {
//     console.error('신고 접수 실패:', error)
//   }
// }

// const closeReportCompleteModal = () => {
//   showReportCompleteModal.value = false
// }

const toggleFavorite = async () => {
  try {
    await toggleHomeLike(props.homeId)
    isFavorite.value = !isFavorite.value
    console.log(`매물 ID ${props.homeId} 찜하기 상태 변경: ${isFavorite.value}`)
  } catch (error) {
    console.error('찜하기 상태 변경 실패:', error)
  }
}
</script>

<style scoped>
/* 필요에 따라 스타일 조정 가능 */
</style>
