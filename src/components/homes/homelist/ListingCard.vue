<template>
  <router-link :to="`/homes/${listing.id}`" class="block">
    <div
      class="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
      role="article"
      aria-label="매물 카드"
    >
      <img :src="listing.imageUrls?.[0]" alt="매물 사진" class="w-full h-48 object-cover" />

      <div class="p-4 space-y-2">
        <div class="text-yellow-500 font-semibold">{{ convertleaseType(listing.leaseType) }}</div>
        <div class="text-lg font-bold">
          월세 {{ formatNumber(listing.depositPrice) }} / {{ formatNumber(listing.monthlyRent) }}
        </div>
        <div class="text-sm text-gray-600">
          {{ listing.gu }} {{ listing.dong }} · {{ convertToPyeong(listing.area) }}평 ·
          {{ listing.homefloor }}층
        </div>

        <div class="flex gap-2 text-xs mt-2 text-gray-500 select-none">
          <div>❤️ {{ listing.likes ?? 0 }}</div>
          <div>👁️ {{ listing.views ?? 0 }}</div>
          <div>💬 {{ listing.chats ?? 0 }}</div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  listing: {
    type: Object,
    required: true,
  },
})

function formatNumber(value) {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value ?? '0'
}

function convertleaseType(type) {
  switch (type) {
    case 'monthlyRent':
      return '월세'
    case 'JEONSE':
      return '전세'
    default:
      return type
  }
}

function convertToPyeong(area) {
  if (!area) return 0
  return Math.round(area / 3.3058)
}
</script>
