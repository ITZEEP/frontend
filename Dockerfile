# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 인자
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_KAKAO_JAVASCRIPT_KEY

# 환경 변수 설정
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_KAKAO_JAVASCRIPT_KEY=$VITE_KAKAO_JAVASCRIPT_KEY

# 애플리케이션 빌드
RUN npm run build

# Production stage - 정적 파일 서빙용 간단한 서버
FROM node:20-alpine

WORKDIR /app

# serve 패키지 설치
RUN npm install -g serve

# 빌드된 파일 복사
COPY --from=builder /app/dist /app/dist

# 포트 노출 (3000번 포트 사용)
EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# serve로 정적 파일 서빙
CMD ["serve", "-s", "dist", "-l", "3000"]