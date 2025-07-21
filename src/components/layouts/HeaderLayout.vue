<template>
  <header class="w-full border-b border-gray-200 bg-white px-8 py-4">
    <div class="flex items-center justify-between">
      <!-- 좌측: 로고 + 메뉴 -->
      <div class="flex items-center gap-12">
        <LogoSection />

        <!-- PC 메뉴 -->
        <div class="hidden md:flex">
          <NavigationMenu />
        </div>
      </div>

      <!-- 햄버거 메뉴 (모바일용) -->
      <button class="md:hidden" @click="isOpen = !isOpen">
        <svg
          class="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- 우측: 인증 버튼 -->
      <div class="hidden md:flex items-center">
        <AuthButtons />
      </div>
    </div>

    <!-- 모바일 메뉴 (토글) -->
    <div v-if="isOpen" class="mt-4 flex flex-col gap-4 md:hidden">
      <NavigationMenu />
      <AuthButtons />
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import LogoSection from './menu/LogoSection.vue'
import NavigationMenu from './menu/NavMenu.vue'
import AuthButtons from './menu/AuthSection.vue'

const isOpen = ref(false)
</script>
