<script setup>
import { reactive, ref } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'

// ️ Props - 부모로부터 제목과 주소 받음
const props = defineProps({
  title: { type: String, required: true }, // 마커에 표시할 제목
  address: { type: String, required: true }, // 지도에 표시할 주소
})

//  좌표 (초기값: 서울 시청)
const coordinate = reactive({
  lat: 37.566826, // 위도
  lng: 126.9786567, // 경도
})

const map = ref(null) // 지도 객체 참조
const visibleRef = ref(false) // 마커 infoWindow 표시 여부

// 🗺️ 지도 로드 후 주소 → 좌표 변환
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

// 📌 마커 클릭 시 infoWindow on/off
const onClickKakaoMapMarker = () => {
  visibleRef.value = !visibleRef.value
}
</script>

<template>
  <div class="mb-2 text-sm text-gray-800">
    <i class="fa-solid fa-map-location-dot mr-1"></i> 주소: {{ address }}
  </div>

  <KakaoMap
    :lat="coordinate.lat"
    :lng="coordinate.lng"
    :level="3"
    :draggable="true"
    style="width: 100%; height: 360px"
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
</template>
