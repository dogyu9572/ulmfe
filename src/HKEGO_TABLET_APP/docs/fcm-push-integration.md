# ULMFE 태블릿 FCM 연동 규격

## 범위와 전제

- Android 앱 패키지: `kr.co.ulmfe.tablet`
- 태블릿 웹 원본: `https://ulmfe-tablet.hk-test.co.kr`
- 기존 호출/메시지 DB 저장과 10초 폴링은 유지한다.
- 이 문서는 아직 Android 앱 저장소에 없는 서버 API와 React의 JavaScript Interface 호출 계약을 정의한다.
- 서비스 계정 JSON, 서버 키, 비공개 키는 Android 앱이나 Git 저장소에 넣지 않는다.

## Firebase Android 설정

1. Firebase Console에서 대상 프로젝트를 만들거나 선택한다.
2. Android 앱을 추가하고 패키지명을 `kr.co.ulmfe.tablet`로 입력한다.
3. `google-services.json`을 내려받는다.
4. 파일명을 바꾸지 않고 `src/HKEGO_TABLET_APP/app/google-services.json`에 둔다.
5. 이 파일은 `.gitignore` 대상이므로 저장소에는 커밋되지 않는다.
6. Gradle Sync 후 앱을 다시 설치한다.

설정 파일이 없을 때도 개발 빌드가 가능하도록 Google Services 플러그인은 조건부 적용된다. 파일이 없으면 FCM 토큰 발급과 실제 수신만 비활성화된다.

## WebView JavaScript Interface

역할, 예약, 학생 선택이 확정될 때 웹에서 호출한다.

```javascript
window.AndroidPush?.registerContext(JSON.stringify({
  role: 'STUDENT',
  rsvtSn: 1,
  studentSns: [1, 2]
}));
```

선생님 모드:

```javascript
window.AndroidPush?.registerContext(JSON.stringify({
  role: 'TEACHER',
  rsvtSn: 1,
  studentSns: []
}));
```

로그아웃, 예약 종료 또는 기기 연결 해제:

```javascript
window.AndroidPush?.unregisterContext();
```

설치 단위 식별자가 필요하면 다음 값을 조회할 수 있다.

```javascript
const deviceId = window.AndroidPush?.getDeviceId();
```

- 예약이 변경되면 새 `rsvtSn`으로 `registerContext`를 다시 호출한다.
- 학생 선택이 변경되면 전체 `studentSns` 목록을 다시 전달한다.
- 외부 사이트는 WebView에서 열리지 않으므로 인터페이스는 ULMFE 내부 화면에서만 사용한다.

## 기기 등록 API

Android 구현이 호출하도록 잡은 제안 경로는 다음과 같다.

```http
PUT /api/tablet/push/devices/{deviceId}
Content-Type: application/json
Cookie: 기존 WebView 로그인 세션 쿠키
```

요청:

```json
{
  "deviceId": "설치 단위 UUID",
  "fcmToken": "FCM registration token",
  "role": "STUDENT",
  "rsvtSn": 1,
  "studentSns": [1, 2],
  "active": true,
  "clientUpdatedAtEpochMs": 1784000000000
}
```

응답:

```json
{
  "success": true,
  "deviceId": "설치 단위 UUID",
  "serverUpdatedAt": "2026-07-14T14:00:00+09:00"
}
```

- 같은 `deviceId`이면 토큰, 역할, 예약, 학생 연결을 덮어쓴다.
- 같은 FCM 토큰이 다른 `deviceId`에 등록되면 최신 등록만 활성화하는 정책을 권장한다.
- `active: false` 요청은 로그아웃/예약 종료로 보고 기존 연결을 비활성화한다.
- 서버는 기존 세션으로 사용자를 확인하고 전달된 역할/예약/학생이 실제 권한 범위인지 검증해야 한다.
- CSRF 정책이 적용된 서버라면 이 네이티브 API에 맞는 별도 CSRF 헤더 또는 앱 세션 교환 규격을 추가해야 한다.

## DB 구조 제안

실제 물리명은 ULMFE DB 명명 규칙과 공공데이터 표준용어 검토 후 확정한다.

### EDU_PUSH_DVC

| 컬럼 | 설명 |
|---|---|
| DEVICE_ID | 앱 설치 단위 UUID, PK |
| FCM_TOKEN | 현재 FCM 토큰, 충분한 길이의 문자열 |
| ROLE_CD | `TEACHER` 또는 `STUDENT` |
| RSVT_SN | 현재 예약 번호 |
| ACTV_YN | 활성 여부 |
| LAST_UPDT_DT | 토큰/컨텍스트 마지막 갱신 시각 |
| REG_DT | 최초 등록 시각 |

### EDU_PUSH_DVC_STDNT

| 컬럼 | 설명 |
|---|---|
| DEVICE_ID | PUSH_DEVICE FK |
| STUDENT_SN | 선택 학생 번호 |

