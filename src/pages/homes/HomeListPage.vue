<template>
  <div class="flex">
    <FilterSidebar />

    <main class="flex-1 p-6 relative">
      <!-- 우측 상단 매물 등록 버튼 -->
      <button
        class="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded z-10"
        type="button"
      >
        매물 등록
      </button>

      <h1 class="text-2xl font-bold mb-4">전체 매물</h1>

      <div class="mb-4 text-lg font-bold">
        {{ selectedGu }} 외 {{ otherCount }}지역
        <span class="text-yellow-500">{{ listings.length }}</span>개 매물
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListingCard
          v-for="listing in listings"
          :key="listing.id"
          :listing="listing"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilterSidebar from '@/components/homes/homecreate/FilterSidebar.vue'
import ListingCard from '@/components/homes/homecreate/ListingCard.vue'

const selectedGu = ref('송파구')
const listings = ref([
  { id: 1, image: 'https://placehold.co/300x200', deposit: 1000, monthly: 80, area: 25, floor: 2, gu: '송파구', dong: '잠실동', likes: 24, views: 300, chats: 12, verified: true, type: '월세' },
  { id: 2, image: 'https://placehold.co/300x200', deposit: 3000, monthly: 70, area: 30, floor: 3, gu: '송파구', dong: '방이동', likes: 12, views: 200, chats: 6, verified: false, type: '월세' },

  { id: 3, image: 'https://placehold.co/300x200', deposit: 1500, monthly: 50, area: 20, floor: 1, gu: '강남구', dong: '역삼동', likes: 10, views: 120, chats: 3, verified: true, type: '월세' },
  { id: 4, image: 'https://placehold.co/300x200', deposit: 5000, monthly: 0, area: 40, floor: 5, gu: '서초구', dong: '서초동', likes: 5, views: 60, chats: 1, verified: false, type: '전세' },
  { id: 5, image: 'https://placehold.co/300x200', deposit: 0, monthly: 0, area: 50, floor: 10, gu: '마포구', dong: '망원동', likes: 20, views: 220, chats: 10, verified: true, type: '매매' },
  { id: 6, image: 'https://placehold.co/300x200', deposit: 700, monthly: 30, area: 15, floor: 2, gu: '송파구', dong: '문정동', likes: 8, views: 90, chats: 2, verified: true, type: '월세' },
  { id: 7, image: 'https://placehold.co/300x200', deposit: 1200, monthly: 60, area: 22, floor: 4, gu: '강서구', dong: '화곡동', likes: 14, views: 150, chats: 7, verified: false, type: '월세' },
  { id: 8, image: 'https://placehold.co/300x200', deposit: 0, monthly: 0, area: 35, floor: 7, gu: '중구', dong: '명동', likes: 6, views: 80, chats: 4, verified: true, type: '매매' },
  { id: 9, image: 'https://placehold.co/300x200', deposit: 2500, monthly: 0, area: 28, floor: 3, gu: '성동구', dong: '성수동', likes: 9, views: 110, chats: 5, verified: false, type: '전세' },
  { id: 10, image: 'https://placehold.co/300x200', deposit: 900, monthly: 40, area: 18, floor: 2, gu: '동대문구', dong: '장안동', likes: 7, views: 100, chats: 3, verified: true, type: '월세' },
])

const otherCount = 1 // 예시
</script>
