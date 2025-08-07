<template>
  <div class="p-6 bg-white rounded-lg shadow-md space-y-6 text-gray-800">
    <!-- 매물 정보 -->
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">매물 정보</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        <div>
          <div class="flex items-center gap-1">
            <NetAreaIcon class="text-yellow-primary" />
            전용면적
          </div>
          <div class="text-black font-medium">{{ listing.exclusiveArea }}㎡</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <GrossAreaIcon class="text-yellow-primary" />
            공급면적
          </div>
          <div class="text-black font-medium">{{ listing.supplyArea }}㎡</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <FloorIcon class="text-yellow-primary" />
            현재층 / 총층
          </div>
          <div class="text-black font-medium">
            {{ listing.homeFloor }}층 / {{ listing.buildingTotalFloors }}층
          </div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <CalendarIcon class="text-yellow-primary" />
            사용승인일
          </div>
          <div class="text-black font-medium">{{ listing.buildDate }}</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <DirectionIcon class="text-yellow-primary" />
            방향
          </div>
          <div class="text-black font-medium">{{ listing.homeDirection }}</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <RoomIcon class="text-yellow-primary" />
            방 / 욕실 수
          </div>
          <div class="text-black font-medium">
            {{ listing.roomCnt }}개 / {{ listing.bathroomCount }}개
          </div>
        </div>
      </div>
    </section>

    <!-- 관리비 정보 -->
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">관리비 정보</h2>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <div class="font-semibold">월 관리비</div>
          <div class="text-yellow-primary font-bold text-lg">
            {{ listing.maintenanceFee ?? 0 }}만원
          </div>
        </div>

        <div>
          <div class="text-gray-600 mb-2">관리비 포함 항목</div>
          <div class="flex flex-wrap gap-2">
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">인터넷</span>
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">TV</span>
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">수도</span>
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">주차</span>
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">난방</span>
            <span class="bg-gray-100 text-xs px-3 py-1 rounded-full">청소</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 시설 정보 -->
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">시설 정보</h2>

      <!-- 건물 시설 -->
      <div class="mb-6">
        <h3 class="font-semibold mb-3 text-sm text-gray-600">건물 시설</h3>
        <div class="grid grid-cols-4 gap-4 text-center text-xs">
          <div
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <ElevatorIcon class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">엘리베이터</span>
          </div>
          <div
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <IndividualHeatingIcon class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">개별난방</span>
          </div>
          <div
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <CenterHeatingIcon class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">전체난방</span>
          </div>
          <div
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <ParkingIcon class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">주차가능</span>
          </div>
        </div>
        <div
          class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
        >
          <CenterHeatingIcon class="text-yellow-primary w-4 h-4 mb-1" />
          <span class="text-xs font-medium">반려동물</span>
        </div>
      </div>

      <!-- 내부 시설 -->
      <div class="mb-6">
        <h3 class="font-semibold mb-3 text-sm text-gray-600">내부 시설</h3>
        <div class="grid grid-cols-6 gap-4 text-center text-xs">
          <div
            v-for="(item, index) in internalFacilities"
            :key="index"
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <component :is="item.icon" class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 보안 시설 -->
      <div>
        <h3 class="font-semibold mb-3 text-sm text-gray-600">보안 시설</h3>
        <div class="grid grid-cols-6 gap-4 text-center text-xs">
          <div
            v-for="(item, index) in securityFacilities"
            :key="index"
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <component :is="item.icon" class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import NetAreaIcon from '@/assets/icons/NetAreaIcon.vue'
import GrossAreaIcon from '@/assets/icons/GrossAreaIcon.vue'
import FloorIcon from '@/assets/icons/FloorIcon.vue'
import CalendarIcon from '@/assets/icons/CalendarIcon.vue'
import DirectionIcon from '@/assets/icons/DirectionIcon.vue'
import RoomIcon from '@/assets/icons/RoomIcon.vue'

import ElevatorIcon from '@/assets/icons/ElevatorIcon.vue'
import IndividualHeatingIcon from '@/assets/icons/IndividualHeatingIcon.vue'
import CenterHeatingIcon from '@/assets/icons/CenterHeatingIcon.vue'
import ParkingIcon from '@/assets/icons/ParkingIcon.vue'

import AirconIcon from '@/assets/icons/AirconIcon.vue'
import TvIcon from '@/assets/icons/TvIcon.vue'
import LaunIcon from '@/assets/icons/launIcon.vue'
import RefrigIcon from '@/assets/icons/RefrigIcon.vue'
import InductIcon from '@/assets/icons/InductIcon.vue'
import GasrangeIcon from '@/assets/icons/GasrangeIcon.vue'
import ElectronicrangeIcon from '@/assets/icons/ElectronicrangeIcon.vue'
import BathIcon from '@/assets/icons/BathIcon.vue'
import SinkIcon from '@/assets/icons/SinkIcon.vue'
import DeskIcon from '@/assets/icons/DeskIcon.vue'
import ClosetIcon from '@/assets/icons/ClosetIcon.vue'
import BootbacIcon from '@/assets/icons/BootbacIcon.vue'
import ShoeseIcon from '@/assets/icons/ShoeseIcon.vue'
import WallairconIcon from '@/assets/icons/WallairconIcon.vue'
import Builtinaorcon from '@/assets/icons/builtinaorcon.vue'

import CctvIcon from '@/assets/icons/CctvIcon.vue'
import InterphoneIcon from '@/assets/icons/InterphoneIcon.vue'
import DoorlockIcon from '@/assets/icons/DoorlockIcon.vue'
import CardKeyIcon from '@/assets/icons/CardKeyIcon.vue'
import BangbumIcon from '@/assets/icons/BangbumIcon.vue'
import SecurityIcon from '@/assets/icons/SecurityIcon.vue'
import FirewarningIcon from '@/assets/icons/FirewarningIcon.vue'
import SohwagiIcon from '@/assets/icons/SohwagiIcon.vue'
import HyungwansecuIcon from '@/assets/icons/HyungwansecuIcon.vue'

const { listing } = defineProps({
  listing: {
    type: Object,
    required: true,
  },
})

const internalFacilities = ref([
  { icon: AirconIcon, label: '에어컨' },
  { icon: TvIcon, label: 'TV' },
  { icon: LaunIcon, label: '세탁기' },
  { icon: RefrigIcon, label: '냉장고' },
  { icon: InductIcon, label: '인덕션' },
  { icon: GasrangeIcon, label: '가스렌지' },
  { icon: ElectronicrangeIcon, label: '전자레인지' },
  { icon: BathIcon, label: '욕조' },
  { icon: SinkIcon, label: '싱크대' },
  { icon: DeskIcon, label: '책상' },
  { icon: ClosetIcon, label: '옷장' },
  { icon: BootbacIcon, label: '붙박이장' },
  { icon: ShoeseIcon, label: '신발장' },
  { icon: WallairconIcon, label: '벽걸이 에어컨' },
  { icon: Builtinaorcon, label: '빌트인 에어컨' },
])

const securityFacilities = ref([
  { icon: CctvIcon, label: 'CCTV' },
  { icon: InterphoneIcon, label: '인터폰' },
  { icon: DoorlockIcon, label: '도어락' },
  { icon: CardKeyIcon, label: '카드키' },
  { icon: BangbumIcon, label: '방범창' },
  { icon: SecurityIcon, label: '경비' },
  { icon: FirewarningIcon, label: '화재경보기' },
  { icon: SohwagiIcon, label: '소화기' },
  { icon: HyungwansecuIcon, label: '현관보안' },
])
</script>
