<template>
  <div class="w-full">
    <div class="relative w-full overflow-hidden rounded-md h-80">
      <!-- 이미지 슬라이드 -->
      <transition :name="transitionName" mode="default">
        <img
          v-if="images.length > 0"
          :key="currentIndex"
          :src="images[currentIndex]"
          alt="매물 이미지"
          class="w-full h-80 object-cover absolute top-0 left-0"
          @error="handleImageError"
          loading="lazy"
        />
        <div
          v-else
          key="no-image"
          class="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 absolute top-0 left-0"
        >
          이미지 없음
        </div>
      </transition>

      <!-- 이전 버튼 (첫 이미지면 안 보이게) -->
      <button
        v-if="currentIndex > 0"
        @click="prevImage"
        @keydown.left.prevent="prevImage"
        aria-label="이전 이미지"
        class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 hover:text-black px-3 py-2 rounded-full shadow-md transition-all duration-200"
      >
        ◀
      </button>

      <!-- 다음 버튼 (마지막 이미지면 안 보이게) -->
      <button
        v-if="currentIndex < images.length - 1"
        @click="nextImage"
        @keydown.right.prevent="nextImage"
        aria-label="다음 이미지"
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 hover:text-black px-3 py-2 rounded-full shadow-md transition-all duration-200"
      >
        ▶
      </button>
    </div>

    <!-- 찜하기 버튼 -->
    <div class="flex justify-end gap-2 mt-2">
      <button
        @click="toggleFavorite"
        :class="[
          'text-sm px-3 rounded border w-[100px] h-8 flex items-center justify-center whitespace-nowrap transition-all duration-200',
          isFavorite
            ? 'bg-yellow-primary text-white border-yellow-primary'
            : 'bg-white text-yellow-primary border-yellow-primary hover:bg-yellow-50',
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

const currentIndex = ref(0)
const isFavorite = ref(props.initialIsFavorite)
const transitionName = ref('slide-left')

const nextImage = () => {
  if (!props.images || currentIndex.value >= props.images.length - 1) return
  transitionName.value = 'slide-left'
  currentIndex.value += 1
}

const prevImage = () => {
  if (!props.images || currentIndex.value <= 0) return
  transitionName.value = 'slide-right'
  currentIndex.value -= 1
}

const handleImageError = (event) => {
  event.target.src = '/fallback-image.png'
}

const toggleFavorite = async () => {
  try {
    await toggleHomeLike(props.homeId)
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('찜하기 상태 변경 실패:', error)
  }
}
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0.5;
}
.slide-left-enter-to {
  transform: translateX(0%);
  opacity: 1;
}
.slide-left-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0.5;
}

/* 왼쪽 → 오른쪽 (이전 이미지) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
  position: absolute;
  width: 100%;
  height: 100%;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0.5;
}
.slide-right-enter-to {
  transform: translateX(0%);
  opacity: 1;
}
.slide-right-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0.5;
}
</style>
