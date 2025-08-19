<script setup>
import { ref, computed } from 'vue'
import PropertyImagePlaceholder from './PropertyImagePlaceholder.vue'

const props = defineProps({
  src: {
    type: [String, Array],
    default: ''
  },
  alt: {
    type: String,
    default: '매물 이미지'
  },
  propertyType: {
    type: String,
    default: '매물'
  },
  size: {
    type: String,
    default: 'large' // 'small', 'medium', 'large'
  },
  rounded: {
    type: String,
    default: 'xl' // 'none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'
  }
})

const imageError = ref(false)
const imageLoading = ref(true)

const handleImageError = () => {
  imageError.value = true
  imageLoading.value = false
}

const handleImageLoad = () => {
  imageError.value = false
  imageLoading.value = false
}

// 이미지가 유효하지 않은지 확인
const isInvalidImage = computed(() => {
  const srcToCheck = processedSrc.value
  
  // S3 URL이나 unsplash 이미지는 유효한 것으로 처리
  if (srcToCheck && (srcToCheck.includes('.s3.') || 
                     srcToCheck.includes('amazonaws.com') || 
                     srcToCheck.includes('unsplash.com'))) {
    return imageError.value // 에러가 발생한 경우에만 invalid로 처리
  }
  
  return !srcToCheck || 
         srcToCheck === '/property-placeholder.jpg' || 
         srcToCheck.includes('example.com') ||
         imageError.value
})

// S3 URL인지 확인하고 처리
const processedSrc = computed(() => {
  if (!props.src) return ''
  
  // 배열인 경우 첫 번째 이미지 사용
  let srcUrl = props.src
  if (Array.isArray(props.src)) {
    if (props.src.length === 0) return ''
    srcUrl = props.src[0]
  }
  
  if (!srcUrl || typeof srcUrl !== 'string') return ''
  
  // S3 URL 패턴 확인
  if (srcUrl.includes('.s3.') || srcUrl.includes('amazonaws.com')) {
    // 이미 전체 URL인 경우 그대로 반환
    if (srcUrl.startsWith('http://') || srcUrl.startsWith('https://')) {
      return srcUrl
    }
    // 프로토콜이 없는 경우 https 추가
    return `https://${srcUrl}`
  }
  
  return srcUrl
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-24 h-24'
    case 'medium':
      return 'w-32 h-32'
    case 'large':
      return 'w-48 h-48'
    default:
      return 'w-48 h-48'
  }
})

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'none':
      return 'rounded-none'
    case 'sm':
      return 'rounded-sm'
    case 'md':
      return 'rounded-md'
    case 'lg':
      return 'rounded-lg'
    case 'xl':
      return 'rounded-xl'
    case '2xl':
      return 'rounded-2xl'
    case 'full':
      return 'rounded-full'
    default:
      return 'rounded-xl'
  }
})

const imageClasses = computed(() => {
  return [
    sizeClasses.value,
    roundedClasses.value,
    'object-cover'
  ].join(' ')
})
</script>

<template>
  <div class="relative block">
    <!-- 로딩 상태 -->
    <div 
      v-if="imageLoading && !isInvalidImage && processedSrc"
      :class="[
        sizeClasses,
        roundedClasses,
        'bg-gray-200 animate-pulse flex items-center justify-center'
      ]"
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
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>

    <!-- 실제 이미지 -->
    <img
      v-if="processedSrc && !isInvalidImage"
      :src="processedSrc"
      :alt="alt"
      :class="imageClasses"
      @error="handleImageError"
      @load="handleImageLoad"
      :style="{ display: imageLoading ? 'none' : 'block' }"
    />

    <!-- Placeholder -->
    <PropertyImagePlaceholder
      v-if="!processedSrc || isInvalidImage"
      :type="propertyType"
      :size="size"
    />
  </div>
</template>