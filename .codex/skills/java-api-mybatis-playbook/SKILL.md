---
name: java-api-mybatis-playbook
description: Spring Boot 백엔드 API, Service, DAO, MyBatis mapper, VO/DTO, DB 조회/저장 흐름을 추가하거나 수정할 때 사용한다.
---

# Java API/MyBatis 플레이북

## 사전 확인

1. 대상 앱 또는 모듈을 먼저 구분한다.
2. Controller, Service, ServiceImpl, DAO/Mapper, XML mapper, VO/DTO 중 실제 영향 파일을 찾는다.
3. DB 스키마나 데이터 변경이 필요한 경우 사용자 확인 전에는 실행하지 않는다.
4. 운영 env 값이나 비밀번호는 소스에 넣지 않는다.

## 기본 흐름

```text
프론트 요청
-> Spring Controller
-> Service
-> ServiceImpl
-> DAO/Mapper
-> SQL mapper 또는 query
-> DB
```

## 구현 규칙

- Controller는 요청 파라미터 처리, 서비스 호출, 응답 반환 중심으로 둔다.
- 비즈니스 로직은 Service 계층에 둔다.
- SQL은 가능한 기존 mapper XML 또는 mapper interface 패턴을 따른다.
- VO/DTO 필드명은 기존 camelCase와 DB underscore 매핑을 확인한다.
- MyBatis `mapper-locations`, `type-aliases-package`, namespace, mapper id를 맞춘다.
- 응답 형식은 프로젝트의 기존 API 응답 래퍼를 우선 사용한다.

## 검증

- 변경한 Java 파일의 import, bean 이름, mapper id가 맞는지 확인한다.
- mapper XML namespace와 DAO/Mapper 호출 메서드명이 일치하는지 확인한다.
- 가능한 경우 Maven/Gradle compile 또는 영향 앱 빌드를 실행한다.
- 개발서버에서는 로그에서 재시작 성공 여부를 확인한다.

