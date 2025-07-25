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
        @click="report"
        class="bg-white text-red-500 border border-red-300 text-sm px-3 py-1 rounded h-8"
      >
        🚨 신고
      </button>
      <button
        @click="toggleFavorite"
        :class="[
          'text-sm px-3 rounded border w-[100px] h-8 flex items-center justify-center whitespace-nowrap',
          isFavorite
            ? 'bg-yellow-400 text-white border-yellow-400'
            : 'bg-white text-yellow-500 border-yellow-300',
        ]"
      >
        {{ isFavorite ? '★ 찜함' : '☆ 찜하기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'

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

const nextImage = () => {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevImage = () => {
  if (!props.images || props.images.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const handleImageError = (event) => {
  event.target.src = '/fallback-image.png' // 대체 이미지 경로
}

const report = () => {
  emit('report-submitted')
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
}
</script>
