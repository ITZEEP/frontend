<template>
  <div class="flex flex-col gap-4 items-center justify-center">
    <!-- 본인 인증 헤더 -->
    <div class="flex flex-col gap-2 items-center justify-center">
      <h1 class="text-gray-warm-700 font-bold text-xl">본인 인증</h1>
      <p class="text-gray-500">계약을 위해 본인 인증이 필요합니다.</p>
    </div>

    <!-- 본인 인증 폼 -->
    <div class="w-full flex flex-col gap-3">
      <BaseInput v-model="username" label="이름" placeholder="이름을 입력하세요" />

      <div class="w-full">
        <label :for="id" class="block mb-1 text-sm font-medium text-gray-600"> 주소 </label>
        <div class="w-full flex gap-2">
          <input
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
            type="text"
            :value="address"
            placeholder="주소 검색"
            disabled
          />
          <BaseButton class="w-36" @click="modalStore.open()" variant="primary">
            <img :src="searchIcon" />
            <span class="ml-2">주소 검색</span>
          </BaseButton>

          <Modal :closable="true" :maskCloseable="true">
            <SearchAddress @select="setAddress" />
          </Modal>
        </div>
      </div>

      <BaseInput v-model="detailAddress" label="상세 주소" placeholder="상세 주소를 입력하세요" />

      <div class="w-full flex gap-2">
        <BaseInput v-model="ssnFront" label="주민번호 앞자리" placeholder="앞 6자리" />
        <BaseInput v-model="ssnBack" label="주민번호 뒷자리" placeholder="뒤 7자리" />
      </div>

      <BaseInput v-model="issueDate" label="주민등록증 발급일자" type="date" />

      <BaseButton variant="primary" size="lg" class="mt-2">인증하기</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import searchIcon from '@/assets/icons/searchIcon.svg'

import { useModalStore } from '@/stores/modal'
import Modal from '@/components/common/BaseModal.vue'
import SearchAddress from '@/components/common/SearchAddress.vue'

const modalStore = useModalStore()

const address = ref('')
const setAddress = (newAddress) => {
  address.value = newAddress
}

const username = ref('')
const detailAddress = ref('')
const ssnFront = ref('')
const ssnBack = ref('')
const issueDate = ref('')
</script>

<style scoped></style>
