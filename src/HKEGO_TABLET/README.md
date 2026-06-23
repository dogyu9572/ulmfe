# HKEGO_TABLET

울산광역시미래교육관 학습지원시스템 태블릿 웹앱 소스 영역이다.

- 화면: `front-end`의 Vite + React 앱
- 개발 포트: `127.0.0.1:9133`
- 외부 호스트 예정: `ulmfe-tablet.hk-test.co.kr`
- API 기본 프록시: `http://127.0.0.1:9032`
- 공통 리소스: `front-end/public/pub`

Android 앱은 별도 Kotlin WebView 껍데기에서 이 태블릿 웹앱 URL을 로드하는 구조를 기준으로 한다.
