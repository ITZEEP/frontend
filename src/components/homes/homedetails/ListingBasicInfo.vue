<template>
  <div class="p-6 space-y-3">
    <div class="text-yellow-500 font-semibold text-lg">{{ listing.type }}</div>

    <div class="text-2xl font-bold">
      {{
        listing.leaseType === '전세'
          ? '전세 ' + formatNumber(listing.depositPrice)
          : '월세 ' + formatNumber(listing.depositPrice) + ' / ' + formatNumber(listing.monthlyRent)
      }}
    </div>

    <div class="text-yellow-500 font-semibold text-md">
      관리비 {{ formatNumber(listing.maintenanceFee) }}원
    </div>
  </div>
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
</script>
