<template>
  <div class="p-6 space-y-3">
    <div class="text-yellow-500 font-semibold text-lg">{{ listing.residenceType }}</div>

    <div class="text-2xl font-bold">
      {{
        listing.leaseType === '전세'
          ? '전세 ' + formatNumber(listing.depositPrice)
          : '월세 ' + formatNumber(listing.depositPrice) + ' / ' + formatNumber(listing.monthlyRent)
      }}
    </div>

    <div class="text-yellow-500 font-semibold text-md">
      관리비 {{ formatNumber(listing.maintenaceFee) }}만원
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
    // 억 단위 처리
    if (value >= 100000000) {
      const billion = Math.floor(value / 100000000)
      const remainder = value % 100000000
      if (remainder > 0) {
        return `${billion}억 ${formatNumber(remainder)}`
      } else {
        return `${billion}억`
      }
    }
    // 만 단위 처리
    if (value >= 10000) {
      const tenThousand = Math.floor(value / 10000)
      const remainder = value % 10000
      if (remainder > 0) {
        return `${tenThousand}만 ${formatNumber(remainder)}`
      } else {
        return `${tenThousand}만`
      }
    }
    return value.toLocaleString()
  }
  return value ?? '0'
}
</script>