`DVC_ID + STDNT_SN`을 복합 PK로 두고 학생 선택이 갱신될 때 전체 교체한다.

## 발송 대상 결정

### 학생 → 선생님 호출

1. 기존 호출 내역을 DB에 저장하고 트랜잭션을 완료한다.
2. 같은 `RSVT_SN`, `ROLE_CD=TEACHER`, `ACTV_YN=Y`인 기기 토큰을 조회한다.
3. 각 토큰으로 `TEACHER_CALL` data 메시지를 보낸다.
4. HTTP v1 응답이 `UNREGISTERED`이면 해당 토큰을 비활성화한다.

### 선생님 → 학생 메시지

1. 기존 메시지를 DB에 저장하고 트랜잭션을 완료한다.
2. 같은 `RSVT_SN`, `ROLE_CD=STUDENT`, `ACTV_YN=Y` 조건에 학생/팀 대상 조건을 추가한다.
3. 대상 기기별 중복 토큰을 제거한 뒤 `TEACHER_MESSAGE` data 메시지를 보낸다.
4. HTTP v1 응답이 `UNREGISTERED`이면 해당 토큰을 비활성화한다.

## FCM payload

모든 `data` 값은 문자열이어야 한다. 포그라운드와 백그라운드에서 동일하게 `FirebaseMessagingService`가 처리하도록 `notification` 블록 없이 data-only, Android HIGH priority로 발송한다.

학생 호출:

```json
{
  "message": {
    "token": "TARGET_FCM_TOKEN",
    "data": {
      "type": "TEACHER_CALL",
      "rsvtSn": "1",
      "callSn": "100",
      "title": "선생님 호출",
      "body": "A팀 학생들이 사회존에서 선생님을 호출했습니다.",
      "path": "/teacher/call_history"
    },
    "android": {
      "priority": "HIGH",
      "ttl": "86400s"
    }
  }
}
```

선생님 메시지:

```json
{
  "message": {
    "token": "TARGET_FCM_TOKEN",
    "data": {
      "type": "TEACHER_MESSAGE",
      "rsvtSn": "1",
      "msgSn": "200",
      "title": "선생님 메시지",
      "body": "다음 존으로 이동해주세요.",
      "path": ""
    },
    "android": {
      "priority": "HIGH",
      "ttl": "86400s"
    }
  }
}
```

알림 선택 시 Android 앱은 `type`, `path`, `callSn` 또는 `msgSn`을 PendingIntent에 전달한다. 호출은 `/teacher/call_history`를 열고, 메시지는 현재 WebView를 다시 조회해 기존 메시지 팝업/폴링 흐름을 사용한다.

## 서버의 FCM HTTP v1 설정

1. Firebase/Google Cloud 프로젝트에서 Firebase Cloud Messaging API를 활성화한다.
2. Firebase Console의 프로젝트 설정 > 서비스 계정에서 서버용 서비스 계정을 준비한다.
3. Google Cloud 환경이면 Application Default Credentials 또는 Workload Identity를 우선 사용한다.
4. 온프레미스 서버라면 서비스 계정 JSON을 서버의 Git 외부 보안 경로에 저장한다.
5. `GOOGLE_APPLICATION_CREDENTIALS` 환경변수로 파일 경로를 전달한다.
6. Java 서버는 Google Auth Library 또는 Firebase Admin SDK로 짧은 수명의 OAuth 2.0 토큰을 발급받는다.
7. 다음 엔드포인트로 보낸다.

```text
POST https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send
Authorization: Bearer {SHORT_LIVED_OAUTH_TOKEN}
Content-Type: application/json
```

서비스 계정 JSON이나 OAuth 토큰을 Android 앱, React 코드, DB 또는 Git에 저장하면 안 된다.

## 미구현 TODO

- [ ] Firebase 프로젝트에 `kr.co.ulmfe.tablet` 앱 등록
- [ ] 실제 `google-services.json`을 각 개발/배포 환경에 안전하게 배치
- [x] 서버의 기기 등록 API 구현 및 URL 확정
- [x] 기존 세션 쿠키와 XSRF 헤더를 이용한 인증 방식 적용
- [x] 기기/학생 연결 테이블 구현 (`EDU_PUSH_DVC`, `EDU_PUSH_DVC_STDNT`)
- [x] 호출 저장 트랜잭션 이후 FCM 발송 연결
- [x] 메시지 저장 트랜잭션 이후 대상 토큰 조회와 FCM 발송 연결
- [x] React 역할/예약/학생 선택 완료 시 `AndroidPush.registerContext` 호출
- [x] 인증 만료 시 `AndroidPush.unregisterContext` 호출
- [ ] 명시적 로그아웃/예약 종료 화면에서 `AndroidPush.unregisterContext` 호출
- [ ] 실제 태블릿 절전·화면 꺼짐·전원 재연결 테스트
