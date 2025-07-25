<template>
  <JeonseForm v-if="rentType === 'JEONSE'" />
  <WolseForm v-else-if="rentType === 'WOLSE'" />
</template>

<script setup>
import { computed } from 'vue'
import { usePreContractStore } from '@/stores/ownerPreContractStore'

import JeonseForm from './JeonseForm.vue'
import WolseForm from './WolseForm.vue'

const store = usePreContractStore()
const rentType = computed(() => store.rent_type)
</script>
