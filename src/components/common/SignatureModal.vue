<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="close"
      >
        <div class="bg-white rounded-xl w-full max-w-[600px] p-6 relative" @click.stop>
          <button
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            @click="close"
          >
            <span class="text-2xl">&times;</span>
          </button>
          
          <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
          
          <SignaturePad 
            ref="signaturePadRef"
            :width="450"
            :height="200"
            placeholder="여기에 서명해주세요"
            :show-controls="true"
          />
          
          <div class="mt-4 flex justify-end gap-2">
            <button 
              @click="close"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button 
              @click="confirm"
              class="px-4 py-2 bg-yellow-primary text-white rounded-md hover:bg-yellow-500"
            >
              서명 완료
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import SignaturePad from './SignaturePad.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '전자 서명'
  },
  onConfirm: {
    type: Function,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm'])

// 상태
const signaturePadRef = ref(null)

// computed로 v-model 처리
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 모달 닫기
const close = () => {
  isOpen.value = false
}

// 서명 확인
const confirm = () => {
  const signatureData = signaturePadRef.value?.getData()
  
  if (!signatureData) {
    alert('서명을 먼저 해주세요.')
    return
  }
  
  // File 객체 생성
  const file = new File([signatureData.blob], `signature_${Date.now()}.png`, { 
    type: 'image/png' 
  })
  
  // 서명 데이터와 파일 반환
  const result = {
    file,
    dataUrl: signatureData.dataUrl,
    base64: signatureData.base64,
    width: signatureData.width,
    height: signatureData.height
  }
  
  // 콜백 함수 실행 또는 이벤트 발생
  if (props.onConfirm) {
    props.onConfirm(result)
  } else {
    emit('confirm', result)
  }
  
  // 모달 닫기
  close()
  
  // 서명 패드 초기화
  setTimeout(() => {
    signaturePadRef.value?.clear()
  }, 300)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>