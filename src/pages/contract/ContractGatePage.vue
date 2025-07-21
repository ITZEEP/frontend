<template>
  <section class="flex flex-col items-center justify-center h-full text-center px-4 py-10">
    <!-- <img src="@/assets/contract-guide.svg" alt="계약서 작성 안내" class="w-48 mb-6" /> -->
    <h2 class="text-xl font-semibold text-gray-700 mb-2">계약서 작성을 시작하려면</h2>
    <p class="text-gray-500 mb-6">
      계약할 매물을 선택하고<br />
      임대인과 채팅을 먼저 시작해주세요.
    </p>
    <div class="flex gap-4">
      <button @click="goToHomes" class="px-4 py-2 bg-yellow-primary text-white rounded-md">
        매물 보러 가기
      </button>
      <button
        @click="goToChat"
        class="px-4 py-2 border border-yellow-primary text-yellow-primary rounded-md"
      >
        내 채팅 보기
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goToHomes = () => router.push('/homes')
const goToChat = () => router.push('/chat')
</script>
