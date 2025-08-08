<template>
  <div class="w-full">
    <div class="relative w-full">
      <img
        :src="images[currentIndex]"
        alt="매물 이미지"
        class="w-full h-80 object-cover rounded-md"
        @error="handleImageError"
        loading="lazy"
      />

      <!-- 이전 버튼 -->
      <button
        @click="prevImage"
        @keydown.left.prevent="prevImage"
        aria-label="이전 이미지"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1 rounded-full"
      >
        ◀
      </button>

      <!-- 다음 버튼 -->
      <button
        @click="nextImage"
        @keydown.right.prevent="nextImage"
        aria-label="다음 이미지"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1 rounded-full"
      >
        ▶
      </button>
    </div>

    <!-- 신고/찜하기 버튼 -->
    <div class="flex justify-end gap-2 mt-2">
      <button
        @click="openReportModal"
        class="bg-white text-red-500 border border-red-300 text-sm px-3 py-1 rounded h-8"
      >
        🚨 신고
      </button>
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

    <!-- 신고 사유 선택 모달 -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeReportModal"
    >
      <div class="bg-white rounded-lg p-6 w-80">
        <h3 class="text-lg font-semibold mb-4">신고 사유를 선택해주세요</h3>
        <div class="space-y-2 mb-4">
          <label
            class="flex items-center space-x-2"
            v-for="reason in reportReasons"
            :key="reason.value"
          >
            <input
              type="radio"
              name="reportReason"
              :value="reason.value"
              v-model="selectedReason"
              class="form-radio"
            />
            <span>{{ reason.label }}</span>
          </label>
        </div>
        <div class="flex justify-end space-x-2">
          <button
            @click="closeReportModal"
            class="px-4 py-1 rounded border border-gray-300 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            @click="submitReport"
            :disabled="!selectedReason"
            class="px-4 py-1 rounded bg-red-500 text-white disabled:opacity-50"
          >
            신고하기
          </button>
        </div>
      </div>
    </div>

    <!-- 신고 완료 알림 모달 -->
    <div
      v-if="showReportCompleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeReportCompleteModal"
    >
      <div class="bg-white rounded-lg p-6 w-72 text-center">
        <p class="text-lg mb-4">신고가 접수되었습니다.</p>
        <button
          @click="closeReportCompleteModal"
          class="px-6 py-2 bg-yellow-primary rounded text-white font-semibold"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (arr) => arr.length > 0 && arr.every((img) => typeof img === 'string'),
  },
})

const emit = defineEmits(['report-submitted'])

const currentIndex = ref(0)
const isFavorite = ref(false)

const showReportModal = ref(false)
const showReportCompleteModal = ref(false)
const selectedReason = ref(null)

const reportReasons = [
  { value: 'spam', label: '스팸/광고' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'fraud', label: '사기/허위 매물' },
  { value: 'other', label: '기타' },
]

const nextImage = () => {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevImage = () => {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const handleImageError = (event) => {
  event.target.src = '/fallback-image.png' // 대체 이미지 경로 (필요 시 수정)
}

const openReportModal = () => {
  selectedReason.value = null
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
}

const submitReport = () => {
  if (!selectedReason.value) return
  // TODO: 서버 신고 API 호출 로직 추가 가능
  showReportModal.value = false
  showReportCompleteModal.value = true
  emit('report-submitted', selectedReason.value)
}

const closeReportCompleteModal = () => {
  showReportCompleteModal.value = false
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}
</script>

<style scoped>
/* 필요에 따라 스타일 조정 가능 */
</style>
