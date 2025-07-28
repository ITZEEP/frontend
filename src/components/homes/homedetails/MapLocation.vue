<script setup>
import { reactive, ref } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'

// 부모로부터 제목과 주소 받음
const props = defineProps({
  title: { type: String, required: true }, // 마커 infoWindow 내용
  address: { type: String, required: true }, // 지오코딩할 주소
})

// 좌표 상태
const coordinate = reactive({
  lat: 37.566826, // 서울 시청 기본 위도
  lng: 126.9786567, // 서울 시청 기본 경도
})

const map = ref(null)
const visibleRef = ref(false)

// 지도 로드 후 주소 → 좌표 변환
const onLoadKakaoMap = (mapRef) => {
  map.value = mapRef

  const geocoder = new kakao.maps.services.Geocoder()
  geocoder.addressSearch(props.address, (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      coordinate.lat = parseFloat(result[0].y)
      coordinate.lng = parseFloat(result[0].x)
    } else {
      console.warn('주소를 찾을 수 없습니다.')
    }
  })
}

// 마커 클릭 시 infoWindow 토글
const onClickKakaoMapMarker = () => {
  visibleRef.value = !visibleRef.value
}
</script>

<template>
  <section class="p-4 rounded-lg bg-gray-50 border border-gray-200">
    <h3 class="mb-2 font-semibold text-gray-900 text-base">위치 정보</h3>

    <div class="mb-3 flex items-center gap-2 text-gray-700 text-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zM12 11a2 2 0 110-4 2 2 0 010 4z"
        />
      </svg>
      <span>{{ address }}</span>
    </div>

    <KakaoMap
      :lat="coordinate.lat"
      :lng="coordinate.lng"
      :level="3"
      :draggable="true"
      style="width: 100%; height: 240px; border-radius: 12px"
      @onLoadKakaoMap="onLoadKakaoMap"
    >
      <KakaoMapMarker
        :lat="coordinate.lat"
        :lng="coordinate.lng"
        :clickable="true"
        :infoWindow="{ content: title, visible: visibleRef }"
        @onClickKakaoMapMarker="onClickKakaoMapMarker"
      />
    </KakaoMap>
  </section>
</template>

<style scoped>
/* 필요시 추가 스타일 작성 */
</style>
