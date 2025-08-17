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
  // ✨ 추가된 부분: 디버깅을 위해 선택된 주소값을 콘솔에 출력
  console.log('✅ onAddressSelect 함수 호출됨. 선택된 주소:', selectedAddress)

  if (selectedAddress) {
    updateForm('addr1', selectedAddress)
  }

  // ✨ 추가된 부분: 업데이트된 form.addr1 값 확인
  console.log('업데이트 후 form 객체:', props.form)

  modalStore.close()
}

// 매물 종류
const residenceTypeOptions = [
  { label: '오픈형 원룸', value: 'OPEN_ONE_ROOM' },
  { label: '분리형 원룸', value: 'SEPARATED_ONE_ROOM' },
  { label: '투룸', value: 'TWO_ROOM' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '아파트', value: 'APARTMENT' },
  { label: '단독주택', value: 'HOUSE' },
  { label: '빌라', value: 'VILLA' },
]

// 거래 유형 (한글 라벨 + 영어 enum 값)
const leaseTypeOptions = [
  { label: '월세', value: 'WOLSE' },
  { label: '전세', value: 'JEONSE' },
]
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">기본 정보</h2>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        매물 종류 <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="option in residenceTypeOptions"
          :key="option.value"
          :class="[
            'py-2 px-4 border rounded-md text-sm font-medium transition',
            props.form.residenceType === option.value
              ? 'bg-yellow-primary text-white border-yellow-primary'
              : 'bg-white text-gray-700 hover:bg-gray-50',
          ]"
          @click="updateForm('residenceType', option.value)"
          type="button"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        거래 유형 <span class="text-red-500">*</span>
      </label>
      <div class="flex gap-6">
        <BaseRadio
          v-for="option in leaseTypeOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :modelValue="form.leaseType"
          name="leaseType"
          @update:modelValue="updateForm('leaseType', $event)"
        />
      </div>
    </div>

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

    <BaseModal :closable="true" :maskCloseable="true">
      <SearchAddress @select="onAddressSelect" />
    </BaseModal>
  </div>
</template>
