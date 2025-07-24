<template>
  <div class="bg-white p-6 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">매물 이미지</h2>
    <div class="flex gap-4">
      <img
        v-for="n in 4"
        :key="n"
        :src="`/images/sample${n}.jpg`"
        class="w-28 h-28 rounded-md object-cover"
      />
      <button class="w-28 h-28 border rounded-md flex items-center justify-center">+</button>
    </div>
  </div>
</template>

<script setup>
// 이미지 업로드 기능 추후 구현 예정
</script>
