// AI 버튼 규칙(콘텐츠/메타/senderId) 캡슐화
import { computed } from 'vue'
import { getAiButtonsForMessage, AI_SENDER } from '@/config/chat/aiUiRegistry'

export function useChatAiButtons(currentStep, isOwnerFn) {
  const stepNum = computed(() => Number(currentStep) || 3)

  const isAi = (m) =>
    [AI_SENDER.PLAIN, AI_SENDER.BUTTON, AI_SENDER.COMPLETE].includes(String(m?.senderId))

  const aiButtons = (message) => {
    const base = getAiButtonsForMessage(stepNum.value, message) || []
    if (!Array.isArray(base)) return []
    if (!isOwnerFn()) return base
    // 임대인 화면에서는 응답 버튼 숨김
    return base.filter(
      (b) =>
        !/^step3\.(modification|deletion|finalConfirm)\.(accept|reject)$/.test(
          String(b?.action || ''),
        ),
    )
  }

  return { stepNum, isAi, aiButtons }
}
