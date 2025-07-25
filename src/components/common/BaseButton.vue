<template>
  <button
    :class="[
      'rounded-md font-medium flex items-center justify-center transition-colors duration-200',
      sizeClasses,
      variantClasses,
    ]"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['click'])

const onClick = (event) => {
  event.stopPropagation()
  emit('click', event)
}

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary', 'outline', 'gray', 'blue', 'danger-outline'
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1 text-sm'
    case 'lg':
      return 'px-6 py-3 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return 'text-yellow-primary border border-yellow-primary bg-white hover:bg-yellow-primary hover:text-white'
    case 'gray':
      return 'bg-gray-warm-700 text-white hover:bg-gray-700'
    case 'blue':
      return 'bg-blue-500 text-white hover:bg-blue-600'
    case 'danger-outline':
      return 'bg-red-50 text-red-500 border border-red-300 hover:bg-red-100'
    default:
      return 'bg-yellow-primary text-white hover:bg-yellow-500'
  }
})
</script>

<!-- usage 예시 -->

<!-- 노란 배경 버튼 -->
<!-- <BaseButton @click="..." variant="primary">AI 위험도 분석 시작</BaseButton> -->

<!-- 아웃라인 버튼 -->
<!-- <BaseButton @click="..." variant="outline">로그인</BaseButton> -->

<!-- 회색 버튼 -->
<!-- <BaseButton @click="..." variant="gray">계약서 작성</BaseButton> -->

<!-- 파란색 버튼 -->
<!-- <BaseButton @click="..." variant="blue">전자서명 요청</BaseButton> -->

<!-- 큰 버튼 -->
<!-- <BaseButton size="lg">다음</BaseButton> -->
