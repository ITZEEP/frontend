<template>
  <JeonseForm v-if="leaseType === 'JEONSE'" />
  <WolseForm v-else-if="leaseType === 'WOLSE'" />
</template>

<script setup>
import { computed } from 'vue'
import { usePreContractStore } from '@/stores/preContract'

import JeonseForm from './JeonseForm.vue'
import WolseForm from './WolseForm.vue'

const store = usePreContractStore()
const leaseType = computed(() => store.leaseType)
</script>
