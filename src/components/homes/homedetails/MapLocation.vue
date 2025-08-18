<script src="../../../apis/listing.js"></script>
<script setup>
import { reactive, ref, watch } from 'vue' // watch 추가
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'

const props = defineProps({
  title: { type: String, required: true },
  address: { type: String, required: true },
})

const coordinate = reactive({
  lat: 37.566826,
  lng: 126.9786567,
})

const map = ref(null)
const visibleRef = ref(false)

// 주소 변경을 감지하여 지도 위치를 업데이트
watch(
  () => props.address,
  (newAddress) => {
    if (newAddress) {
      updateMapWithAddress(newAddress)
    }
  },
  { immediate: true },
)

const updateMapWithAddress = (address) => {
  if (!address) {
    console.warn('유효한 주소 정보가 없어 지도를 표시할 수 없습니다.')
    return
  }

  const geocoder = new kakao.maps.services.Geocoder()
  geocoder.addressSearch(address, (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      coordinate.lat = parseFloat(result[0].y)
      coordinate.lng = parseFloat(result[0].x)
      // 지도가 이미 로드되었으면 중심 위치 변경
      if (map.value) {
        map.value.setCenter(new kakao.maps.LatLng(coordinate.lat, coordinate.lng))
      }
    } else {
      console.warn('주소를 찾을 수 없습니다.')
    }
  })
}

const onLoadKakaoMap = (mapRef) => {
  map.value = mapRef
  // 초기 로딩 시 주소 검색
  updateMapWithAddress(props.address)
}

const onClickKakaoMapMarker = () => {
  visibleRef.value = !visibleRef.value
}
</script>

<template>
  <div class="mb-4 text-sm text-gray-800">
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
