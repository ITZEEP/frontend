<template>
  <div class="w-full">
    <!-- 메인 이미지 갤러리 -->
    <div
      ref="galleryContainer"
      class="relative w-full overflow-hidden md:rounded-md h-80 cursor-pointer select-none"
      @click="openFullscreen"
      @mousedown="handleDragStart"
      @mousemove="handleDragMove"
      @mouseup="handleDragEnd(false)"
      @mouseleave="handleDragEnd(false)"
      @touchstart="handleDragStart"
      @touchmove="handleDragMove"
      @touchend="handleDragEnd(false)"
      :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
    >
      <!-- 이미지 슬라이드 -->
      <div
        class="relative w-full h-full"
        :style="{
          transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }"
      >
        <transition :name="transitionName" mode="default">
          <img
            v-if="images.length > 0"
            :key="currentIndex"
            :src="images[currentIndex]"
            alt="매물 이미지"
            class="w-full h-80 object-cover absolute top-0 left-0"
            @error="handleImageError"
            loading="lazy"
            :draggable="false"
          />
          <div
            v-else
            key="no-image"
            class="w-full h-80 bg-gray-200 flex items-center justify-center text-gray-500 absolute top-0 left-0"
          >
            이미지 없음
          </div>
        </transition>
      </div>

      <!-- 이전 버튼 (첫 이미지면 안 보이게) -->
      <button
        v-if="currentIndex > 0"
        @click.stop="prevImage"
        @keydown.left.prevent="prevImage"
        aria-label="이전 이미지"
        class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 hover:text-black px-3 py-2 rounded-full shadow-md transition-all duration-200"
      >
        ◀
      </button>

      <!-- 다음 버튼 (마지막 이미지면 안 보이게) -->
      <button
        v-if="currentIndex < images.length - 1"
        @click.stop="nextImage"
        @keydown.right.prevent="nextImage"
        aria-label="다음 이미지"
        class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-700 hover:text-black px-3 py-2 rounded-full shadow-md transition-all duration-200"
      >
        ▶
      </button>

      <!-- 이미지 인디케이터 -->
      <div v-if="images.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        <span
          v-for="(_, index) in images"
          :key="index"
          :class="[
            'w-2 h-2 rounded-full transition-all duration-300',
            index === currentIndex ? 'bg-white w-6' : 'bg-white/50',
          ]"
        />
      </div>

      <!-- 이미지 카운터 -->
      <div class="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- 찜하기 버튼 -->
    <div class="flex justify-between gap-2 mt-2 mx-4">
      <div class="flex items-center gap-1 mt-1 text-green-600 text-sm font-medium select-none">
        <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
        <span>실명인증이 완료된 매물입니다.</span>
      </div>
      <button
        @click="toggleFavorite"
        :class="[
          'text-sm px-3 rounded border w-[100px] h-8 flex items-center justify-center gap-1 transition-all duration-200',
          isFavorite
            ? 'bg-yellow-primary text-white border-yellow-primary'
            : 'bg-white text-yellow-primary border-yellow-primary hover:bg-yellow-50',
        ]"
      >
        <span>{{ isFavorite ? '★' : '☆' }}</span>
        <span>{{ isFavorite ? '즐겨찾기' : '즐겨찾기' }}</span>
      </button>
    </div>

    <!-- 전체화면 이미지 뷰어 모달 -->
    <Teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isFullscreen" class="fixed inset-0 bg-black z-50 flex flex-col">
          <!-- 헤더 -->
          <div
            class="flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent absolute top-0 left-0 right-0 z-10"
          >
            <span class="text-white text-lg font-medium">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
            <button
              @click="closeFullscreen"
              class="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="닫기"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 메인 이미지 영역 -->
          <div
            ref="fullscreenContainer"
            class="flex-1 flex items-center justify-center relative select-none"
            @mousedown="handleDragStart($event, true)"
            @mousemove="handleDragMove"
            @mouseup="handleDragEnd(true)"
            @mouseleave="handleDragEnd(true)"
            @touchstart="handleDragStart($event, true)"
            @touchmove="handleDragMove"
            @touchend="handleDragEnd(true)"
            :style="{ cursor: isDragging ? 'grabbing' : 'grab' }"
          >
            <div
              :style="{
                transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }"
            >
              <transition :name="transitionName" mode="default">
                <img
                  v-if="images.length > 0"
                  :key="fullscreenIndex"
                  :src="images[fullscreenIndex]"
                  alt="매물 이미지"
                  class="max-w-full max-h-full object-contain"
                  @error="handleImageError"
                  :draggable="false"
                />
              </transition>
            </div>

            <!-- 이전 버튼 -->
            <button
              v-if="fullscreenIndex > 0"
              @click="prevFullscreenImage"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
              aria-label="이전 이미지"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- 다음 버튼 -->
            <button
              v-if="fullscreenIndex < images.length - 1"
              @click="nextFullscreenImage"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
              aria-label="다음 이미지"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- 썸네일 리스트 -->
          <div class="bg-black/90 p-4">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="(image, index) in images"
                :key="index"
                @click="fullscreenIndex = index"
                :class="[
                  'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200',
                  index === fullscreenIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100',
                ]"
              >
                <img
                  :src="image"
                  alt=""
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
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
const isFullscreen = ref(false)
const fullscreenIndex = ref(0)

// 드래그 기능을 위한 변수들
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)
const dragOffset = ref(0)
const galleryContainer = ref(null)
const fullscreenContainer = ref(null)

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

const openFullscreen = () => {
  isFullscreen.value = true
  fullscreenIndex.value = currentIndex.value
  document.body.style.overflow = 'hidden'
}

const closeFullscreen = () => {
  isFullscreen.value = false
  currentIndex.value = fullscreenIndex.value
  document.body.style.overflow = ''
}

const nextFullscreenImage = () => {
  if (fullscreenIndex.value >= props.images.length - 1) return
  transitionName.value = 'slide-left'
  fullscreenIndex.value += 1
}

const prevFullscreenImage = () => {
  if (fullscreenIndex.value <= 0) return
  transitionName.value = 'slide-right'
  fullscreenIndex.value -= 1
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

// 드래그 시작
const handleDragStart = (e, isFullscreenMode = false) => {
  isDragging.value = true
  startX.value = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  currentX.value = startX.value
  dragOffset.value = 0
}

// 드래그 중
const handleDragMove = (e) => {
  if (!isDragging.value) return

  e.preventDefault()
  currentX.value = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  dragOffset.value = currentX.value - startX.value
}

// 드래그 종료
const handleDragEnd = (isFullscreenMode = false) => {
  if (!isDragging.value) return

  isDragging.value = false
  const threshold = 50 // 최소 드래그 거리

  if (Math.abs(dragOffset.value) > threshold) {
    if (dragOffset.value > 0) {
      // 오른쪽으로 드래그 - 이전 이미지
      if (isFullscreenMode) {
        prevFullscreenImage()
      } else {
        prevImage()
      }
    } else {
      // 왼쪽으로 드래그 - 다음 이미지
      if (isFullscreenMode) {
        nextFullscreenImage()
      } else {
        nextImage()
      }
    }
  }

  dragOffset.value = 0
}

// ESC 키로 전체화면 닫기
import { onMounted, onUnmounted } from 'vue'

const handleEscKey = (event) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    closeFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = ''
})
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
