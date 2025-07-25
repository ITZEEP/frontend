<template>
  <div class="p-6 bg-white rounded-lg shadow-md space-y-6 text-gray-800">
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">매물 정보</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        <div>
          <div class="flex items-center gap-1">
            <NetAreaIcon class="text-yellow-primary" />
            전용면적
          </div>
          <div class="text-black font-medium">{{ listing.area }}㎡</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <GrossAreaIcon class="text-yellow-primary" />
            공급면적
          </div>
          <div class="text-black font-medium">-</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <FloorIcon class="text-yellow-primary" />
            현재층 / 총층
          </div>
          <div class="text-black font-medium">{{ listing.floor }}층 / -층</div>
        </div>

        <!-- 아래 항목은 데이터 없으면 '-' 표시 -->
        <div>
          <div class="flex items-center gap-1">
            <CalendarIcon class="text-yellow-primary" />
            사용승인일 / 입주가능일
          </div>
          <div class="text-black font-medium">- / -</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <DirectionIcon class="text-yellow-primary" />
            방향
          </div>
          <div class="text-black font-medium">{{ listing.direction ?? '-' }}</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <RoomIcon class="text-yellow-primary" />
            방 / 욕실 수
          </div>
          <div class="text-black font-medium">- / -</div>
        </div>
      </div>
    </section>

    <!-- 관리비 정보 등 나머지는 동일하게 필요 시 추가하세요 -->
  </div>
</template>

<script setup>
import NetAreaIcon from '@/assets/icons/NetAreaIcon.vue'
import GrossAreaIcon from '@/assets/icons/GrossAreaIcon.vue'
import FloorIcon from '@/assets/icons/FloorIcon.vue'
import CalendarIcon from '@/assets/icons/CalendarIcon.vue'
import DirectionIcon from '@/assets/icons/DirectionIcon.vue'
import RoomIcon from '@/assets/icons/RoomIcon.vue'

defineProps({
  listing: {
    type: Object,
    required: true,
  },
})
</script>
