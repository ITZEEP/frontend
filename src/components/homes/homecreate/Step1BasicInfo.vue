<template>
  <h1 class="text-gray-800 font-bold text-lg p-2">주소 검색</h1>

  <div class="p-4 min-h-96 max-h-96 flex flex-col items-center gap-4">
    <!-- 검색 입력 -->
    <div class="w-full flex gap-2 mb-4">
      <input
        v-model="keyword"
        @keyup.enter="searchAddress"
        placeholder="도로명 주소, 지번, 건물명 등을 검색하세요"
        class="w-full flex-1 px-4 py-2 border border-gray-300 rounded-md"
      />
      <BaseButton @click="searchAddress" variant="primary">검색</BaseButton>
    </div>

    <!-- 검색 결과 리스트 -->
    <div class="w-full h-full max-h-84 overflow-y-auto">
      <div v-if="pagedResults.length === 0" class="text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li
          v-for="place in pagedResults"
          :key="place.id"
          @click="selectAddress(place.address_name)"
          class="py-2 cursor-pointer hover:bg-gray-100 px-2 rounded"
        >
          <p class="text-md font-semibold">{{ place.place_name }}</p>
          <p class="text-sm font-light text-gray-600">{{ place.address_name }}</p>
        </li>
      </ul>
    </div>

    <!-- 페이지네이션 -->
    <VueAwesomePaginate
      v-if="places.length > itemsPerPage"
      :total-items="places.length"
      :items-per-page="itemsPerPage"
      v-model="currentPage"
      :max-pages-shown="5"
      class="mt-4 justify-center"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

// Props & emits
const props = defineProps({
  address: String,
  detailAddress: String,
})
const emit = defineEmits(['update:address', 'update:detailAddress', 'verify'])

const keyword = ref('')
const places = ref([])
const currentPage = ref(1)
const itemsPerPage = 5
const isLoading = ref(false)
const errorMessage = ref('')

// 페이지네이션 계산
const pagedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return places.value.slice(start, start + itemsPerPage)
})

// 카카오 지도 API 동적 로드
const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve(window.kakao)
      return
    }
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY}&libraries=services`
    script.async = true
    script.onload = () => {
      if (window.kakao) resolve(window.kakao)
      else reject(new Error('Kakao script loaded but window.kakao is undefined'))
    }
    script.onerror = () => reject(new Error('Kakao script load error'))
    document.head.appendChild(script)
  })
}

// 카카오 API 준비 체크
const waitForKakao = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      if (window.kakao?.maps?.services) {
        resolve(window.kakao)
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Kakao API 로딩 타임아웃'))
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

// 마운트 시 스크립트 로드
onMounted(async () => {
  try {
    await loadKakaoMapScript()
  } catch (err) {
    console.error('Kakao 지도 API 스크립트 로드 실패:', err)
  }
})

// 주소 검색 함수
const searchAddress = async () => {
  if (!keyword.value.trim()) return
  isLoading.value = true
  errorMessage.value = ''

  try {
    await waitForKakao()
    const ps = new kakao.maps.services.Places()

    ps.keywordSearch(keyword.value, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        places.value = data
        currentPage.value = 1
      } else {
        places.value = []
        errorMessage.value = '검색 결과를 찾을 수 없습니다.'
      }
      isLoading.value = false
    })
  } catch (error) {
    console.error('주소 검색 실패:', error)
    errorMessage.value = '주소 검색 중 오류가 발생했습니다.'
    isLoading.value = false
  }
}

// 주소 선택 이벤트 발생
const selectAddress = (address) => {
  emit('update:address', address)
  emit('verify')
}
</script>

<style scoped>
/* 필요 시 스타일 추가 */
</style>
