# HKEGO 프로젝트 가이드

관리자(`HKEGO_ADM`)·사용자(`HKEGO_USER`) 모듈의 스펙, 로컬 기동, 배포 명령을 정리한 문서입니다.

---

## 1. 프로젝트 구성

| 모듈 | 경로 | 역할 | 백엔드 포트 | 프론트 포트 |
|------|------|------|------------|------------|
| 관리자 | `HKEGO_ADM/` | eGov 관리자 시스템 | **9013** | **3013** |
| 사용자 | `HKEGO_USER/` | eGov 사용자 포털 | **9014** | **3014** |

- 백엔드: Spring Boot + **전자정부프레임워크 5.0** + MyBatis
- DB: **MariaDB** (DB_backup.sql)
- 개발 시 프론트·백엔드를 **분리 실행**하고, 프론트가 API를 프록시합니다.
- 운영 배포 시 Maven 빌드로 프론트 정적 파일을 JAR `static/`에 포함해 **단일 포트**로 서빙할 수 있습니다.

---

## 2. 스펙 정보

### 2.1 공통 (백엔드)

| 항목 | 버전 / 값 |
|------|-----------|
| Java | 21 |
| Spring Boot | eGov Parent `egovframe-boot-starter-parent` **5.0.0** |
| MyBatis Spring Boot | 3.0.3 |
| DB | MariaDB, `utf8mb4` / `utf8mb4_unicode_ci` |
| SQL 로깅 (로컬) | P6Spy (`jdbc:p6spy:mariadb://...`) |
| Maven Node (빌드 시) | Node **v20.11.0**, npm **10.2.4** |
| 세션 타임아웃 | 30분 |
| 업로드 경로 (로컬 yml) | `/home/hksts-webapp/uploads` |

### 2.2 관리자 (`HKEGO_ADM`)

| 항목 | 값 |
|------|-----|
| Maven artifact | `hkego-adm` 1.0.0 |
| 프론트 | Vite **7.x** + React **18.3** + TypeScript **5.3.3** |
| 프론트 빌드 산출물 | `front-end/dist/` → `static/` |
| 세션 쿠키 | `HKEGO_ADM_SESSIONID` |
| API prefix | `/api/admin/**` |
| 로컬 DB URL | `jdbc:p6spy:mariadb://127.0.0.1:3306/ulmfe` |

### 2.3 사용자 (`HKEGO_USER`)

| 항목 | 값 |
|------|-----|
| Maven artifact | `hkego-user` 1.0.0 |
| 프론트 | Next.js **16.2.7** + React **19.2** + TypeScript **5.8.3** |
| 프론트 빌드 산출물 | `front-end/out/` (static export) → `static/` |
| 세션 쿠키 | `HKEGO_USER_SESSIONID` |
| API prefix | `/api/user/**` |
| SSR API (개발) | `front-end/.env.local` → `API_BASE_URL=http://127.0.0.1:9014` |

### 2.4 DB 테이블 (공식 DDL 기준)

스키마 정의: **`DB_backup.sql`** (테이블명 **대문자**)

`ADMIN_ACCESS_LOG`, `ADMIN_MST`, `ATCH_FILE_INFO`, `AUTH_GRP`, `AUTH_MENU_MAP`, `BANNER_MST`, `BBS_ARTICLE`, `BBS_MST`, `CMMN_CD_DTL`, `CMMN_CD_MST`, `COMMENT_MST`, `CONTENT_MST`, `POPUP_MST`, `USER_ACCESS_LOG`, `USER_MST`

데이터 백업/복원: `hkego2_backup.sql`

---

## 3. 사전 요구사항

- JDK **21**
- Maven **3.8+**
- Node.js **20.x** (로컬 프론트 dev 또는 Maven `-DskipFrontend=false` 빌드)
- MariaDB `hkego2` 스키마 및 계정

---

## 4. 로컬 개발 기동

개발 시 `pom.xml` 기본값 `skipFrontend=true` 이므로 **백엔드와 프론트를 각각** 실행합니다.

### 4.1 관리자 (HKEGO_ADM)

**터미널 1 — 백엔드 (9013)**

```bash
cd HKEGO_ADM
mvn spring-boot:run -DskipFrontend=true
```

**터미널 2 — 프론트 (3013)**

```bash
cd HKEGO_ADM/front-end
npm install (처음 한번만 \HKEGO_ADM\front-end\node_modules 생성)
npm run dev
```

| URL | 설명 |
|-----|------|
| http://localhost:3013 | 관리자 UI (Vite) |
| http://localhost:9013 | 백엔드 API 직접 호출 |

프록시: `/api`, `/uploads` → `http://127.0.0.1:9013` (`vite.config.ts`)

