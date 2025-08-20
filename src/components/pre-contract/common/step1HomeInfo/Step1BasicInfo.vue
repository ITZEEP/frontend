<template>
  <div class="flex flex-col items-center justify-center gap-8">
    <div class="flex flex-col items-center justify-center gap-2">
      <h1 class="text-gray-warm-700 font-bold text-xl">매물 정보 확인</h1>
      <p class="text-gray-500">계약할 매물의 상세 정보를 확인해주세요</p>
    </div>

    <!-- 로딩/에러 -->
    <div v-if="loading" class="text-gray-500">매물 정보를 불러오는 중...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <!-- 본문 -->
    <div v-else-if="view" class="w-full flex flex-col items-center justify-center gap-4">
      <!-- 기존 컴포넌트에 "기대한 형태"로 전달 -->
      <HomeInfoMain :data="view.home" />
      <HomeInfoDashboard :data="view" />
      <HomePhotos :data="view.images" />
      <HomeConfirm />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePreContractStore } from '@/stores/preContract'
import HomeInfoMain from './HomeInfoMain.vue'
import HomeInfoDashboard from './HomeInfoDashboard.vue'
import HomePhotos from './HomePhotos.vue'
import HomeConfirm from './HomeConfirm.vue'
import { fetchListingById } from '@/apis/listing' // ← 훅 import 경로 맞춰주세요
import { getContractInfo } from '@/apis/contractChatApi'

const route = useRoute()
const router = useRouter()
const store = usePreContractStore()

const loading = ref(false)
const error = ref('')
const view = ref(null) // 하위 컴포넌트들이 기대하는 최종 형태

onMounted(load)

const maintenanceIdMap = {
  1: '전기료',
  2: '수도료',
  3: '가스료',
  4: '인터넷',
  5: '청소비',
}

const getMaintenanceNameById = (id) => {
  return maintenanceIdMap[id] || '알 수 없음'
}

async function load() {
  let homeId = route.query?.homeId

  // 1) homeId 쿼리가 없으면 contractChatId로 계약정보 조회해서 보강
  if (!homeId) {
    const contractChatId = route.params?.contractChatId || route.params?.id || route.params?.chatId

    if (!contractChatId) {
      error.value = 'contractChatId 파라미터가 없습니다.'
      return
    }

    try {
      const info = await getContractInfo(contractChatId)
      if (info?.success && info.data?.homeId) {
        homeId = String(info.data.homeId)

        // 2) URL에 homeId 쿼리 주입 (뒤로 가기 동작도 자연스럽게)
        const nextQuery = { ...route.query, homeId }
        if (String(route.query?.homeId || '') !== String(homeId)) {
          await router.replace({
            path: route.path,
            query: nextQuery,
          })
        }
      } else {
        error.value = info?.message || '계약 정보에서 homeId를 찾을 수 없습니다.'
        return
      }
    } catch (e) {
      console.error(e)
      error.value = '계약 정보를 불러오는 중 오류가 발생했습니다.'
      return
    }
  }

  // 3) 매물 정보 로드
  loading.value = true
  error.value = ''
  try {
    const data = await fetchListingById(homeId)
    view.value = mapApiToView(data)

    // 스토어/로컬스토리지 저장
    const leaseType = view.value?.home?.lease_type
    if (leaseType) {
      localStorage.setItem('rent_type', leaseType)
      store.setLeaseType(leaseType)
    }
  } catch (e) {
    console.error(e)
    error.value = '매물 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/**
 * API 응답을 기존 컴포넌트들이 기대하는 shape으로 변환
 * - 금액: API(원) → 컴포넌트(만원)로 변환
 * - leaseType: 한글 → 'JEONSE'/'WOLSE'
 * - facilities/maintenance/image 필드 형태 변환
 */
function mapApiToView(api) {
  if (!api) return null

  // 1) 단위/타입 변환
  const toMan = (won) => Math.round((Number(won) || 0) / 10000)
  const leaseTypeMap = (s) => {
    // API는 '전세'/'월세' 라고 내려옴
    if (s === '전세') return 'JEONSE'
    if (s === '월세') return 'WOLSE'
    return 'WOLSE'
  }

  // 2) HomeInfoMain에서 기대하는 home 객체
  //    - title은 API에 없음 → 주소/형태로 간략 텍스트 구성
  const title = `${api.addr2 ?? ''} · ${api.residenceType ?? ''}`.trim()

  const home = {
    // HomeInfoMain에서 사용하는 필드
    title,
    addr1: api.addr1,
    addr2: api.addr2,
    lease_type: leaseTypeMap(api.leaseType),
    deposit_price: toMan(api.depositPrice),
    monthly_rent: toMan(api.monthlyRent),

    exclusive_area: api.exclusiveArea, // ㎡
    supply_area: api.supplyArea, // ㎡
    room_cnt: api.roomCnt,
    bathroom_count: api.bathroomCnt,
    maintenance_fee: toMan(api.maintenaceFee ?? 0),
  }

  // 3) 세부 정보
  const home_detail = {
    home_floor: api.homeFloor,
    building_total_floors: api.buildingTotalFloors,
    build_date: api.buildDate,
    home_direction: directionToCode(api.homeDirection),
  }

  // 4) 관리비 항목
  const maintenance_items = (api.maintenanceFees || []).map((m) => ({
    item_name: getMaintenanceNameById(m.maintenanceId),
    fee: toMan(m.fee || 0),
  }))

  // 5) 시설 분류 매핑
  const fac = { '건물 시설': [], '내부 시설': [], '보안 시설': [] }
  ;(api.facilities || []).forEach((f) => {
    if (f.categoryId === 1) fac['내부 시설'].push(f.itemName)
    else if (f.categoryId === 2) fac['건물 시설'].push(f.itemName)
    else fac['보안 시설'].push(f.itemName)
  })

  // 6) 사진
  const images = (api.imageUrls || []).map((url, idx) => ({
    image_id: `${api.homeId}-${idx + 1}`,
    image_url: url,
    space_type: '',
  }))

  // 7) HomeInfoDashboard가 기대하는 전체 패키지
  return {
    home, // HomeInfoMain, HomeMaintenanceInfo, HomeBasicInfo에서 사용
    home_detail, // HomeBasicInfo에서 사용
    maintenance_items, // HomeMaintenanceInfo에서 사용
    facilities: fac, // Facility* 컴포넌트에서 사용
    images, // HomePhotos에서 사용
  }
}

function directionToCode(kor) {
  // 대충 매핑 (필요시 보완)
  const map = {
    남향: 'S',
    북향: 'N',
    동향: 'E',
    서향: 'W',
    남동향: 'SE',
    남서향: 'SW',
    북동향: 'NE',
    북서향: 'NW',
  }
  return map[kor] || kor // 못 찾으면 원문
}
</script>
