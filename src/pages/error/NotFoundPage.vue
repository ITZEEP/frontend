<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="text-center max-w-lg">
      <!-- 404 이미지 -->
      <div class="mb-8">
        <img
          src="/404.png"
          alt="404 - 페이지를 찾을 수 없습니다"
          class="mx-auto w-full max-w-sm h-auto"
          @error="handleImageError"
        />
      </div>

      <!-- 액션 버튼들 -->
      <div class="space-y-3">
        <router-link
          to="/"
          class="block w-full bg-yellow-primary hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          홈으로 돌아가기
        </router-link>
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
import { ref } from 'vue'

const router = useRouter()
const imageError = ref(false)

const goBack = () => {
  router.back()
}

const handleImageError = (event) => {
  imageError.value = true
  // 이미지 로드 실패 시 대체 이미지 또는 숨김 처리
  event.target.style.display = 'none'
}
</script>
