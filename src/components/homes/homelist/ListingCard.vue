<template>
  <router-link :to="`/homes/${listing.homeId}`" class="block">
    <div
      class="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
      role="article"
      aria-label="매물 카드"
    >
      <img
        v-if="listing.imageUrl"
        :src="listing.imageUrl"
        alt="매물 사진"
        class="w-full h-48 object-cover"
      />
      <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
        이미지 없음
      </div>

      <div class="p-4 space-y-2">
        <div class="flex items-center gap-2">
          <div class="text-yellow-500 font-semibold">
            {{ listing.leaseType }}
          </div>
          <div class="text-lg font-bold">
            <template v-if="listing.leaseType === '전세'">
              {{ formatNumber(listing.depositPrice) }}
            </template>
            <template v-else-if="listing.leaseType === '월세'">
              {{ formatNumber(listing.depositPrice) }} /
              {{ formatNumber(listing.monthlyRent) }}
            </template>
            <template v-else>
              {{ formatNumber(listing.depositPrice) }} /
              {{ formatNumber(listing.monthlyRent) }}
            </template>
          </div>
        </div>

        <div class="flex items-center text-sm text-gray-600">
          <svg
            class="w-4 h-4 mr-1 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 21c-4.418 0-8-4.03-8-9 0-4.97 3.582-9 8-9s8 4.03 8 9c0 4.97-3.582 9-8 9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 13a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
          <span>{{ listing.addr1 }}</span>
        </div>

        <div class="text-sm text-gray-600">
          {{ convertToPyeong(listing.exclusiveArea) }}평 · {{ listing.homeFloor }}층
        </div>

        <div class="flex gap-2 text-xs mt-2 text-gray-500 select-none">
          <div>❤️ {{ listing.likeCnt ?? 0 }}</div>
          <div>👁️ {{ listing.viewCnt ?? 0 }}</div>
          <div>💬 {{ listing.chatCnt ?? 0 }}</div>
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

function convertToPyeong(area) {
  if (!area) return 0
  return Math.round(area / 3.3058)
}
</script>
