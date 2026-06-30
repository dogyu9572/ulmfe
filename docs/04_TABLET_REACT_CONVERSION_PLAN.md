# ULMFE 태블릿 React 컨버팅 계획 및 진행 현황

## 1. 목적

`docs/ulsan_mfec` 퍼블리싱 원본을 기준으로 `src/HKEGO_TABLET/front-end` 태블릿 웹앱을 React로 단계적으로 전환한다.

이 문서는 작업자가 매 단계마다 확인하는 기준 문서다. 작업 계획, 진행 현황, 화면별 체크리스트, 검수 상태를 이 문서에 계속 갱신한다.

## 2. 절대 원칙

- `docs/ulsan_mfec`는 퍼블리싱 기준 원본이다. 수정하지 않는다.
- 원본의 문구, 태그 구조, class, 이미지 경로, 버튼 위치, 레이아웃은 임의 변경하지 않는다.
- 글자 하나라도 변경이 필요하면 변경 사유를 먼저 기록하고 사용자 확인을 받는다.
- React 전환 중 변경 가능한 영역은 관리자/API/DB 연동으로 동적 처리될 영역뿐이다.
- 동적 처리 대상은 관리자 기획, API, DB 출처를 먼저 분석한 뒤 필요한 범위만 분리한다.
- mock data는 독립 선행 작업으로 진행하지 않고, 실제 API 응답 구조가 정리된 화면부터 부분 적용한다.
- 한 번에 전체 화면을 전환하지 않는다. 공통 컴포넌트와 화면 묶음 단위로 전환하고 사용자 검수 후 다음 단계로 넘어간다.
- 각 단계는 `계획 -> 구현 -> 빌드/도메인 확인 -> 사용자 검수 -> OK 후 다음 단계` 순서로 진행한다.
- DB 스키마, 실제 데이터, 인증/권한, 서버 설정 변경은 별도 확인 후 진행한다.

## 3. 현재 상태

### 현재 구현

- `src/HKEGO_TABLET/front-end`는 Vite + React 앱이다.
- `public/pub`에는 원본 퍼블리싱 정적 자산이 들어 있다.
- `public/publishing` 원본 HTML 복사본은 제거했다.
- 현재 `main.tsx`는 TSX로 변환되지 않은 라우트에 `React 컨버팅 대기 화면입니다.` 오류 안내를 띄운다.

### 현재 상태 판단

- 현재 방식은 미전환 화면이 퍼블리싱 HTML로 보이지 않도록 막아 둔 상태다.
- 최종 목표는 각 화면을 TSX 컴포넌트로 변환하고, 변환 완료된 화면만 라우트에 등록하는 것이다.
- `public/publishing` 의존은 제거했다.
- 미전환 계획 라우트는 `React 컨버팅 대기 화면입니다.` 안내를 표시하고, 계획에 없는 라우트는 `등록되지 않은 태블릿 화면입니다.` 안내를 표시한다.
- `public/pub`는 이미지, 폰트, 영상, PDF 같은 정적 자산 저장소로 유지할 수 있다.

### 즉시 정리할 이슈

- `student/attendance`의 원본 선택 기능을 정확히 복구해야 한다.
  - 0명 선택: `선택해주세요.` alert 1번
  - 1명 선택: `/student/mission_welcome`
  - 2명 이상 선택: `/student/welcome`
- React 이벤트와 원본 inline `onclick`이 중복 실행되지 않게 처리해야 한다.

## 4. 최종 목표 구조

```text
src/HKEGO_TABLET/front-end
├── public
│   └── pub                 # 원본 이미지, 폰트, 영상, PDF 등 정적 자산
└── src
    ├── main.tsx            # 라우터 진입점
    ├── routes.tsx          # 화면 라우트 정의
    ├── components
    │   ├── AttendanceHeader.tsx
    │   ├── StudentCaseHeader.tsx
    │   ├── StudentMissionHeader.tsx
    │   ├── TeacherHeader.tsx
    │   └── TabletPopup.tsx
    ├── pages
    │   ├── LoginPage.tsx
    │   ├── SelectUserPage.tsx
    │   ├── student
    │   └── teacher
    ├── data                 # API 응답 구조 확정 후 필요한 경우 추가
    └── utils
        └── tabletNavigation.ts
```

## 5. 공통 컨버팅 규칙

### HTML -> TSX

- 원본 HTML의 DOM 계층을 최대한 그대로 유지한다.
- `class`는 `className`으로만 변환한다.
- `for`는 `htmlFor`로만 변환한다.
- `onclick`, inline script는 React 이벤트와 hook으로 기능만 동일하게 이전한다.
- 원본 텍스트는 변경하지 않는다.
- 원본 이미지 경로 `/pub/images/...`는 유지한다.
- 원본 링크가 내부 화면 이동이면 React Router로 연결한다.
- 외부 링크, PDF 다운로드, 영상 링크는 원본 동작을 유지한다.

