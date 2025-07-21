<template>
  <footer class="bg-gray-warm-700 text-white px-8 py-10">
    <div class="w-screen-xl mx-auto flex flex-col gap-8 md:flex-row md:justify-between">
      <div class="flex">
        <!-- 로고 및 설명 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <img :src="logo" alt="잇집 로고" class="h-6" />
            <span class="text-lg font-bold">잇집</span>
          </div>
          <p class="text-sm text-gray-300 leading-relaxed">
            내집 탐색부터 계약까지 AI와 함께,<br />
            안전한 직거래 부동산 플랫폼 잇집에서 내집 마련 어떤가요?
          </p>
          <!-- 소셜 아이콘 -->
          <div class="flex gap-4 text-gray-400 text-xl mt-2">
            <i class="fab fa-facebook-f"></i>
            <i class="fab fa-twitter"></i>
            <i class="fab fa-instagram"></i>
            <i class="fab fa-linkedin-in"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 저작권 -->
    <div class="mt-10 pt-6 border-t border-gray-600 text-center text-sm text-gray-400">
      © 2025 KB IT's Your Life, JEJUGO. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import logo from '@/assets/logo.png'
</script>
