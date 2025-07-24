<template>
  <div class="w-full">
    <div class="relative w-full">
      <img :src="images[currentIndex]" class="w-full h-80 object-cover rounded-md" />

      <!-- 다음 버튼 -->
      <button @click="nextImage" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white px-3 py-1 rounded-full">
        ▶
      </button>
    </div>

    <!-- 신고/찜하기 버튼 -->
    <div class="flex justify-end gap-2 mt-2">
      <button @click="report" class="bg-white text-red-500 border border-red-300 text-sm px-3 py-1 rounded">🚨 신고</button>
      <button
        @click="toggleFavorite"
        :class="[
          'text-sm px-3 py-1 rounded border',
          isFavorite ? 'bg-yellow-400 text-white' : 'bg-white text-yellow-500 border-yellow-300'
        ]"
      >
        {{ isFavorite ? '★ 찜함' : '☆ 찜하기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps(['images'])

const currentIndex = ref(0)
const isFavorite = ref(false)

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

const report = () => alert('신고가 접수되었습니다.')
const toggleFavorite = () => (isFavorite.value = !isFavorite.value)
</script>
