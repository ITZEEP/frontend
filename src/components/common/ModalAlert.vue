<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title || '알림' }}</h3>
          </div>
          
          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>
          
          <div class="modal-footer">
            <button 
              v-if="type === 'confirm'"
              class="modal-btn modal-btn-secondary"
              @click="handleCancel"
            >
              {{ cancelText || '취소' }}
            </button>
            <button 
              class="modal-btn modal-btn-primary"
              @click="handleConfirm"
            >
              {{ confirmText || '확인' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: String,
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'alert', // alert or confirm
    validator: (value) => ['alert', 'confirm'].includes(value)
  },
  confirmText: String,
  cancelText: String
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

const close = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}

const handleOverlayClick = () => {
  if (props.type === 'alert') {
    close()
  }
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl w-full max-w-md mx-4;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-message {
  @apply text-gray-700 whitespace-pre-line;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end gap-3;
}

.modal-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.modal-btn-primary {
  @apply bg-yellow-primary text-white hover:bg-yellow-500;
}

.modal-btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>