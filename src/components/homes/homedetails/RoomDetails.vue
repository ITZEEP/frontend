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
          <div class="text-black font-medium">{{ displayedHomeDirection }}</div>
        </div>

        <div>
          <div class="flex items-center gap-1">
            <RoomIcon class="text-yellow-primary" />
            방 / 욕실 수
          </div>
          <div class="text-black font-medium">
            {{ listing.roomCnt }}개 / {{ listing.bathroomCnt }}개
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">관리비 정보</h2>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <div class="font-semibold">월 관리비</div>
          <div class="text-yellow-primary font-bold text-lg">
            {{ listing.maintenaceFee ?? 0 }}만원
          </div>
        </div>

        <div>
          <div class="text-gray-600 mb-2">관리비 포함 항목</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in listing.maintenanceFeeItems"
              :key="item.maintenanceId"
              class="bg-gray-100 text-xs px-3 py-1 rounded-full"
            >
              {{ getMaintenanceNameById(item.maintenanceId) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">시설 정보</h2>

      <div class="mb-6">
        <h3 class="font-semibold mb-3 text-sm text-gray-600">건물 시설</h3>
        <div class="grid grid-cols-5 gap-5 text-center text-xs">
          <div
            v-if="listing.isParking"
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <ParkingIcon class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">주차가능</span>
          </div>

          <div
            v-if="listing.isPet"
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <span class="text-xs font-medium">반려동물</span>
          </div>

          <template v-if="categorizedFacilities['건물시설']">
            <div
              v-for="item in categorizedFacilities['건물시설']"
              :key="item.itemId"
              class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
            >
              <component :is="getIcon(item.itemName)" class="text-yellow-primary w-4 h-4 mb-1" />
              <span class="text-xs font-medium">{{ item.itemName }}</span>
            </div>
          </template>
        </div>
      </div>

      <div v-for="(facilities, category) in filteredFacilities" :key="category" class="mb-6">
        <h3 class="font-semibold mb-3 text-sm text-gray-600">{{ category }}</h3>
        <div class="grid grid-cols-5 gap-5 text-center text-xs">
          <div
            v-for="item in facilities"
            :key="item.itemId"
            class="flex flex-col items-center bg-gray-100 px-3 py-2 rounded-md shadow-sm text-gray-700"
          >
            <component :is="getIcon(item.itemName)" class="text-yellow-primary w-4 h-4 mb-1" />
            <span class="text-xs font-medium">{{ item.itemName }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
import WallairconIcon from '@/assets/icons/WallairconIcon.vue'
import Builtinaorcon from '@/assets/icons/builtinaorcon.vue'
import BathIcon from '@/assets/icons/BathIcon.vue'
import SinkIcon from '@/assets/icons/SinkIcon.vue'
import DeskIcon from '@/assets/icons/DeskIcon.vue'
import ClosetIcon from '@/assets/icons/ClosetIcon.vue'
import BootbacIcon from '@/assets/icons/BootbacIcon.vue'
import ShoeseIcon from '@/assets/icons/ShoeseIcon.vue'
import SofaIcon from '@/assets/icons/SofaIcon.vue'
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

const homeDirectionMap = {
  E: '동향',
  W: '서향',
  S: '남향',
  N: '북향',
  SE: '남동향',
  SW: '남서향',
  NE: '북동향',
  NW: '북서향',
}

const displayedHomeDirection = computed(() => {
  const direction = listing.homeDirection
  if (!direction) {
    return ''
  }
  const upperCaseDirection = direction.toUpperCase()
  return homeDirectionMap[upperCaseDirection] || upperCaseDirection
})

// `maintenanceId`와 `item_name`을 매핑하는 객체
const maintenanceIdMap = {
  1: '전기료',
  2: '수도료',
  3: '가스료',
  4: '인터넷',
  5: '청소비',
}

// maintenanceId를 받아 이름을 반환하는 함수
const getMaintenanceNameById = (id) => {
  return maintenanceIdMap[id] || '알 수 없음'
}

const iconMap = {
  에어컨: AirconIcon,
  세탁기: LaunIcon,
  냉장고: RefrigIcon,
  인덕션: InductIcon,
  가스렌지: GasrangeIcon,
  전자레인지: ElectronicrangeIcon,
  '벽걸이 에어컨': WallairconIcon,
  '빌트인 에어컨': Builtinaorcon,
  TV: TvIcon,

  욕조: BathIcon,
  싱크대: SinkIcon,
  책상: DeskIcon,
  옷장: ClosetIcon,
  붙박이장: BootbacIcon,
  신발장: ShoeseIcon,
  소파: SofaIcon,

  CCTV: CctvIcon,
  인터폰: InterphoneIcon,
  도어락: DoorlockIcon,
  카드키: CardKeyIcon,
  방범창: BangbumIcon,
  경비: SecurityIcon,
  화재경보기: FirewarningIcon,
  소화기: SohwagiIcon,
  현관보안: HyungwansecuIcon,

  엘리베이터: ElevatorIcon,
  주차장: ParkingIcon,
  택배보관함: null,
  개별난방: IndividualHeatingIcon,
  전체난방: CenterHeatingIcon,
  반려동물: null,
}

const getIcon = (itemName) => {
  return iconMap[itemName] || null
}

const categorizedFacilities = computed(() => {
  if (!listing.facilities || !Array.isArray(listing.facilities)) {
    return {}
  }
  return listing.facilities.reduce((acc, item) => {
    const categoryName = getCategoryName(item.categoryId)
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {})
})

const getCategoryName = (categoryId) => {
  switch (categoryId) {
    case 1:
      return '가전제품'
    case 2:
      return '가구'
    case 3:
      return '보안시설'
    case 4:
      return '편의시설'
    default:
      return '기타'
  }
}

const filteredFacilities = computed(() => {
  const facilities = { ...categorizedFacilities.value }
  delete facilities['건물시설']
  return facilities
})
</script>
