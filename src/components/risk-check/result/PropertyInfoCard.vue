<script setup>
import PropertyImage from '@/components/common/PropertyImage.vue'

const props = defineProps({
  propertyInfo: {
    type: Object,
    required: true,
    validator: (value) => {
      const requiredFields = ['image', 'title', 'address', 'type', 'transactionType', 'price']
      return requiredFields.every((field) => field in value)
    },
  },
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <div class="flex gap-6">
      <!-- 매물 이미지 -->
      <PropertyImage
        :src="propertyInfo.image"
        :alt="`${propertyInfo.title} 매물 이미지`"
        :property-type="propertyInfo.type"
        size="large"
        rounded="xl"
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
