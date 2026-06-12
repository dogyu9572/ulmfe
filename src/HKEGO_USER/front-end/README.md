# HKEGO_USER Front-end

Next.js 16.2.7 기반 사용자 포털 프론트엔드입니다.

## 개발 실행

백엔드(HKEGO_USER, 9014) 실행 후:

```bash
npm install
npm run dev
```

- 프론트: http://localhost:3014
- API 프록시: `/api/*` → `http://127.0.0.1:9014`

## 운영 빌드

```bash
npm run build
```

정적 파일은 `out/`에 생성되며, Maven 빌드 시 Spring Boot `static/`으로 복사됩니다.
