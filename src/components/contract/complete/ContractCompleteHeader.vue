<template>
  <div
    class="w-full bg-gray-50 border-b-2 py-5 px-8 flex justify-center items-center relative overflow-hidden"
  >
    <!-- 폭죽 애니메이션 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="fireworks-container">
        <div v-for="i in 40" :key="i" class="firework" :class="`firework-${i}`">
          <div
            class="spark spark-1"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-2"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-3"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-4"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-5"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-6"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-7"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-8"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-9"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-10"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-11"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
          <div
            class="spark spark-12"
            :class="{ small: i % 3 === 0, large: i % 5 === 0, xlarge: i % 7 === 0 }"
          ></div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-6 relative z-10">
      <img src="/contract_complete.png" alt="계약서 완료" class="w-32 h-32 object-contain" />

      <div>
        <h1 class="text-gray-800 font-bold text-xl">계약서 생성이 완료되었습니다</h1>
        <p class="text-gray-500 text-sm mt-1">생성된 계약서를 확인하고 다운로드하실 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fireworks-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.firework {
  position: absolute;
  width: 2px;
  height: 2px;
}

/* 40개 폭죽의 랜덤 위치와 반복 애니메이션 */
.firework-1 {
  top: 15%;
  left: 10%;
  animation: firework-loop 6s ease-out infinite 3.2s;
}
.firework-2 {
  top: 25%;
  left: 20%;
  animation: firework-loop 6s ease-out infinite 4.8s;
}
.firework-3 {
  top: 35%;
  left: 30%;
  animation: firework-loop 6s ease-out infinite 1s;
}
.firework-4 {
  top: 45%;
  left: 15%;
  animation: firework-loop 6s ease-out infinite 5.6s;
}
.firework-5 {
  top: 20%;
  left: 45%;
  animation: firework-loop 6s ease-out infinite 3.6s;
}
.firework-6 {
  top: 30%;
  left: 55%;
  animation: firework-loop 6s ease-out infinite 4.4s;
}
.firework-7 {
  top: 40%;
  left: 65%;
  animation: firework-loop 6s ease-out infinite 5.2s;
}
.firework-8 {
  top: 50%;
  left: 75%;
  animation: firework-loop 6s ease-out infinite 3s;
}
.firework-9 {
  top: 15%;
  right: 10%;
  animation: firework-loop 6s ease-out infinite 3.4s;
}
.firework-10 {
  top: 25%;
  right: 20%;
  animation: firework-loop 6s ease-out infinite 3.8s;
}
.firework-11 {
  top: 35%;
  right: 30%;
  animation: firework-loop 6s ease-out infinite 4.2s;
}
.firework-12 {
  top: 45%;
  right: 15%;
  animation: firework-loop 6s ease-out infinite 4.6s;
}
.firework-13 {
  top: 20%;
  right: 45%;
  animation: firework-loop 6s ease-out infinite 5s;
}
.firework-14 {
  top: 30%;
  right: 55%;
  animation: firework-loop 6s ease-out infinite 5.4s;
}
.firework-15 {
  top: 40%;
  right: 65%;
  animation: firework-loop 6s ease-out infinite 5.8s;
}
.firework-16 {
  top: 50%;
  right: 75%;
  animation: firework-loop 6s ease-out infinite 3.2s;
}
.firework-17 {
  top: 12%;
  left: 25%;
  animation: firework-loop 6s ease-out infinite 3.2s;
}
.firework-18 {
  top: 22%;
  left: 35%;
  animation: firework-loop 6s ease-out infinite 4.8s;
}
.firework-19 {
  top: 32%;
  left: 45%;
  animation: firework-loop 6s ease-out infinite 3.2s;
}
.firework-20 {
  top: 42%;
  left: 55%;
  animation: firework-loop 6s ease-out infinite 1s;
}
.firework-21 {
  top: 18%;
  left: 70%;
  animation: firework-loop 6s ease-out infinite 4.8s;
}
.firework-22 {
  top: 28%;
  left: 80%;
  animation: firework-loop 6s ease-out infinite 5.6s;
}
.firework-23 {
  top: 38%;
  left: 5%;
  animation: firework-loop 6s ease-out infinite 3.2s;
}
.firework-24 {
  top: 48%;
  left: 25%;
  animation: firework-loop 6s ease-out infinite 3.6s;
}
.firework-25 {
  top: 16%;
  right: 25%;
  animation: firework-loop 6s ease-out infinite 2s;
}
.firework-26 {
  top: 26%;
  right: 35%;
  animation: firework-loop 6s ease-out infinite 4.4s;
}
.firework-27 {
  top: 36%;
  right: 45%;
  animation: firework-loop 6s ease-out infinite 4.8s;
}
.firework-28 {
  top: 46%;
  right: 55%;
  animation: firework-loop 6s ease-out infinite 5.2s;
}
.firework-29 {
  top: 19%;
  right: 70%;
  animation: firework-loop 6s ease-out infinite 5.6s;
}
.firework-30 {
  top: 29%;
  right: 80%;
  animation: firework-loop 6s ease-out infinite 0.3s;
}
.firework-31 {
  top: 39%;
  right: 5%;
  animation: firework-loop 6s ease-out infinite 0.7s;
}
.firework-32 {
  top: 49%;
  right: 25%;
  animation: firework-loop 6s ease-out infinite 1.1s;
}
.firework-33 {
  top: 14%;
  left: 40%;
  animation: firework-loop 6s ease-out infinite 1.5s;
}
.firework-34 {
  top: 24%;
  left: 60%;
  animation: firework-loop 6s ease-out infinite 1.9s;
}
.firework-35 {
  top: 34%;
  left: 50%;
  animation: firework-loop 6s ease-out infinite 2.3s;
}
.firework-36 {
  top: 44%;
  left: 35%;
  animation: firework-loop 6s ease-out infinite 2.7s;
}
.firework-37 {
  top: 17%;
  right: 40%;
  animation: firework-loop 6s ease-out infinite 3.1s;
}
.firework-38 {
  top: 27%;
  right: 60%;
  animation: firework-loop 6s ease-out infinite 3.5s;
}
.firework-39 {
  top: 37%;
  right: 50%;
  animation: firework-loop 6s ease-out infinite 3.9s;
}
.firework-40 {
  top: 47%;
  right: 35%;
  animation: firework-loop 6s ease-out infinite 4.3s;
}

