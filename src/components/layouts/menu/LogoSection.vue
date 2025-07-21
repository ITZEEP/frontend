<template>
  <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
    <img :src="config.logo" alt="잇집 로고" class="h-6" />
    <span class="text-lg text-gray-warm-700 font-bold">{{ config.name }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import config from '@/config'

const router = useRouter()
</script>
