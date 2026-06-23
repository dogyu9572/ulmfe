# HKEGO_TABLET_APP

울산광역시미래교육관 학습지원시스템 Android WebView 앱 껍데기 프로젝트다.

## 역할

- `https://ulmfe-tablet.hk-test.co.kr/` 태블릿 웹앱을 Android WebView로 표시한다.
- 앱 아이콘, 스플래시, 푸시 알림, 태블릿 관리번호 같은 Android 전용 기능은 이 프로젝트에서 처리한다.
- 실제 학습 화면 개발은 `src/HKEGO_TABLET/front-end`에서 진행한다.

## Android Studio

Android Studio에서 아래 폴더를 연다.

```text
/home/ulmfe/src/HKEGO_TABLET_APP
```

처음 열면 Gradle sync를 실행한다. Android SDK/Gradle 다운로드는 개발 PC의 Android Studio가 처리한다.

## 현재 기본값

- 패키지명: `kr.co.ulmfe.tablet`
- 앱 이름: `울산미래교육관 학습지원`
- 시작 URL: `https://ulmfe-tablet.hk-test.co.kr/`
- 최소 SDK: 24
- Target SDK: 35

## 나중에 추가할 것

- FCM 푸시: Firebase 프로젝트 생성 후 `google-services.json`을 `app/` 아래에 배치하고 Gradle 플러그인/서비스를 추가한다.
- 앱 아이콘/스플래시: 기관 최종 이미지 확정 후 `res` 리소스로 추가한다.
- 내부 배포 서명키: 실제 keystore는 git에 넣지 않는다.