.spark {
  position: absolute;
  width: 3px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: spark-burst-loop 12s ease-out infinite;
  animation-delay: inherit;
}

.spark.small {
  width: 2px;
  height: 5px;
  animation: spark-burst-small-loop 14s ease-out infinite;
  animation-delay: inherit;
}

.spark.large {
  width: 3px;
  height: 7px;
  animation: spark-burst-large-loop 16s ease-out infinite;
  animation-delay: inherit;
}

.spark.xlarge {
  width: 4px;
  height: 8px;
  animation: spark-burst-xlarge-loop 20s ease-out infinite;
  animation-delay: inherit;
}

/* 12방향으로 터지는 스파크 (30도씩) - 기본 크기 */
.spark-1 {
  background: #f59e0b;
  animation-delay: inherit;
  --spark-x: 26px;
  --spark-y: 0px;
}

.spark-2 {
  background: #ef4444;
  animation-delay: inherit;
  --spark-x: 22px;
  --spark-y: -13px;
}

.spark-3 {
  background: #10b981;
  animation-delay: inherit;
  --spark-x: 13px;
  --spark-y: -22px;
}

.spark-4 {
  background: #3b82f6;
  animation-delay: inherit;
  --spark-x: 0px;
  --spark-y: -26px;
}

.spark-5 {
  background: #8b5cf6;
  animation-delay: inherit;
  --spark-x: -13px;
  --spark-y: -22px;
}

.spark-6 {
  background: #f97316;
  animation-delay: inherit;
  --spark-x: -22px;
  --spark-y: -13px;
}

.spark-7 {
  background: #06b6d4;
  animation-delay: inherit;
  --spark-x: -26px;
  --spark-y: 0px;
}

.spark-8 {
  background: #ec4899;
  animation-delay: inherit;
  --spark-x: -22px;
  --spark-y: 13px;
}

