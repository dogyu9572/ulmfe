---
name: admin-crud-page-playbook
description: 관리자 화면의 목록/등록/수정/삭제, 검색/필터/페이지네이션, 관리자 API, 권한/메뉴/공통 컴포넌트를 수정할 때 사용한다.
---

# 관리자 CRUD 페이지 플레이북

## 사전 확인

1. 가장 비슷한 기존 관리자 페이지를 찾는다.
2. 화면 파일, API Controller, Service, DAO/Repository/Mapper, query의 연결을 확인한다.
3. 공통 레이아웃, 공통 CSS, 권한/세션/CSRF 변경은 영향 범위를 먼저 확인한다.

## 주요 경로 찾기

프로젝트마다 경로가 다르므로 아래 후보를 먼저 탐색한다.

- 프론트 페이지: `src/pages`, `src/app`, `resources/views`, `templates`
- 공통 컴포넌트: `components`, `layouts`, `partials`
- 관리자 API: `*admin*/web`, `*admin*/controller`, `Backoffice`, `Admin`
- Service: `service`
- DAO/Repository/Mapper: `dao`, `repository`, `mapper`, `service/impl`
- SQL: `resources/mapper`, query 파일, repository query

## 구현 규칙

- 새 화면을 만들기 전에 기존 목록/등록/수정/상세 화면 패턴을 확인한다.
- ULMFE 관리자 신규 목록 화면은 특별한 이유가 없으면 `/admin/bbs-post/{게시판ID}` 목록 화면의 툴바, 페이지당 개수 선택, 검색영역, 선택삭제/신규 버튼 배치, 페이징 패턴을 UI 기준으로 삼는다.
- 목록, 검색, 페이지네이션, 행 액션 버튼은 기존 컴포넌트와 CSS를 재사용한다.
- 관리자 기획서의 항목, 필드, 설명/디스크립션, 안내 문구, 상태값, 버튼 기능은 꼼꼼히 반영한다.
- 관리자 기획서의 시각 디자인, 색상, 여백, 버튼 위치, 표/폼 레이아웃은 그대로 따라 하지 말고 현재 기본 관리자 모듈 UI를 우선한다.
- 기획서와 기존 관리자 UI 패턴이 충돌하면 기존 관리자 UI 패턴을 기준으로 구현하고, 기능상 배치 변경이 필요하면 사용자 확인을 받는다.
- API 경로는 기존 관리자 prefix와 응답 형식을 따른다.
- 파일 업로드/다운로드는 기존 저장소, URL, 검증 패턴을 유지한다.
- 사용자가 요청하지 않은 관리자 UI 문구/색상/간격을 임의 변경하지 않는다.

## 검증

- 목록 -> 등록/수정/삭제 -> 목록 복귀 흐름을 정적으로 확인한다.
- fetch URL, Controller mapping, Service method, query id가 이어지는지 확인한다.
- 가능한 경우 관리자 dev URL 또는 HTTP 요청으로 응답 상태를 확인한다.
- 실행하지 못한 브라우저 확인은 최종 보고에 남긴다.
