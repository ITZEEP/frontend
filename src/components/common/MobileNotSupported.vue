<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- 이미지 -->
      <div class="mb-8">
        <img 
          src="/no-mobile.png" 
          alt="모바일 미지원" 
          class="w-96 h-96 mx-auto object-contain"
        />
      </div>
      
      <!-- 제목과 설명 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          모바일에서는 지원하지 않는 기능입니다
        </h1>
        <p class="text-gray-600 text-base leading-relaxed">
          계약서 관련 기능은 보안과 정확성을 위해<br>
          데스크톱 환경에서만 이용 가능합니다.
        </p>
      </div>
      
      <!-- 버튼들 -->
      <div class="space-y-3">
        <button
          @click="goHome"
          class="w-full bg-yellow-primary hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          홈으로 돌아가기
        </button>
        <button
          @click="goBack"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          이전 페이지로
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>