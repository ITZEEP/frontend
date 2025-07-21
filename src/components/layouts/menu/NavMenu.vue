<template>
  <nav class="flex gap-8">
    <button
      v-for="menu in menus"
      :key="menu.url"
      @click="router.push(menu.url)"
      class="relative text-sm font-medium"
      :class="
        isActive(menu.url) ? 'text-yellow-primary' : 'text-gray-400 hover:text-yellow-primary'
      "
    >
      {{ menu.title }}
      <div
        v-if="isActive(menu.url)"
        class="absolute -bottom-2 left-1/2 w-full h-[2px] bg-yellow-primary translate-x-[-50%]"
      />
    </button>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import config from '@/config'

const menus = config.owner
const route = useRoute()
const router = useRouter()

const isActive = (path) => route.path.startsWith(path)
</script>
