<template>
  <h1 class="text-gray-800 font-bold text-lg p-2">주소 검색</h1>

  <div class="p-4 min-h-96 max-h-96 flex flex-col items-center gap-4">
    <div class="w-full flex gap-2 mb-4">
      <input
        v-model="keyword"
        @keyup.enter="searchAddress"
        placeholder="도로명 주소, 지번, 건물명 등을 검색하세요"
        class="w-full flex-1 px-4 py-2 border border-gray-300 rounded-md"
      />
      <BaseButton @click="searchAddress" variant="primary">검색</BaseButton>
    </div>

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
import { ref, computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useModalStore } from '@/stores/modal'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

const emit = defineEmits(['select'])
const modalStore = useModalStore()

const keyword = ref('')
const places = ref([])

const currentPage = ref(1)
const itemsPerPage = 5

const pagedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return places.value.slice(start, start + itemsPerPage)
})

const waitForKakao = () => {
  return new Promise((resolve) => {
    const check = () => {
      if (window.kakao?.maps?.services) {
        resolve(window.kakao)
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

const searchAddress = async () => {
  if (!keyword.value.trim()) return

  const kakao = await waitForKakao()
  const ps = new kakao.maps.services.Places()

  ps.keywordSearch(keyword.value, (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      places.value = data
      currentPage.value = 1
    } else {
      places.value = []
    }
  })
}

const selectAddress = (address) => {
  emit('select', address)
  modalStore.close()
}
</script>

<style></style>
