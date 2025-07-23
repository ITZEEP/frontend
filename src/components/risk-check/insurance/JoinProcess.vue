<script setup>
const joinProcess = [
  {
    step: 1,
    title: '보험사 선택',
    description: ['본인의 조건에 맞는', '보험사와 상품을 선택합니다.'],
  },
  {
    step: 2,
    title: '서류 준비',
    description: ['임대차계약서, 등기부등본 등', '필요 서류를 준비합니다.'],
  },
  {
    step: 3,
    title: '심사 신청',
    description: ['온라인 또는 오프라인으로', '보증 심사를 신청합니다.'],
  },
  {
    step: 4,
    title: '보증료 납부',
    description: ['심사 승인 후 보증료를 납부하고', '보증서를 발급받습니다.'],
  },
]
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-warm-700 mb-6">가입 절차</h2>
    <div class="relative">
      <div class="grid grid-cols-4 gap-6">
        <div v-for="(process, index) in joinProcess" :key="process.step" class="text-center relative">
          <!-- 연결선 -->
          <div 
            v-if="index < joinProcess.length - 1"
            class="absolute top-8 h-0.5 bg-gray-300 z-0"
            style="left: 80%; right: -30%;"
          ></div>
          
          <!-- 단계 원 -->
          <div
            class="w-16 h-16 bg-yellow-primary hover:bg-yellow-450 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10 transition-colors duration-200 shadow-sm"
          >
            {{ process.step }}
          </div>
          
          <!-- 제목과 설명 -->
          <h3 class="font-semibold text-gray-warm-700 mb-2">{{ process.title }}</h3>
          <div class="text-sm text-gray-warm-500">
            <p>{{ process.description[0] }}</p>
            <p>{{ process.description[1] }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>