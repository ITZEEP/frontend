<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 배경 오버레이 -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="handleCancel"
        ></div>
        
        <!-- 모달 컨텐츠 -->
        <transition
          enter-active-class="transition-all duration-300 delay-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div 
            v-if="isOpen"
            class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
          >
            <!-- 아이콘 -->
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <!-- 제목 -->
            <h2 class="text-xl font-bold text-center text-gray-900 mb-2">
              로그인이 필요합니다
            </h2>
            
            <!-- 설명 -->
            <p class="text-sm text-gray-600 text-center mb-6">
              이 서비스를 이용하려면 로그인해 주세요.
            </p>
            
            <!-- 버튼 그룹 -->
            <div class="flex gap-3">
              <button
                @click="handleCancel"
                class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                취소
              </button>
              <button
                @click="handleConfirm"
                class="flex-1 px-4 py-2.5 bg-yellow-primary text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium text-sm"
              >
                로그인
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  redirectPath: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const router = useRouter()
const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleConfirm = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('confirm')
  
  // 로그인 페이지로 이동
  const query = props.redirectPath ? { redirect: props.redirectPath } : {}
  router.push({ name: 'signin', query })
  
  document.body.style.overflow = ''
}

const handleCancel = () => {
  isOpen.value = false
  emit('update:modelValue', false)
  emit('cancel')
  document.body.style.overflow = ''
}
</script>

<style scoped>
/* 애니메이션 개선 */
.transition-all {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>