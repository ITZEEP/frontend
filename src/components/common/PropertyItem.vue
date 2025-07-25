<script setup>
import { ref } from 'vue'

const props = defineProps({
  property: {
    type: Object,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  showDate: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const imageLoading = ref(true)
const imageError = ref(false)

const handleClick = (event) => {
  // Space 키의 경우 스크롤 방지
  if (event.key === ' ') {
    event.preventDefault()
  }
  
  if (props.clickable && !props.isLoading) {
    emit('click', props.property)
  }
}

const handleImageLoad = () => {
  imageLoading.value = false
}

const handleImageError = () => {
  imageLoading.value = false
  imageError.value = true
}
</script>

<template>
  <div
    :role="clickable && !isLoading ? 'button' : undefined"
    :tabindex="clickable && !isLoading ? 0 : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    :class="[
      'p-4 border rounded-xl transition-all',
      clickable && !isLoading ? 'cursor-pointer' : '',
      clickable && !isLoading ? 'focus:outline-2 focus:outline-blue-500 focus:outline-offset-2' : '',
      selected
        ? 'bg-yellow-50 border-yellow-primary'
        : clickable && !isLoading
          ? 'bg-white border-gray-300 hover:border-yellow-primary hover:shadow-sm'
          : 'bg-white border-gray-300',
    ]"
    :aria-pressed="selected ? 'true' : 'false'"
    :aria-label="clickable ? `${property.title} 선택` : undefined"
  >
    <div class="flex items-center gap-4">
      <!-- 이미지 영역 -->
      <div class="w-20 h-20 flex-shrink-0">
        <div 
          v-if="isLoading" 
          class="w-full h-full bg-gray-200 rounded-lg animate-pulse"
          role="img"
          aria-label="이미지 로딩 중"
        ></div>
        <div v-else class="w-full h-full bg-gray-200 rounded-lg overflow-hidden relative">
          <!-- 로딩 스피너 -->
          <div
            v-if="imageLoading && property.image && !imageError"
            class="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <div
              class="w-6 h-6 border-2 border-gray-300 border-t-yellow-primary rounded-full animate-spin"
            ></div>
          </div>

          <!-- 이미지 -->
          <img
            v-if="property.image && !imageError"
            :src="property.image"
            :alt="property.title || '매물 이미지'"
            @load="handleImageLoad"
            @error="handleImageError"
            class="w-full h-full object-cover"
            :class="{ 'opacity-0': imageLoading }"
            loading="lazy"
          />

          <!-- 에러 상태 -->
          <div
            v-if="imageError || !property.image"
            class="w-full h-full flex items-center justify-center bg-gray-100"
            role="img"
            :aria-label="`${property.title || '매물'} 이미지 없음`"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 정보 영역 -->
      <div class="flex-1">
        <div v-if="isLoading" class="space-y-2">
          <div class="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
        <div v-else>
          <h4 class="text-base font-semibold text-gray-warm-700 mb-1">
            {{ property.title }}
          </h4>
          <p class="text-sm text-gray-600">
            {{ property.address }}
          </p>
          <p v-if="property.price" class="text-base font-semibold text-yellow-primary mt-1">
            {{ property.price }}
          </p>
          <p v-if="showDate && property.date" class="text-xs text-gray-600 mt-1">
            {{ property.date }}
          </p>
        </div>
      </div>

      <!-- 라벨 표시 -->
      <div v-if="!isLoading && property.label" class="flex items-end">
        <div class="text-xs text-gray-600">
          {{ property.label }}
        </div>
      </div>
    </div>
  </div>
</template>
