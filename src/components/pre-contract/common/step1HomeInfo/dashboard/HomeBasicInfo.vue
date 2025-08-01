<!-- components/homeInfoDashboard/HomeBasicInfo.vue -->
<template>
  <div class="white-box">
    <div class="flex items-center gap-2 mb-3">
      <HomeIcon class="text-yellow-primary" />
      <h3 class="font-semibold">기본 정보</h3>
    </div>
    <div class="grid grid-cols-2 gap-1 text-sm text-gray-700">
      <div>전용면적</div>
      <div>{{ home.exclusive_area }}㎡</div>
      <div>공급면적</div>
      <div>{{ home.supply_area }}㎡</div>
      <div>층수</div>
      <div>{{ homeDetail.home_floor }}층 / {{ homeDetail.building_total_floors }}층</div>
      <div>사용승인일</div>
      <div>{{ formatDate(homeDetail.build_date) }}</div>
      <div>방/욕실</div>
      <div>{{ home.room_cnt }}개 / {{ home.bathroom_count }}개</div>
      <div>향</div>
      <div>{{ translateDirection(homeDetail.home_direction) }}</div>
    </div>
  </div>
</template>

<script setup>
import HomeIcon from '@/assets/icons/HomeIcon.vue'

const props = defineProps({
  home: {
    type: Object,
    required: true,
  },
  home_detail: {
    type: Object,
    required: true,
  },
})

const home = props.home
const homeDetail = props.home_detail

const formatDate = (dateStr) => {
  const [year, month] = dateStr.split('-')
  return `${year}년 ${month}월`
}

const translateDirection = (dir) => {
  const map = {
    N: '북향',
    S: '남향',
    E: '동향',
    W: '서향',
    SE: '남동향',
    SW: '남서향',
    NE: '북동향',
    NW: '북서향',
  }
  return map[dir] || dir
}
</script>
