<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <!-- 서버 에러 아이콘 -->
      <div class="mb-8">
        <svg class="mx-auto h-32 w-32 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <!-- 에러 메시지 -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">500</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">서버 오류가 발생했습니다</h2>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      
      <!-- 액션 버튼들 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          @click="refresh"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          새로고침
        </button>
        
        <router-link 
          to="/"
          class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          홈으로 가기
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const refresh = () => {
  window.location.reload()
}
</script>