<template>
  <div class="w-full flex flex-col items-start mb-3">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-w-md">
      <!-- 상단 태그들 -->
      <div v-if="tags.length" class="mb-2 flex flex-wrap gap-2">
        <span
          v-for="(t, i) in tags"
          :key="i"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1"
          :class="tagColorClass(t)"
        >
          {{ t }}
        </span>
      </div>

      <!-- 제목/인덱스 -->
      <div class="flex items-start gap-2 mb-2">
        <div
          v-if="indexNum !== null"
          class="flex-none w-6 h-6 rounded-full bg-yellow-primary text-white text-xs font-bold flex items-center justify-center"
        >
          {{ indexNum }}
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-800 leading-snug">
          {{ title }}
        </h3>
      </div>

      <!-- 본문 -->
      <div class="text-sm text-gray-700 whitespace-pre-line">
        {{ body }}
      </div>
    </div>

    <!-- 보낸 시각 -->
    <p class="text-xs text-gray-400 mt-1">{{ formattedTime }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  raw: { type: String, required: true },
  sentAt: { type: [String, Number, Date], default: null },
})

const TAG_PALETTE = [
  // 사진 예시 느낌: 보라, 주황, 초록, 파랑, 레드
  { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
  { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
  { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200' },
  // 필요하면 더 추가
]

// 아주 가벼운 해시: 문자열 -> 0..N-1
function hashToIndex(str, mod) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h % mod
}

function tagColorClass(tag) {
  const i = hashToIndex(String(tag || ''), TAG_PALETTE.length)
  const c = TAG_PALETTE[i]
  return `${c.bg} ${c.text} ${c.ring}`
}

/**
 * 파서 규칙
 *  - 첫 번째 줄: "이자제한법, 민법" → 태그로 표시
 *  - 다음 비어있지 않은 줄: "1. 제목" 또는 "제목" → 인덱스/제목 추출
 *  - 그 이후 전부 → 본문
 */
const lines = computed(() =>
  String(props.raw || '')
    .split('\n')
    .map((l) => l.trim()),
)

const firstNonEmptyIdx = computed(() => lines.value.findIndex((l) => l.length > 0))

const tags = computed(() => {
  if (firstNonEmptyIdx.value < 0) return []
  const tagLine = lines.value[firstNonEmptyIdx.value]
  // “,” 또는 “·” 구분 지원
  const parts = tagLine
    .split(/[,·]/)
    .map((s) => s.trim())
    .filter(Boolean)
  // 태그로 쓰기에 너무 길면 태그 아님 처리
  if (parts.join(' ').length > 30) return []
  return parts
})

const titleAndIndexLineIdx = computed(() => {
  if (firstNonEmptyIdx.value < 0) return -1
  // 태그로 인정되면 다음 줄, 아니면 첫 줄이 제목
  const nextIdx = tags.value.length ? firstNonEmptyIdx.value + 1 : firstNonEmptyIdx.value
  // 빈 줄 건너뛰기
  let i = nextIdx
  while (i < lines.value.length && !lines.value[i]) i++
  return i < lines.value.length ? i : -1
})

const { indexNum, title } = (() => {
  const line = titleAndIndexLineIdx.value >= 0 ? lines.value[titleAndIndexLineIdx.value] : ''
  const m = line.match(/^\s*(\d+)\.\s*(.+)$/)
  if (m) {
    return { indexNum: Number(m[1]), title: m[2].trim() }
  }
  return { indexNum: null, title: line || '법령 안내' }
})()

const body = computed(() => {
  if (titleAndIndexLineIdx.value < 0) return ''
  // 본문은 제목 다음 줄부터 끝까지
  const start = titleAndIndexLineIdx.value + 1
  return lines.value.slice(start).join('\n').trim()
})

const formattedTime = computed(() => {
  const date = props.sentAt ? new Date(props.sentAt) : new Date()
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  })
})
</script>