.spark-9 {
  background: #fbbf24;
  animation-delay: inherit;
  --spark-x: -13px;
  --spark-y: 22px;
}

.spark-10 {
  background: #f87171;
  animation-delay: inherit;
  --spark-x: 0px;
  --spark-y: 26px;
}

.spark-11 {
  background: #34d399;
  animation-delay: inherit;
  --spark-x: 13px;
  --spark-y: 22px;
}

.spark-12 {
  background: #60a5fa;
  animation-delay: inherit;
  --spark-x: 22px;
  --spark-y: 13px;
}

/* 크기별 스파크 오버라이드 */
.spark.large.spark-1 {
  --spark-x: 32px;
  --spark-y: 0px;
}
.spark.large.spark-2 {
  --spark-x: 19px;
  --spark-y: -16px;
}
.spark.large.spark-3 {
  --spark-x: 16px;
  --spark-y: -19px;
}
.spark.large.spark-4 {
  --spark-x: 0px;
  --spark-y: -32px;
}
.spark.large.spark-5 {
  --spark-x: -16px;
  --spark-y: -19px;
}
.spark.large.spark-6 {
  --spark-x: -19px;
  --spark-y: -16px;
}
.spark.large.spark-7 {
  --spark-x: -32px;
  --spark-y: 0px;
}
.spark.large.spark-8 {
  --spark-x: -19px;
  --spark-y: 16px;
}
.spark.large.spark-9 {
  --spark-x: -16px;
  --spark-y: 19px;
}
.spark.large.spark-10 {
  --spark-x: 0px;
  --spark-y: 32px;
}
.spark.large.spark-11 {
  --spark-x: 16px;
  --spark-y: 19px;
}
.spark.large.spark-12 {
  --spark-x: 19px;
  --spark-y: 16px;
}

.spark.xlarge.spark-1 {
  --spark-x: 38px;
  --spark-y: 0px;
}
.spark.xlarge.spark-2 {
  --spark-x: 33px;
  --spark-y: -19px;
}
.spark.xlarge.spark-3 {
  --spark-x: 19px;
  --spark-y: -33px;
}
.spark.xlarge.spark-4 {
  --spark-x: 0px;
  --spark-y: -38px;
}
.spark.xlarge.spark-5 {
  --spark-x: -19px;
  --spark-y: -33px;
}
.spark.xlarge.spark-6 {
  --spark-x: -33px;
  --spark-y: -19px;
}
.spark.xlarge.spark-7 {
  --spark-x: -38px;
  --spark-y: 0px;
}
.spark.xlarge.spark-8 {
  --spark-x: -33px;
  --spark-y: 19px;
}
.spark.xlarge.spark-9 {
  --spark-x: -19px;
  --spark-y: 33px;
}
.spark.xlarge.spark-10 {
  --spark-x: 0px;
  --spark-y: 38px;
}
.spark.xlarge.spark-11 {
  --spark-x: 19px;
  --spark-y: 33px;
}
.spark.xlarge.spark-12 {
  --spark-x: 33px;
  --spark-y: 19px;
}

@keyframes firework-explosion {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  10% {
    opacity: 1;
    transform: scale(0.5);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes firework-loop {
  0%,
  30% {
    opacity: 0;
    transform: scale(0);
  }
  35% {
    opacity: 1;
    transform: scale(0.3);
  }
  40% {
    opacity: 1;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  60% {
    opacity: 0.5;
    transform: scale(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(1.5);
  }
}

@keyframes spark-burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(var(--spark-x), var(--spark-y)) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--spark-x) * 1.5), calc(var(--spark-y) * 1.5)) scale(0.3);
  }
}

