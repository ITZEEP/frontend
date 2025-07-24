<template>
  <router-link :to="`/details/${listing.id}`" class="block">
    <div class="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img :src="listing.image" class="w-full h-48 object-cover" />

      <div class="p-4 space-y-2">
        <div class="text-yellow-500 font-semibold">{{ listing.type }}</div>
        <div class="text-lg font-bold">
          월세 {{ listing.deposit.toLocaleString() }} / {{ listing.monthly.toLocaleString() }}
        </div>
        <div class="text-sm text-gray-600">
          {{ listing.gu }} {{ listing.dong }} · {{ listing.area }}평 · {{ listing.floor }}층
        </div>

        <div class="flex justify-between text-xs mt-2 text-gray-500">
          <div>❤️ {{ listing.likes }}</div>
          <div>👁️ {{ listing.views }}</div>
          <div>💬 {{ listing.chats }}</div>
        </div>

        <div class="text-right">
          <span
            class="text-xs font-semibold px-2 py-1 rounded-full"
            :class="listing.verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'"
          >
            {{ listing.verified ? '실명인증' : '미인증' }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  listing: Object
})
</script>
