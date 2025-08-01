<template>
  <form @submit.prevent="onSubmit" class="max-w-4xl mx-auto p-6 space-y-6 border rounded-md">
    <h2 class="text-lg text-gray mb-2">시설 정보</h2>
    <p class="mb-4 text-gray-700">
      해당되는 시설을 모두 선택해주세요. 임차인이 확인할 수 있습니다.
    </p>

    <!-- 가전 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">가전</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.appliances" value="TV" />
          <span>TV</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.appliances" value="세탁기" />
          <span>세탁기</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.appliances" value="냉장고" />
          <span>냉장고</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.appliances" value="전자레인지" />
          <span>전자레인지</span>
        </label>
      </div>
    </fieldset>

    <!-- 주방 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">주방</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.kitchen" value="인덕션" />
          <span>인덕션</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.kitchen" value="가스레인지" />
          <span>가스레인지</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.kitchen" value="싱크대" />
          <span>싱크대</span>
        </label>
      </div>
    </fieldset>

    <!-- 냉난방 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">냉난방</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.heatingCooling" value="에어컨" />
          <span>에어컨</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.heatingCooling" value="벽걸이 에어컨" />
          <span>벽걸이 에어컨</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.heatingCooling" value="빌트인 에어컨" />
          <span>빌트인 에어컨</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.heatingCooling" value="개별난방" />
          <span>개별난방</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.heatingCooling" value="전체 난방" />
          <span>전체 난방</span>
        </label>
      </div>
    </fieldset>

    <!-- 가구 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">가구</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.furniture" value="책상" />
          <span>책상</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.furniture" value="옷장" />
          <span>옷장</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.furniture" value="붙박이장" />
          <span>붙박이장</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.furniture" value="신발장" />
          <span>신발장</span>
        </label>
      </div>
    </fieldset>

    <!-- 욕실 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">욕실</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.bathroom" value="욕조" />
          <span>욕조</span>
        </label>
      </div>
    </fieldset>

    <!-- 보안/안전 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">보안/안전</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="현관 보안" />
          <span>현관 보안</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="CCTV" />
          <span>CCTV</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="인터폰" />
          <span>인터폰</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="도어락" />
          <span>도어락</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="카드키" />
          <span>카드키</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="방범창" />
          <span>방범창</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="경비" />
          <span>경비</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="화재 경보기" />
          <span>화재 경보기</span>
        </label>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.security" value="소화기" />
          <span>소화기</span>
        </label>
      </div>
    </fieldset>

    <!-- 기타 -->
    <fieldset class="border border-gray-300 rounded-md p-4">
      <legend class="font-semibold mb-2">기타</legend>
      <div class="flex flex-wrap gap-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="form.etc" value="엘리베이터" />
          <span>엘리베이터</span>
        </label>
      </div>
    </fieldset>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  appliances: [],
  kitchen: [],
  heatingCooling: [],
  furniture: [],
  bathroom: [],
  security: [],
  etc: [],
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      appliances: [],
      kitchen: [],
      heatingCooling: [],
      furniture: [],
      bathroom: [],
      security: [],
      etc: [],
    }),
  },
})

function updateOptions() {
  emit('update:modelValue', form)
}

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
/* 필요하면 숫자 input no-spin 등 추가 */
/* 체크박스 스타일은 tailwind 기본이라 따로 추가 안 해도 됨 */
</style>
