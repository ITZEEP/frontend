<template>
  <div class="signature-pad-container">
    <div class="canvas-wrapper">
      <canvas
        ref="canvas"
        :width="width"
        :height="height"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="stopDrawing"
        class="signature-canvas"
      />
      
      <div v-if="isEmpty" class="signature-placeholder">
        <span class="text-gray-400 text-sm">{{ placeholder }}</span>
      </div>
    </div>

    <div v-if="showControls" class="controls-wrapper">
      <button @click="clear" :disabled="isEmpty" class="btn-control">
        지우기
      </button>
      <button @click="undo" :disabled="!canUndo" class="btn-control">
        되돌리기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  width: { type: Number, default: 500 },
  height: { type: Number, default: 200 },
  placeholder: { type: String, default: '여기에 서명해주세요' },
  showControls: { type: Boolean, default: true }
})

const canvas = ref(null)
const context = ref(null)
const isDrawing = ref(false)
const strokeHistory = ref([])
const currentStroke = ref([])

const LINE_WIDTH = 2
const STROKE_COLOR = '#000000'

const isEmpty = computed(() => strokeHistory.value.length === 0)
const canUndo = computed(() => strokeHistory.value.length > 0)

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d')
    initCanvas()
  }
})

const initCanvas = () => {
  if (context.value) {
    context.value.fillStyle = '#ffffff'
    context.value.fillRect(0, 0, props.width, props.height)
  }
}

const startDrawing = (e) => {
  isDrawing.value = true
  currentStroke.value = []
  const point = getPoint(e)
  
  context.value.beginPath()
  context.value.moveTo(point.x, point.y)
  context.value.lineWidth = LINE_WIDTH
  context.value.strokeStyle = STROKE_COLOR
  context.value.lineCap = 'round'
  context.value.lineJoin = 'round'
  
  currentStroke.value.push(point)
}

const draw = (e) => {
  if (!isDrawing.value) return
  const point = getPoint(e)
  context.value.lineTo(point.x, point.y)
  context.value.stroke()
  currentStroke.value.push(point)
}

const stopDrawing = () => {
  if (isDrawing.value && currentStroke.value.length > 0) {
    strokeHistory.value.push([...currentStroke.value])
  }
  isDrawing.value = false
}

const getPoint = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const handleTouchStart = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  canvas.value.dispatchEvent(new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  }))
}

const handleTouchMove = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  canvas.value.dispatchEvent(new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  }))
}

const clear = () => {
  initCanvas()
  strokeHistory.value = []
  currentStroke.value = []
}

const undo = () => {
  if (strokeHistory.value.length === 0) return
  strokeHistory.value.pop()
  redrawCanvas()
}

const redrawCanvas = () => {
  initCanvas()
  strokeHistory.value.forEach(stroke => {
    if (stroke.length === 0) return
    
    context.value.beginPath()
    context.value.lineWidth = LINE_WIDTH
    context.value.strokeStyle = STROKE_COLOR
    context.value.lineCap = 'round'
    context.value.lineJoin = 'round'
    context.value.moveTo(stroke[0].x, stroke[0].y)
    
    for (let i = 1; i < stroke.length; i++) {
      context.value.lineTo(stroke[i].x, stroke[i].y)
    }
    context.value.stroke()
  })
}

const getData = () => {
  if (isEmpty.value) return null
  
  // 서명 영역 계산
  const imageData = context.value.getImageData(0, 0, props.width, props.height)
  const data = imageData.data
  
  let minX = props.width, minY = props.height
  let maxX = 0, maxY = 0
  
  for (let y = 0; y < props.height; y++) {
    for (let x = 0; x < props.width; x++) {
      const i = (y * props.width + x) * 4
      if (!(data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255)) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  
  const padding = 10
  const bounds = {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(props.width, maxX + padding) - Math.max(0, minX - padding),
    height: Math.min(props.height, maxY + padding) - Math.max(0, minY - padding)
  }
  
  // 크롭된 캔버스 생성
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = bounds.width
  tempCanvas.height = bounds.height
  const tempContext = tempCanvas.getContext('2d')
  
  const croppedData = context.value.getImageData(bounds.x, bounds.y, bounds.width, bounds.height)
  const pixels = croppedData.data
  
  // 흰색을 투명으로
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] === 255 && pixels[i + 1] === 255 && pixels[i + 2] === 255) {
      pixels[i + 3] = 0
    }
  }
  
  tempContext.putImageData(croppedData, 0, 0)
  
  const dataUrl = tempCanvas.toDataURL('image/png')
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  
  return {
    dataUrl,
    base64,
    blob: new Blob([bytes], { type: 'image/png' }),
    width: bounds.width,
    height: bounds.height
  }
}

defineExpose({ getData, clear, undo, isEmpty })
</script>

<style scoped>
.signature-pad-container {
  @apply bg-white rounded-lg;
}

.canvas-wrapper {
  @apply relative border-2 border-gray-300 rounded-lg overflow-hidden;
}

.signature-canvas {
  @apply block cursor-crosshair bg-white;
  touch-action: none;
}

.signature-placeholder {
  @apply absolute inset-0 flex items-center justify-center pointer-events-none;
}

.controls-wrapper {
  @apply flex gap-2 mt-3;
}

.btn-control {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium;
  @apply hover:bg-gray-200 transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>