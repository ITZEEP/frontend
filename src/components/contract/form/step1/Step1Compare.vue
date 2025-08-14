<template>
  <div
    class="flex flex-col gap-10 transition-opacity duration-300"
    :class="{ 'opacity-50 pointer-events-none': currentStep !== 1 }"
  >
    <ContractParties :basic="basic" />
    <PropertySummary :basic="basic" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ContractParties from './ContractParties.vue'
import PropertySummary from './PropertySummary.vue'

const props = defineProps({ basic: { type: Object, default: null } })
const basic = computed(() => props.basic)

const route = useRoute()
const currentStep = computed(() => Number(route.query.step ?? route.params.step ?? 0))
</script>
