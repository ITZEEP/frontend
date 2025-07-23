<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  propertyInfo: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <div class="flex gap-6">
      <img
        :src="propertyInfo.image"
        alt="매물 이미지"
        class="w-48 h-48 rounded-xl object-cover"
      />
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-gray-warm-700 mb-2">
          {{ propertyInfo.title }}
        </h2>
        <p class="text-base text-gray-warm-500 mb-4">
          {{ propertyInfo.address }}
        </p>
        <div class="flex gap-4">
          <div class="px-4 py-2 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-warm-500">매물 유형</p>
            <p class="text-base font-semibold text-gray-warm-700">
              {{ propertyInfo.type }}
            </p>
          </div>
          <div class="px-4 py-2 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-warm-500">거래 유형</p>
            <p class="text-base font-semibold text-gray-warm-700">
              {{ propertyInfo.transactionType }}
            </p>
          </div>
          <div class="px-4 py-2 bg-gray-100 rounded-lg">
            <p class="text-sm text-gray-warm-500">가격</p>
            <p class="text-base font-semibold text-gray-warm-700">
              {{ propertyInfo.price }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>