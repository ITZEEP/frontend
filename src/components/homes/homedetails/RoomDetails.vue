<template>
  <div class="p-6 bg-white rounded-lg shadow-md space-y-6 text-gray-800">
    <!-- 매물 정보 -->
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">매물 정보</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
        <div>
          <div class="flex items-center">
            <NetAreaIcon class="text-yellow-primary" />
            전용면적
          </div>
          <div class="text-black font-medium">46.28㎡</div>
        </div>

        <div>
          <div class="flex items-center">
            <GrossAreaIcon class="text-yellow-primary" />
            공급면적
          </div>
          <div class="text-black font-medium">56.19㎡</div>
        </div>

        <div>
          <div class="flex items-center">
            <FloorIcon class="text-yellow-primary" />
            현재층 / 총층
          </div>
          <div class="text-black font-medium">14층 / 20층</div>
        </div>

        <div>
          <div class="flex items-center">
            <CalendarIcon class="text-yellow-primary" />
            사용승인일 / 입주가능일
          </div>
          <div class="text-black font-medium">2018년 6월 / 1개월 이내</div>
        </div>

        <div>
          <div class="flex items-center">
            <DirectionIcon class="text-yellow-primary" />
            방향
          </div>
          <div class="text-black font-medium">남향</div>
        </div>

        <div>
          <div class="flex items-center">
            <RoomIcon class="text-yellow-primary" />
            방 / 욕실 수
          </div>
          <div class="text-black font-medium">4개 / 2개</div>
        </div>
      </div>
    </section>

    <!-- 관리비 정보 -->
    <section>
      <h2 class="font-bold text-lg mb-4 border-b border-gray-300 pb-2">관리비 정보</h2>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between items-center">
          <div class="font-semibold">월 관리비</div>
          <div class="text-yellow-500 font-bold text-lg">6만원</div>
        </div>

        <div>
          <div class="text-gray-600 mb-1">관리비 포함 항목</div>
          <div class="flex flex-wrap gap-2">
            <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">전기료</span>
            <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">가스</span>
            <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">수도</span>
            <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">난방</span>
            <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">청소</span>
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
          <div class="flex flex-col items-center">
            <ElevatorIcon class="text-yellow-primary w-4 h-4" />
            엘리베이터
          </div>

          <div class="flex flex-col items-center">
            <IndividualHeatingIcon class="text-yellow-primary w-4 h-4" />
            개별난방
          </div>

          <div class="flex flex-col items-center">
            <CenterHeatingIcon class="text-yellow-primary w-4 h-4" />
            전체난방
          </div>

          <div class="flex flex-col items-center">
            <ParkingIcon class="text-yellow-primary yw-4 h-4" />
            주차가능
          </div>
        </div>
      </div>

      <!-- 내부 시설 -->
      <div class="mb-6">
        <h3 class="font-semibold mb-3 text-sm text-gray-600">내부 시설</h3>
        <div class="grid grid-cols-6 gap-4 text-center text-xs">
          <div class="flex flex-col items-center">
            <AirconIcon class="text-yellow-primary w-4 h-4" />
            에어컨
          </div>
          <div class="flex flex-col items-center">
            <TvIcon class="text-yellow-primary w-4 h-4" />
            TV
          </div>
          <div class="flex flex-col items-center">
            <LaunIcon class="text-yellow-primary w-4 h-4" />
            세탁기
          </div>
          <div class="flex flex-col items-center">
            <RefrigIcon class="text-yellow-primary w-4 h-4" />
            냉장고
          </div>
          <div class="flex flex-col items-center">
            <InductIcon class="text-yellow-primary w-4 h-4" />
            인덕션
          </div>
          <div class="flex flex-col items-center">
            <GasrangeIcon class="text-yellow-primary w-4 h-4" />
            가스렌지
          </div>
          <div class="flex flex-col items-center">
            <ElectronicrangeIcon class="text-yellow-primary w-4 h-4" />
            전자레인지
          </div>
          <div class="flex flex-col items-center">
            <BathIcon class="text-yellow-primary w-4 h-4" />
            욕조
          </div>
          <div class="flex flex-col items-center">
            <SinkIcon class="text-yellow-primary w-4 h-4" />
            싱크대
          </div>
          <div class="flex flex-col items-center">
            <DeskIcon class="text-yellow-primary w-4 h-4" />
            책상
          </div>
          <div class="flex flex-col items-center">
            <ClosetIcon class="text-yellow-primary w-4 h-4" />
            옷장
          </div>
          <div class="flex flex-col items-center">
            <BootbacIcon class="text-yellow-primary w-4 h-4" />
            붙박이장
          </div>
          <div class="flex flex-col items-center">
            <ShoeseIcon class="text-yellow-primary w-4 h-4" />
            신발장
          </div>
          <div class="flex flex-col items-center">
            <WallairconIcon class="text-yellow-primary w-4 h-4" />
            벽걸이 에어컨
          </div>
          <div class="flex flex-col items-center">
            <Builtinaorcon class="text-yellow-primary w-4 h-4" />
            빌트인 에어컨
          </div>
        </div>
      </div>

      <!-- 보안 시설 -->
      <div>
        <h3 class="font-semibold mb-3 text-sm text-gray-600">보안 시설</h3>
        <div class="grid grid-cols-6 gap-4 text-center text-xs">
          <div class="flex flex-col items-center">
            <CctvIcon class="text-yellow-primary w-4 h-4" />
            CCTV
          </div>
          <div class="flex flex-col items-center">
            <InterphoneIcon class="text-yellow-primary w-4 h-4" />
            인터폰
          </div>
          <div class="flex flex-col items-center">
            <DoorlockIcon class="text-yellow-primary w-4 h-4" />
            도어락
          </div>
          <div class="flex flex-col items-center">
            <CardKeyIcon class="text-yellow-primary w-4 h-4" />
            카드키
          </div>
          <div class="flex flex-col items-center">
            <BangbumIcon class="text-yellow-primary w-4 h-4" />
            방범창
          </div>
          <div class="flex flex-col items-center">
            <SecurityIcon class="text-yellow-primary w-4 h-4" />
            경비
          </div>
          <div class="flex flex-col items-center">
            <FirewarningIcon class="text-yellow-primary w-4 h-4" />
            화재경보기
          </div>
          <div class="flex flex-col items-center">
            <SohwagiIcon class="text-yellow-primary w-4 h-4" />
            소화기
          </div>
          <div class="flex flex-col items-center">
            <HyungwansecuIcon class="text-yellow-primary w-4 h-4" />
            현관보안
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
/* 필요한 경우 여기에 스타일 추가 */
</style>
