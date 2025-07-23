<script setup>
import { defineProps, defineEmits } from 'vue'

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

const handleClick = () => {
  if (props.clickable && !props.isLoading) {
    emit('click', props.property)
  }
}
</script>

<template>
  <div
    @click="handleClick"
    :class="[
      'p-4 border rounded-xl transition-all',
      clickable && !isLoading ? 'cursor-pointer' : '',
      selected
        ? 'bg-yellow-50 border-yellow-primary'
        : clickable && !isLoading
        ? 'bg-white border-gray-300 hover:border-yellow-primary hover:shadow-sm'
        : 'bg-white border-gray-300',
    ]"
  >
    <div class="flex items-center gap-4">
      <!-- 이미지 영역 -->
      <div class="w-20 h-20 flex-shrink-0">
        <div
          v-if="isLoading"
          class="w-full h-full bg-gray-200 rounded-lg animate-pulse"
        ></div>
        <div
          v-else
          class="w-full h-full bg-gray-200 rounded-lg overflow-hidden"
        >
          <img
            v-if="property.image"
            :src="property.image"
            :alt="property.title || '매물 이미지'"
            class="w-full h-full object-cover"
          />
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