<template>
  <router-link :to="`/homes/${listing.homeId}`" class="block">
    <div
      class="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
      role="article"
      aria-label="매물 카드"
    >
      <img
        v-if="listing.imageUrls && listing.imageUrls.length > 0"
        :src="listing.imageUrls[0]"
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
              {{ formatNumber(listing.depositPrice) }}원
            </template>
            <template v-else-if="listing.leaseType === '월세'">
              {{ formatNumber(listing.depositPrice) }}원 / {{ formatNumber(listing.monthlyRent) }}원
            </template>
            <template v-else>
              {{ formatNumber(listing.depositPrice) }}원 / {{ formatNumber(listing.monthlyRent) }}원
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

        <div class="flex justify-between">
          <div class="flex gap-2 text-xs mt-2 text-gray-500 select-none">
            <div>❤️ {{ listing.likeCnt ?? 0 }}</div>
            <div>👁️ {{ listing.viewCnt ?? 0 }}</div>
            <div>💬 {{ listing.chatCnt ?? 0 }}</div>
          </div>
          <div class="flex items-center gap-1 mt-1 text-green-600 text-sm font-medium select-none">
            <span class="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span>실명인증</span>
          </div>
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
  if (typeof value === 'number' && value > 0) {
    if (value >= 100000000) {
      const billion = Math.floor(value / 100000000)
      const remainder = value % 100000000
      return remainder > 0 ? `${billion}억 ${formatNumber(remainder)}` : `${billion}억`
    }

    if (value >= 10000) {
      const tenThousand = Math.floor(value / 10000)
      const remainder = value % 10000
      return remainder > 0 ? `${tenThousand}만 ${formatNumber(remainder)}` : `${tenThousand}만`
    }

    if (value >= 1000) {
      const thousand = Math.floor(value / 1000)
      const remainder = value % 1000
      return remainder > 0 ? `${thousand}천 ${remainder.toLocaleString()}` : `${thousand}천`
    }

    return value.toLocaleString()
  }
  return value ?? '0'
}

function convertToPyeong(area) {
  if (!area) return 0
  // 제곱미터(m²)를 평으로 변환 (1평 ≈ 3.30578m²)
  return Math.round(area / 3.3058)
}
</script>
