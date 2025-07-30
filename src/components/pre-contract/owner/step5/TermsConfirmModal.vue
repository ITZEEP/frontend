<template>
  <BaseModal>
    <div class="flex flex-col gap-4">
      <div>
        <h1 class="text-lg font-bold text-gray-700">특약 검토</h1>
        <p class="text-sm text-gray-500">추출된 특약을 확인하고 수정할 수 있습니다.</p>
      </div>

      <div class="flex flex-col gap-2">
        <BaseInput
          v-for="(term, index) in localTerms"
          :key="index"
          v-model="localTerms[index]"
          :label="`특약 ${index + 1}`"
          :id="`term-${index}`"
          placeholder="특약 내용을 입력하세요"
        />
      </div>

      <BaseButton variant="primary" class="w-full" @click="handleConfirm">확인</BaseButton>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  extractedTerms: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['confirm'])

const localTerms = ref([...props.extractedTerms])

watch(
  () => props.extractedTerms,
  (newVal) => {
    localTerms.value = [...newVal]
  },
)

const handleConfirm = () => {
  emit('confirm', localTerms.value)
}
</script>
