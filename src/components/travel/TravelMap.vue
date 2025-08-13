<template>
  <div :class="$attrs.class">
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
  </div>
</template>

<script setup>
import { reactive, ref, useAttrs } from 'vue'
import { KakaoMap, KakaoMapMarker } from 'vue3-kakao-maps'

// 상위 컴포넌트의 class 속성을 하위 컴포넌트로 전달하기 위해 useAttrs를 사용
const $attrs = useAttrs()

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

const onLoadKakaoMap = (mapRef) => {
  map.value = mapRef

  const geocoder = new kakao.maps.services.Geocoder()
  geocoder.addressSearch(props.address, (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      coordinate.lat = parseFloat(result[0].y)
      coordinate.lng = parseFloat(result[0].x)
    } else {
      console.warn('주소를 찾을 수 없어 기본 위치를 표시합니다.')
    }
  })
}

const onClickKakaoMapMarker = () => {
  visibleRef.value = !visibleRef.value
}
</script>