### 4.2 사용자 (HKEGO_USER)

**터미널 1 — 백엔드 (9014)**

```bash
cd HKEGO_USER
mvn spring-boot:run -DskipFrontend=true
```

**터미널 2 — 프론트 (3014)**

```bash
cd HKEGO_USER/front-end
npm install (처음 한번만 \HKEGO_USER\front-end\node_modules 생성)
npm run dev
```

| URL | 설명 |
|-----|------|
| http://localhost:3014 | 사용자 UI (Next.js) |
| http://localhost:9014 | 백엔드 API 직접 호출 |
| http://localhost:9014/api/user/main | 메인 API 샘플 |

- 브라우저 요청: Next.js rewrites로 `/api/*` → `9014`
- SSR fetch: `API_BASE_URL=http://127.0.0.1:9014` (`.env.local`)

### 4.3 포트 충돌 시 (Windows)

```powershell
netstat -ano | findstr :9013
taskkill /PID <PID> /F

netstat -ano | findstr :9014
taskkill /PID <PID> /F

netstat -ano | findstr :3013
taskkill /PID <PID> /F

netstat -ano | findstr :3014
taskkill /PID <PID> /F
```

---

## 5. 배포 (빌드·실행)

### 5.1 개발 DB — JAR 빌드 (프론트 포함, 단일 포트)

프론트를 JAR에 포함해 백엔드 포트만으로 UI+API를 제공합니다.

**관리자**

```bash
cd HKEGO_ADM
mvn clean package -DskipFrontend=false
java -jar target/hkego-adm-1.0.0.jar
```

→ http://localhost:9013

**사용자**

```bash
cd HKEGO_USER
mvn clean package -DskipFrontend=false
java -jar target/hkego-user-1.0.0.jar
```

→ http://localhost:9014

### 5.2 운영 — prod 프로파일

운영 설정: `src/main/resources/application-prod.yml`  
(`-Pprod` 시 `src/main/resources-profile/prod` 리소스 병합)

```bash
# 관리자
cd HKEGO_ADM
mvn clean package -Pprod -DskipFrontend=false

# 사용자
cd HKEGO_USER
mvn clean package -Pprod -DskipFrontend=false
```

**운영 환경 변수 (필수 권장)**

| 변수 | 설명 |
|------|------|
| `SPRING_DATASOURCE_URL` | JDBC URL (기본: `jdbc:mariadb://127.0.0.1:3306/hkstsdemo?...`) |
| `SPRING_DATASOURCE_USERNAME` | DB 계정 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 (**JAR에 넣지 않음**) |
| `APP_SESSION_COOKIE_SECURE` | HTTPS 시 `true` |
| `APP_CSRF_COOKIE_SECURE` | HTTPS 시 `true` |

**JAR 실행**

```bash
export SPRING_DATASOURCE_PASSWORD='your-password'

java -jar target/hkego-adm-1.0.0.jar
java -jar target/hkego-user-1.0.0.jar
```

운영 업로드 경로: `/home/hkstsdemo/uploads`  
운영 CORS: `https://hkstsdemo.hk-test.co.kr` (application-prod.yml)

### 5.3 프론트만 단독 빌드

**관리자**

```bash
cd HKEGO_ADM/front-end
npm install
npm run build
# 산출물: dist/
```

**사용자**

```bash
cd HKEGO_USER/front-end
npm install
npm run build
# 산출물: out/ (static export)
```

---

## 6. Maven 옵션 요약

| 옵션 | 기본값 | 설명 |
|------|--------|------|
| `-DskipFrontend=true` | pom 기본 | Node/npm 빌드 생략 (백엔드만) |
| `-DskipFrontend=false` | — | 프론트 빌드 후 `static/` 복사 |
| `-Pprod` | — | 운영 yml·리소스 적용 |
| `mvn spring-boot:run -DskipFrontend=true` | — | 로컬 핫 개발 (백엔드만) |

---

## 7. 디렉터리 참고

```
work_egov2/
├── hkego2_ddl.sql          # 공식 DB 스키마
├── hkego2_backup.sql       # 데이터 백업
├── HKEGO_GUIDE.md          # 본 문서
├── HKEGO_ADM/              # 관리자 모듈
│   ├── pom.xml
│   ├── front-end/          # Vite + React
│   └── src/main/
└── HKEGO_USER/             # 사용자 모듈
    ├── pom.xml
    ├── front-end/          # Next.js
    └── src/main/
```

---

## 8. IDE (eGovFrame)

- Eclipse / eGovFrame Dev: 각 모듈 `.project` import
- 백엔드: `EgovBootApplication` 실행
- 프론트: 터미널에서 `npm run dev` 병행