### 공통 include 변환

아래 원본 include는 공통 컴포넌트로 변환한다.

| 원본 include | React 컴포넌트 |
| --- | --- |
| `pub/inc/header_attendance.html` | `AttendanceHeader` |
| `pub/inc/header_student_case.html` | `StudentCaseHeader` |
| `pub/inc/header_student_mission.html` | `StudentMissionHeader` |
| `pub/inc/header_teacher.html` | `TeacherHeader` |

### 동적 데이터 처리

1차 컨버팅에서는 원본의 하드코딩 값을 그대로 둔다.

2차 준비 단계에서는 바로 mock data로 분리하지 않고, 아래 값의 관리자/API/DB 출처를 먼저 분석한다.

- 학교명, 학년/반, 인원
- 예약일시
- 교육 프로그램명
- 학생 목록, 출석 상태
- 팀 목록, 팀원, 나의 팀
- 활동 순서, 진행률
- 스탬프, 스티커
- 자료실 목록
- 교사 모니터링/호출/메시지 데이터

3차 관리자/API 연동 단계에서 실제 API 응답 구조가 정리된 화면부터 필요한 범위만 mock data 또는 API client로 분리한다.

상세 분석 및 연동 계획은 `docs/05_TABLET_ADMIN_API_INTEGRATION_PLAN.md`에서 관리한다.

## 6. 단계별 진행 계획

### 0단계. 현재 브릿지 안정화

- [x] `student/attendance` 선택 기능을 원본과 동일하게 수정
- [x] 45개 화면 임시 라우팅 유지
- [x] `npm run build` 통과
- [x] `https://ulmfe-tablet.hk-test.co.kr/student/attendance` 확인
- [x] 사용자 검수 OK

### 1단계. 공통 컴포넌트 변환

- [x] `AttendanceHeader` 변환
- [x] `StudentCaseHeader` 변환
- [x] `StudentMissionHeader` 변환
- [x] `TeacherHeader` 변환
- [x] 공통 popup 동작 변환
- [x] 메뉴 접기/펼치기 동작 변환
- [x] 원본 include와 React 렌더링 비교
- [x] `npm run build` 통과
- [ ] 사용자 검수 OK

### 2단계. 학생 진입 흐름 변환

- [x] `/` 로그인 화면
- [x] `/select-user` 사용자 선택 화면
- [x] `/student/attendance` 번호 선택 화면
- [x] `/student/welcome` 참석 환영 화면
- [x] `/student/about` 사건탐구 안내 화면
- [x] 내부 이동 경로 확인
- [x] 원본 문구/class/DOM 비교
- [x] `npm run build` 통과
- [x] 도메인 확인
- [x] 사용자 검수 OK

### 3단계. 학생 사건탐구 흐름 변환

- [x] `/student/quest00`
- [x] `/student/quest01`
- [x] `/student/quest01_2`
- [x] `/student/quest01_3`
- [x] `/student/quest01_end`
- [x] `/student/quest02`
- [x] `/student/quest02_2`
- [x] `/student/quest02_3`
- [x] `/student/quest02_end`
- [x] `/student/quest03`
- [x] `/student/quest03_2`
- [x] `/student/quest03_end`
- [x] `/student/quest04`
- [x] `/student/quest04_2`
- [x] `/student/quest04_end`
- [x] `/student/quest05`
- [x] `/student/quest_end`
- [x] `/student/quest_video`
- [x] `/student/resource_center`
- [ ] 사용자 검수 OK

### 4단계. 학생 미션 흐름 변환

- [x] `/student/mission_welcome`
- [x] `/student/mission_about`
- [x] `/student/mission01`
- [x] `/student/mission02`
- [x] `/student/mission03`
- [x] `/student/mission03_end`
- [x] `/student/mission04`
- [x] `/student/mission04_end`
- [x] `/student/mission05`
- [x] `/student/mission05_end`
- [x] `/student/mission06`
- [x] `/student/mission06_end`
- [x] `/student/mission_end`
- [x] `/student/mission_resource_center`
- [x] 미션 화면별 TSX 파일 분리
- [x] 미션 공통 UI/데이터 `missionShared.tsx` 분리
- [ ] 사용자 검수 OK

### 5단계. 교사용 화면 변환

- [x] `/teacher/attendance`
- [x] `/teacher/monitoring`
- [x] `/teacher/real_time_location`
- [x] `/teacher/message_sending`
- [x] `/teacher/call_history`
- [x] `/teacher/session_management`
- [x] `/teacher/resource_center`
- [x] 교사 화면별 TSX 파일 분리
- [x] 교사 공통 UI/자료 `teacherShared.tsx` 분리
- [x] 내부 이동 경로 확인
- [x] `npm run build` 통과
- [x] 도메인 확인
- [ ] 사용자 검수 OK

