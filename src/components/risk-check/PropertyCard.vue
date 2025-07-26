<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconChat from '@/components/icons/IconChat.vue'
import PropertyItem from '@/components/common/PropertyItem.vue'
import { fraudApi } from '@/api/fraud'

import favoritesMockData from '@/mocks/risk/favoritesMockData.json'
import chatPropertiesMockData from '@/mocks/risk/chatPropertiesMockData.json'

const props = defineProps({
  selectedTab: {
    type: String,
    default: 'favorite',
  },
})

const emit = defineEmits(['select-tab', 'select-property'])

const LOADING_DELAY = 800
const SCROLL_DELAY_CHECK = 150

const isLoading = ref(true)
const scrollContainer = ref(null)
const showTopFade = ref(false)
const showBottomFade = ref(false)
const selectedPropertyId = ref(null)
const properties = ref({
  favorite: [],
  chat: [],
})

const currentProperties = computed(() => properties.value[props.selectedTab])

const sortedProperties = computed(() => {
  if (!selectedPropertyId.value) {
    return currentProperties.value
  }

  const selected = currentProperties.value.find((p) => p.id === selectedPropertyId.value)
  const others = currentProperties.value.filter((p) => p.id !== selectedPropertyId.value)

  return selected ? [selected, ...others] : currentProperties.value
})

const selectTab = (tab) => {
  emit('select-tab', tab)
}

const selectProperty = (property) => {
  selectedPropertyId.value = property.id
  emit('select-property', property.id)
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0
  }
}

const checkScroll = () => {
  if (!scrollContainer.value) {
    showTopFade.value = false
    showBottomFade.value = false
    return
  }

  if (currentProperties.value.length <= 3) {
    showTopFade.value = false
    showBottomFade.value = false
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const isScrollable = scrollHeight > clientHeight

  if (isScrollable) {
    showTopFade.value = scrollTop > 10
    showBottomFade.value = scrollTop < scrollHeight - clientHeight - 10
  } else {
    showTopFade.value = false
    showBottomFade.value = false
  }
}

const handleScroll = () => {
  checkScroll()
}

// 가격 표시 포맷팅 헬퍼 함수
const formatPrice = (item) => {
  let priceDisplay = ''
  if (item.leaseType === 'WOLSE' && item.monthlyRent) {
    // 월세인 경우
    priceDisplay = `월세 ${(item.depositPrice / 10000).toLocaleString()}/${(item.monthlyRent / 10000).toLocaleString()}만원`
  } else if (item.depositPrice) {
    // 전세 또는 매매인 경우
    const priceInManwon = item.depositPrice / 10000
    if (priceInManwon >= 10000) {
      const billion = Math.floor(priceInManwon / 10000)
      const remainder = priceInManwon % 10000
      priceDisplay = remainder > 0 ? `${billion}억 ${remainder.toLocaleString()}만원` : `${billion}억원`
    } else {
      priceDisplay = `${priceInManwon.toLocaleString()}만원`
    }
  }
  return priceDisplay
}

// 찜한 매물 목록 조회
const fetchLikedHomes = async () => {
  try {
    const response = await fraudApi.getLikedHomes()
    if (response.success && response.data) {
      properties.value.favorite = response.data.map(item => ({
        id: item.homeId,
        name: item.residenceType,
        address: item.address,
        detailAddress: item.detailAddress,
        price: formatPrice(item),
        image: item.imageUrl,
        leaseType: item.leaseType,
        depositPrice: item.depositPrice,
        monthlyRent: item.monthlyRent
      }))
    }
  } catch (error) {
    console.error('찜한 매물 조회 실패:', error)
    // 에러 시 Mock 데이터 사용
    properties.value.favorite = favoritesMockData.favorites.map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      price: item.price,
      image: item.image,
    }))
  }
}

// 채팅 중인 매물 목록 조회
const fetchChattingHomes = async () => {
  try {
    const response = await fraudApi.getChattingHomes(1, 50) // 처음 50개 조회
    if (response.content) {
      properties.value.chat = response.content.map(item => ({
        id: item.homeId,
        name: item.residenceType,
        address: item.address,
        detailAddress: item.detailAddress,
        price: formatPrice(item),
        image: item.imageUrl,
        leaseType: item.leaseType,
        depositPrice: item.depositPrice,
        monthlyRent: item.monthlyRent
      }))
    }
  } catch (error) {
    console.error('채팅 중인 매물 조회 실패:', error)
    // 에러 시 Mock 데이터 사용
    properties.value.chat = chatPropertiesMockData.chatProperties.map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      price: item.price,
      image: item.image,
    }))
  }
}