@keyframes spark-burst-loop {
  0%,
  40% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  42% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.1), calc(var(--spark-y) * 0.1)) scale(1.2);
  }
  45% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.3), calc(var(--spark-y) * 0.3)) scale(1.1);
  }
  50% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.6), calc(var(--spark-y) * 0.6)) scale(1.0);
  }
  55% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.8), calc(var(--spark-y) * 0.8)) scale(0.9);
  }
  60% {
    opacity: 1;
    transform: translate(var(--spark-x), var(--spark-y)) scale(0.8);
  }
  70% {
    opacity: 0.7;
    transform: translate(calc(var(--spark-x) * 1.2), calc(var(--spark-y) * 1.2)) scale(0.6);
  }
  80% {
    opacity: 0.4;
    transform: translate(calc(var(--spark-x) * 1.5), calc(var(--spark-y) * 1.5)) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--spark-x) * 2), calc(var(--spark-y) * 2)) scale(0.2);
  }
}

@keyframes spark-burst-small {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.7), calc(var(--spark-y) * 0.7)) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--spark-x), var(--spark-y)) scale(0.2);
  }
}

@keyframes spark-burst-small-loop {
  0%,
  42% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  44% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.08), calc(var(--spark-y) * 0.08)) scale(1.1);
  }
  48% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.2), calc(var(--spark-y) * 0.2)) scale(1.0);
  }
  52% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.4), calc(var(--spark-y) * 0.4)) scale(0.9);
  }
  58% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.6), calc(var(--spark-y) * 0.6)) scale(0.8);
  }
  65% {
    opacity: 0.8;
    transform: translate(calc(var(--spark-x) * 0.8), calc(var(--spark-y) * 0.8)) scale(0.6);
  }
  75% {
    opacity: 0.5;
    transform: translate(calc(var(--spark-x) * 1.0), calc(var(--spark-y) * 1.0)) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--spark-x) * 1.3), calc(var(--spark-y) * 1.3)) scale(0.2);
  }
}

@keyframes spark-burst-large-loop {
  0%,
  38% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  40% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.08), calc(var(--spark-y) * 0.08)) scale(1.3);
  }
  43% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.2), calc(var(--spark-y) * 0.2)) scale(1.2);
  }
  47% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.4), calc(var(--spark-y) * 0.4)) scale(1.1);
  }
  52% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.65), calc(var(--spark-y) * 0.65)) scale(1.0);
  }
  58% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.85), calc(var(--spark-y) * 0.85)) scale(0.9);
  }
  65% {
    opacity: 1;
    transform: translate(var(--spark-x), var(--spark-y)) scale(0.8);
  }
  72% {
    opacity: 0.8;
    transform: translate(calc(var(--spark-x) * 1.15), calc(var(--spark-y) * 1.15)) scale(0.7);
  }
  80% {
    opacity: 0.5;
    transform: translate(calc(var(--spark-x) * 1.35), calc(var(--spark-y) * 1.35)) scale(0.5);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--spark-x) * 1.8), calc(var(--spark-y) * 1.8)) scale(0.3);
  }
}

@keyframes spark-burst-xlarge-loop {
  0%,
  35% {
    opacity: 0;
    transform: translate(0, 0) scale(1);
  }
  37% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.05), calc(var(--spark-y) * 0.05)) scale(1.4);
  }
  40% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.15), calc(var(--spark-y) * 0.15)) scale(1.3);
  }
  44% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.3), calc(var(--spark-y) * 0.3)) scale(1.2);
  }
  48% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.5), calc(var(--spark-y) * 0.5)) scale(1.1);
  }
  53% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.7), calc(var(--spark-y) * 0.7)) scale(1.0);
  }
  58% {
    opacity: 1;
    transform: translate(calc(var(--spark-x) * 0.9), calc(var(--spark-y) * 0.9)) scale(0.9);
  }
  64% {
    opacity: 1;
    transform: translate(var(--spark-x), var(--spark-y)) scale(0.8);
  }
  70% {
    opacity: 0.9;
    transform: translate(calc(var(--spark-x) * 1.1), calc(var(--spark-y) * 1.1)) scale(0.7);
  }
  78% {
    opacity: 0.6;
    transform: translate(calc(var(--spark-x) * 1.3), calc(var(--spark-y) * 1.3)) scale(0.6);
  }
  85% {
    opacity: 0.3;
    transform: translate(calc(var(--spark-x) * 1.6), calc(var(--spark-y) * 1.6)) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--spark-x) * 2.2), calc(var(--spark-y) * 2.2)) scale(0.2);
  }
}
</style>