### 6단계. 관리자/API 연동 대상 분석

- [ ] 태블릿 기획 의도와 관리자 기획 의도 연결 정리
- [ ] 화면별 동적 데이터 후보 목록화
- [ ] 현재 관리자 메뉴/API/DB 재사용 가능성 확인
- [ ] 신규 관리자 기능/API/DB 필요 여부 정리
- [ ] 공통 기반 데이터와 페이지별 데이터를 분리해서 정리
- [ ] mock data 필요 범위와 적용 시점 정리
- [ ] 사용자 검수 OK

### 7단계. 페이지별 관리자/API/DB 연동

- [ ] 공통 세션/로그인/태블릿 관리번호 연동
- [ ] 출석/학생/팀 정보 연동
- [ ] 학생 사건탐구 흐름 페이지별 연동
- [ ] 학생 미션 흐름 페이지별 연동
- [ ] 교사 출석/모니터링 연동
- [ ] 교사 실시간 위치/메시지/호출 연동
- [ ] 자료실 연동
- [ ] 인터페이스정의서, 테이블정의서, 프로그램정의서 갱신 대상 기록
- [ ] 각 페이지별 사용자 검수 후 다음 화면 진행

## 7. 화면별 작업 체크리스트 양식

각 화면을 시작할 때 아래 양식을 복사해서 진행 현황에 추가한다.

```md
### 화면: /student/attendance

- 원본: `docs/ulsan_mfec/student/attendance.html`
- React 대상: `src/HKEGO_TABLET/front-end/src/pages/student/StudentAttendancePage.tsx`
- 사용자 유형: 패드 학생용
- 상태: 대기 / 진행중 / 검수대기 / 검수OK

#### 컨버팅 체크
- [ ] 원본 HTML 확인
- [ ] 원본 inline script 확인
- [ ] JSX 변환
- [ ] 공통 컴포넌트 연결
- [ ] 원본 문구 유지 확인
- [ ] 원본 class 유지 확인
- [ ] 원본 DOM 구조 비교
- [ ] 내부 라우팅 연결
- [ ] 동적 데이터 후보 표시
- [ ] `npm run build` 통과
- [ ] 도메인 확인
- [ ] 사용자 검수 OK

#### 동적 데이터 후보
- 학교명:
- 학년/반:
- 인원:
- 예약일시:
- 교육 프로그램명:
- 학생 목록:

#### 메모
- 
```

## 8. 현재 진행 현황

| 단계 | 상태 | 메모 |
| --- | --- | --- |
| 0단계. 브릿지 안정화 | 검수OK | 전체 45개 화면은 임시 라우팅됨. `student/attendance` 선택 로직은 원본 기준으로 복구 |
| 1단계. 공통 컴포넌트 | 진행중 | include 4종 TSX 파일 생성 완료. `public/publishing` 제거로 실제 화면 검수는 2단계 페이지 연결 후 진행 |
| 2단계. 학생 진입 흐름 | 검수OK | 로그인, 사용자 선택, 출석, welcome, about TSX 변환 및 라우트 연결 완료 |
| 3단계. 사건탐구 | 진행중 | `quest00` ~ `quest01_end` TSX 변환 및 라우트 연결 완료. 사용자 검수 필요 |
| 4단계. 미션 | 대기 | 학생 mission 흐름 |
| 5단계. 교사용 | 대기 | teacher 화면 |
| 6단계. mock data | 대기 | API 연동 전 데이터 분리 |
| 7단계. 관리자/API/DB | 대기 | 사용자 확인 후 진행 |

## 9. 검수 원칙

- 사용자 검수 OK 전에는 다음 단계로 넘어가지 않는다.
- 화면 검수 시 원본 퍼블리싱과 다른 부분이 있으면 먼저 원인과 변경 필요 여부를 기록한다.
- API 연동 때문에 값이 바뀌는 경우에는 해당 영역을 동적 데이터 후보로 표시한다.
- 디자인 차이가 발생하면 CSS를 새로 덮어쓰기보다 원본 class/DOM 유지 여부를 먼저 확인한다.

## 10. 산출물 영향

React 컨버팅 자체는 화면/프로그램 산출물 갱신 대상이다.

API 또는 DB 연동이 시작되면 아래 산출물 갱신 여부를 함께 확인한다.

- 프로그램정의서
- 메뉴구성도 또는 화면 목록
- 요구사항추적표
- 인터페이스정의서
- 테이블목록및정의서
- DB표준사전
- 단위테스트/통합테스트 시나리오
