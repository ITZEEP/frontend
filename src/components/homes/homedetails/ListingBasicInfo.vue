<!-- src/components/homes/homedetails/ListingBasicInfo.vue -->
<template>
  <div class="p-6 space-y-3">
    <div class="text-yellow-500 font-semibold text-lg">{{ listing.type }}</div>

    <div class="text-2xl font-bold">
      월세 {{ listing.deposit.toLocaleString() }} / {{ listing.monthly.toLocaleString() }}
    </div>

    <div class="text-yellow-500 font-semibold text-md">
      관리비 {{ listing.maintenance?.toLocaleString() ?? '0' }}원
    </div>
  </div>
</template>

<script setup>
defineProps({
  listing: Object
})
</script>
