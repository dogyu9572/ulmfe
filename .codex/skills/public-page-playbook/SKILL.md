---
name: public-page-playbook
description: 사용자 공개 화면, 프론트 페이지, 사용자 API, 사용자 폼, 검증 메시지, 마이페이지/고객센터 성격 화면을 수정할 때 사용한다.
---

# 사용자 공개 화면 플레이북

## 사전 확인

1. 프론트 화면 파일과 백엔드 API 파일을 구분한다.
2. 화면 문구만 바꾸는지, API 응답 데이터도 바꾸는지 먼저 분리한다.
3. 공개 화면은 디자인/문구/DOM 변경의 체감 영향이 크므로 요청 범위를 정확히 지킨다.

## 주요 경로 찾기

프로젝트마다 경로가 다르므로 아래 후보를 먼저 탐색한다.

- 프론트 화면: `src/app`, `src/pages`, `resources/views`, `templates`
- 레이아웃: `layout`, `layouts`, `components`, `partials`
- 스타일: `css`, `scss`, `module.css`, `globals.css`
- 사용자 API: `user`, `frontend`, `public`, `web` controller
- 프론트 프록시: `next.config.*`, `vite.config.*`, dev server config

## 구현 규칙

- 사용자가 요청하지 않은 디자인, 문구, DOM 구조를 바꾸지 않는다.
- API 호출은 기존 경로와 프록시 구조를 유지한다.
- 폼이 추가되면 서버 검증과 프론트 오류 표시를 함께 설계한다.
- 개인정보/파일 업로드가 관련되면 보안 설정과 저장 경로를 먼저 확인한다.
- 페이지네이션/검색/필터가 있는 화면은 query string 유지 여부를 확인한다.

## 검증

- 프론트 변경 후 개발 URL 또는 로컬 URL 확인을 우선 고려한다.
- Java/PHP/Node 백엔드 변경 후 서버 로그에서 성공 여부를 확인한다.
- API 응답 형태가 프론트에서 기대하는 구조와 일치하는지 확인한다.

