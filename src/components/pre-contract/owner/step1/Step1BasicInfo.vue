<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">매물 정보 확인</h1>
      <p class="text-gray-500">계약할 매물의 상세 정보를 확인해주세요</p>
    </div>

    <div class="w-full flex flex-col items-center justify-center gap-4">
      <HomeInfoMain :data="HOME_DATA[0].home" />
      <HomeInfoDashboard :data="HOME_DATA[0]" />
      <HomePhotos :data="HOME_DATA[0].images" />
      <HomeConfirm />
    </div>
  </div>
</template>

<script setup>
import HomeInfoMain from './HomeInfoMain.vue'
import HomeInfoDashboard from './HomeInfoDashboard.vue'
import HomePhotos from './HomePhotos.vue'
import HomeConfirm from './HomeConfirm.vue'
import HOME_DATA from '@/mocks/home.json'
</script>

<style scoped></style>
