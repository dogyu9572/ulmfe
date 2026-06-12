# Java Web Project Codex Rules

이 문서는 Java/Spring 기반 웹 프로젝트에서 Codex가 작업할 때 재사용할 수 있는 범용 규칙이다. 프로젝트마다 실제 디렉터리, 앱 이름, 도메인, 포트, 실행 방식은 다르므로 먼저 현재 저장소 구조와 문서를 확인한다.

## 기본 원칙

- 사용자가 지정한 범위 밖의 리팩터링, UI 변경, 문구 변경, 파일 대량 수정은 하지 않는다.
- 질문형 요청, 설명 요청, 의도가 애매한 요청은 먼저 설명하고 코드 수정은 보류한다.
- 명시적 실행 요청이 있고 영향 범위가 명확하면 바로 수정한다.
- DB 스키마/데이터, 인증/권한, 공통 설정, 웹서버/systemd, 운영 env 변경은 사용자 확인 후 진행한다.
- 비밀번호, API 키, 암호화 키는 소스에 직접 넣지 않는다. 실제 값은 프로젝트의 env/config 파일에 둔다.
- 로그, 빌드 결과물, 업로드 파일, 실제 env, DB 덤프는 기본적으로 git 관리 대상에서 제외한다.

## 프로젝트 구조 파악

작업 전 아래를 먼저 확인한다.

- 백엔드 루트: `pom.xml`, `build.gradle`, `src/main/java`, `src/main/resources`
- 프론트 루트: `package.json`, `src`, `app`, `pages`, `vite.config.*`, `next.config.*`
- 설정 파일: `.env*`, `application*.yml`, `application*.properties`
- 배포/실행 파일: `systemd`, `deploy`, `scripts`, 웹서버 설정
- 로그 위치와 실행 방식

여러 앱으로 나뉜 프로젝트라면 먼저 앱 경계를 구분한다.

## Java/Spring 구조

- Controller는 요청 처리와 응답 반환 중심으로 유지한다.
- 비즈니스 로직은 Service 계층에 둔다.
- DB 접근은 프로젝트의 기존 DAO/Repository/Mapper 패턴을 따른다.
- MyBatis 프로젝트라면 SQL은 mapper XML 또는 기존 mapper 구조를 우선 따른다.
- JPA 프로젝트라면 Entity, Repository, Service 책임을 분리한다.
- DTO/VO/Request/Response 객체는 기존 네이밍과 패키지 관례를 따른다.
- 공통 보안, CORS, CSRF, 세션 설정 변경은 영향 범위를 먼저 확인한다.
- DB 컬럼/쿼리 변경은 관련 DTO/VO, DAO/Repository, mapper/query, 프론트 표시까지 함께 점검한다.

## 프론트 구조

- React/Vue/Next/Vite 등 현재 프로젝트의 프레임워크와 기존 패턴을 우선 따른다.
- 사용자가 요청하지 않은 디자인, 라벨, DOM 구조, 클래스, 문구를 임의로 바꾸지 않는다.
- API 호출 경로와 프록시 구조를 먼저 확인하고 기존 흐름을 유지한다.
- 공통 레이아웃, 전역 CSS, 공통 컴포넌트 변경은 영향 범위를 먼저 확인한다.
- 폼을 수정할 때는 서버 검증 key와 화면 오류 표시 위치를 함께 확인한다.

## 개발 서버

- 로컬/개발서버/운영서버 실행 방식은 다를 수 있으므로 먼저 확인한다.
- 프론트 dev server는 보통 저장 후 즉시 반영된다.
- Java 백엔드는 devtools, IDE, watcher, systemd, 수동 재시작 등 프로젝트별 방식이 다르다.
- 운영 반영은 일반적으로 JAR/WAR 빌드와 서비스 재시작 기준으로 판단한다.
- 개발용 자동 재시작 설정을 운영 방식으로 오해하지 않는다.

## 검증 원칙

- Java 변경 후 가능한 경우 compile/test 또는 영향 범위에 맞는 가벼운 확인을 수행한다.
- 프론트 변경 후 가능한 경우 build/typecheck/lint 또는 dev URL 확인을 수행한다.
- DB/API 변경 후 backend mapping, service, query, frontend fetch 경로가 일치하는지 확인한다.
- 실행하지 못한 검증은 최종 보고에 명확히 남긴다.

## 관련 Codex Skills

아래 스킬은 `.codex/skills/*/SKILL.md`에 있다. 작업 유형이 맞으면 먼저 읽고 적용한다.

- `java-api-mybatis-playbook`: Spring Controller/Service/DAO/MyBatis/API 작업
- `admin-crud-page-playbook`: 관리자 CRUD 화면/API 작업
- `public-page-playbook`: 사용자 공개 화면, 프론트 페이지, 사용자 폼 작업
- `dev-server-verification`: 개발서버 반영, 도메인, 로그, 서비스 확인
- `rules-conflict-audit`: 규칙 충돌이나 작업 범위 감사