onMounted(async () => {
  selectedPropertyId.value = null
  emit('select-property', null)
  
  // 찜한 매물 목록 조회
  await fetchLikedHomes()
  
  setTimeout(() => {
    isLoading.value = false
    nextTick(() => {
      checkScroll()
    })
  }, LOADING_DELAY)
})

watch(
  () => props.selectedTab,
  async () => {
    showTopFade.value = false
    showBottomFade.value = false
    selectedPropertyId.value = null
    isLoading.value = true

    // 탭 변경 시 해당 매물 목록 조회
    if (props.selectedTab === 'favorite') {
      await fetchLikedHomes()
    } else if (props.selectedTab === 'chat') {
      await fetchChattingHomes()
    }

    setTimeout(() => {
      isLoading.value = false
    }, LOADING_DELAY)

    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0
        setTimeout(() => {
          checkScroll()
        }, SCROLL_DELAY_CHECK)
      }
    })
  },
)

watch(isLoading, (newValue) => {
  if (!newValue) {
    nextTick(() => {
      setTimeout(() => {
        checkScroll()
      }, SCROLL_DELAY_CHECK)
    })
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-300 p-8">
    <h2 class="text-xl font-semibold text-gray-warm-700 mb-6">매물 선택</h2>

    <div class="flex gap-4 mb-6">
      <button
        @click="selectTab('favorite')"
        :class="[
          'flex items-center px-4 py-2 text-sm font-medium transition-colors',
          selectedTab === 'favorite'
            ? 'text-yellow-primary border-b-2 border-yellow-primary'
            : 'text-gray-warm-700 hover:text-gray-900',
        ]"
      >
        <IconHeart
          :class="[
            'w-4 h-4 mr-2',
            selectedTab === 'favorite' ? 'text-yellow-primary' : 'text-gray-warm-700',
          ]"
        />
        즐겨찾기 매물
      </button>
      <button
        @click="selectTab('chat')"
        :class="[
          'flex items-center px-4 py-2 text-sm font-medium transition-colors',
          selectedTab === 'chat'
            ? 'text-yellow-primary border-b-2 border-yellow-primary'
            : 'text-gray-warm-700 hover:text-gray-900',
        ]"
      >
        <IconChat
          :class="[
            'w-5 h-4 mr-2',
            selectedTab === 'chat' ? 'text-yellow-primary' : 'text-gray-warm-700',
          ]"
        />
        채팅 매물
      </button>
    </div>

    <div class="relative">
      <!-- 상단 페이드 효과 -->
      <div
        v-if="showTopFade"
        class="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"
      ></div>

      <!-- 매물 리스트 컨테이너 -->
      <div
        ref="scrollContainer"
        @scroll="handleScroll"
        class="max-h-[300px] overflow-y-auto overflow-x-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        <transition name="fade" mode="out-in">
          <div v-if="!isLoading" :key="selectedTab" class="px-1 pt-3">
            <template v-for="(property, index) in sortedProperties" :key="property.id">
              <!-- 선택된 매물과 다른 매물 사이 구분선 -->
              <div v-if="selectedPropertyId && index === 1" class="relative my-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-3 text-gray-500">다른 매물</span>
                </div>
              </div>

              <div
                class="relative"
                :class="[
                  index > 0 && !selectedPropertyId ? 'mt-3' : '',
                  index === 0 && selectedPropertyId === property.id ? 'mt-1' : 'mt-3',
                ]"
              >
                <div
                  v-if="selectedPropertyId === property.id && index === 0"
                  class="absolute -top-3 left-4 bg-yellow-primary text-white text-xs px-3 py-1 rounded-full z-10"
                >
                  선택된 매물
                </div>
                <PropertyItem
                  :property="{
                    id: property.id,
                    title: property.name,
                    address: property.address,
                    detailAddress: property.detailAddress,
                    type: property.name,
                    imageUrl: property.image,
                    price: property.price
                  }"
                  :selected="selectedPropertyId === property.id"
                  @click="selectProperty(property)"
                />
              </div>
            </template>
          </div>
          <div v-else :key="`loading-${selectedTab}`" class="space-y-3 px-1 pt-3">
            <PropertyItem
              v-for="n in 3"
              :key="n"
              :property="{}"
              :is-loading="true"
              :clickable="false"
            />
          </div>
        </transition>
      </div>

      <!-- 하단 페이드 효과 -->
      <div
        v-if="showBottomFade"
        class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 스크롤바 스타일링 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
