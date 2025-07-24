<template>
  <div class="p-6 space-y-3">
    <div class="text-yellow-500 font-semibold text-lg">{{ listing.type }}</div>

    <div class="text-2xl font-bold">
      월세 {{ (listing.deposit ?? 0).toLocaleString() }} /
      {{ (listing.monthly ?? 0).toLocaleString() }}
    </div>

    <div class="text-yellow-500 font-semibold text-md">
      관리비 {{ (listing.maintenance ?? 0).toLocaleString() }}원
    </div>
  </div>
</template>

<script setup>
defineProps({
  listing: {
    type: Object,
    required: true,
    validator: (value) =>
      value &&
      typeof value.type === 'string' &&
      typeof value.deposit === 'number' &&
      typeof value.monthly === 'number' &&
      ('maintenance' in value
        ? typeof value.maintenance === 'number' ||
          value.maintenance === null ||
          value.maintenance === undefined
        : true),
  },
})
</script>
