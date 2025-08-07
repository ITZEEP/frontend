<template>
  <div class="w-full bg-gray-50 border-b-2 py-10 px-8 flex justify-center items-center">
    <div class="flex items-center gap-4">
      <div
        class="w-14 h-14 rounded-full bg-yellow-primary flex items-center justify-center text-center"
      >
        <CheckIcon class="w-10 h-10 text-white" />
      </div>

      <div>
        <h1 class="text-gray-800 font-bold text-xl">계약서 생성이 완료되었습니다</h1>
        <p class="text-gray-500 text-sm mt-1">생성된 계약서를 확인하고 다운로드하실 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import CheckIcon from '@/assets/icons/CheckIcon.vue'
</script>
