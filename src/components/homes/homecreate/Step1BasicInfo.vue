<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import SearchAddress from '@/components/common/SearchAddress.vue'
import BaseRadio from '@/components/common/BaseRadio.vue'
import { useModalStore } from '@/stores/modal'

const props = defineProps({
  form: {
    type: Object,
    required: true,
    validator(value) {
      return (
        value &&
        typeof value === 'object' &&
        'residenceType' in value &&
        'leaseType' in value &&
        'addr1' in value &&
        'addr2' in value
      )
    },
  },
})

const emit = defineEmits(['update:form'])
const modalStore = useModalStore()

const updateForm = (field, value) => {
  emit('update:form', {
    ...props.form,
    [field]: value,
  })
}

const onAddressSelect = (selectedAddress) => {
  updateForm('addr1', selectedAddress)
  modalStore.close()
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">기본 정보</h2>

    <!-- 매물 종류 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        매물 종류 <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="type in [
            '오픈형 원룸',
            '분리형 원룸',
            '투룸',
            '오피스텔',
            '아파트',
            '단독/다가구주택',
          ]"
          :key="type"
          :class="[
            'py-2 px-4 border rounded-md text-sm font-medium transition',
            props.form.residenceType === type
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white text-gray-700 hover:bg-gray-50',
          ]"
          @click="updateForm('residenceType', type)"
          type="button"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <!-- 거래 유형 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        거래 유형 <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-6">
        <BaseRadio
          v-for="type in ['월세', '전세']"
          :key="type"
          :modelValue="props.form.leaseType"
          :value="type"
          :label="type"
          name="leaseType"
          @update:modelValue="updateForm('leaseType', $event)"
        />
      </div>
    </div>

    <!-- 주소 입력 -->
    <div>
      <label class="block mb-1 text-sm font-medium text-gray-600">
        주소<span class="text-red-500">*</span>
      </label>
      <div class="flex gap-2">
        <input
          class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          type="text"
          :value="props.form.addr1"
          placeholder="주소 검색"
          disabled
        />
        <BaseButton
          class="w-36 flex justify-center items-center"
          variant="primary"
          type="button"
          @click="modalStore.open()"
        >
          주소 검색
        </BaseButton>
      </div>
    </div>

    <!-- 상세 주소 입력 -->
    <div>
      <label class="block mb-1 text-sm font-medium text-gray-600">상세 주소</label>
      <input
        :value="props.form.addr2"
        @input="updateForm('addr2', $event.target.value)"
        class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
        type="text"
        placeholder="상세 주소를 입력하세요"
      />
    </div>

    <!-- 모달: 주소 검색 -->
    <BaseModal :closable="true" :maskCloseable="true">
      <SearchAddress @select="onAddressSelect" />
    </BaseModal>
  </div>
</template>
