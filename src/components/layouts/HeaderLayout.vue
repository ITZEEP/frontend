<template>
  <header class="w-full border-b border-gray-200 bg-white">
    <!-- 메인 헤더 영역 -->
    <div class="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <!-- 좌측: 로고 -->
        <LogoSection />

        <!-- PC 메뉴 (중앙) -->
        <div class="hidden lg:flex flex-1 justify-center">
          <NavigationMenu />
        </div>

        <!-- 우측 영역 -->
        <div class="flex items-center gap-2">
          <!-- PC 인증 버튼 (알림 포함) -->
          <div class="hidden lg:flex items-center">
            <AuthButtons />
          </div>

          <!-- 모바일 알림 버튼 (로그인 시에만) -->
          <div v-if="authStore.isLoggedIn" class="lg:hidden">
            <NotificationButton />
          </div>

          <!-- 모바일 햄버거 메뉴 -->
          <button 
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            @click="toggleMenu"
            aria-label="메뉴 열기"
          >
            <svg
              v-if="!isOpen"
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 모바일 메뉴 (전체화면 슬라이드) -->
    <transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="isOpen" class="fixed inset-0 bg-white z-50 lg:hidden">
        <!-- 모바일 메뉴 헤더 -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">메뉴</h2>
          <button 
            @click="closeMenu"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴 닫기"
          >
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 모바일 메뉴 컨텐츠 -->
        <div class="flex flex-col h-full">
          <div class="flex-1 overflow-y-auto px-4 py-6">
            <!-- 모바일 네비게이션 메뉴 -->
            <nav class="space-y-1 mb-8">
              <NavigationMenu :mobile="true" @navigate="closeMenu" />
            </nav>
            
            <!-- 모바일 인증 섹션 -->
            <div class="border-t border-gray-200 pt-6">
              <AuthButtons :mobile="true" @navigate="closeMenu" />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 모바일 메뉴 배경 오버레이 -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="closeMenu"
      ></div>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LogoSection from './menu/LogoSection.vue'
import NavigationMenu from './menu/NavMenu.vue'
import AuthButtons from './menu/AuthSection.vue'
import NotificationButton from './menu/NotificationButton.vue'

const authStore = useAuthStore()

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  // 모바일에서 메뉴 열 때 스크롤 방지
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenu = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}

// 컴포넌트 언마운트 시 스크롤 복원
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 50;
}
</style>
