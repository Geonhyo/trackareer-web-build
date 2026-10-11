# [요청] 채용공고 웹 페이지용 서버 작업 요청서

- **요청 배경**: `trackareer-front`(구 웹)를 폐쇄하고, 같은 도메인에 **공개 채용공고 페이지**(`trackareer-web`)를 새로 띄운다. 운영자가 등록한 공식 공고를 목록/상세/마감 캘린더로 보여주고, 로그인 사용자는 공고를 자기 일정으로 담을 수 있다.
- **요청자**: 웹 파트
- **대상 레포**: `trackareer-server`
- **작성 기준**: 현재 `docs/data-model.md`, `docs/api-spec.md`, `CLAUDE.md` 규칙 준수 (마이그레이션 필수, `synchronize` 금지, `enumName` 지정, `{page, limit}` → `{items, total}` 관례)

---

## 0. 요약 — 왜 신규 도메인이 필요한가

현재 `job_posting`은 **`userId` FK를 가진 개인 소유 레코드**다. 사용자가 스크래핑/수기로 자기 캘린더에 담는 용도이고, 필드도 `company`/`position` 2개뿐이다.

이번 웹 페이지가 보여줄 것은 **운영자가 등록하는 공용 공고**다. 기업 브랜드 정보, 채용 유형, 모집 직무 N개(직무별 하는 일/주요 업무), 직무 분류 체계, 공고 원문 전문이 필요하다. 기존 테이블로는 표현할 수 없어 **신규 도메인 `recruitments`** 를 요청한다.

추가로, 웹의 "관심 공고 저장"은 **별도 북마크가 아니라 기존 `job_posting`을 생성하는 방식**으로 확정했다. 웹에서 담은 공고가 앱 홈/캘린더/마감 알림에 그대로 올라가는 것이 목표다. 이 때문에 `job_posting`에 컬럼 1개 추가가 필요하다.

**작업 규모 요약**

| 구분             | 내용                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 신규 테이블      | `job_category`, `company`, `recruitment_post`, `recruitment_role` (4개)               |
| 기존 테이블 변경 | `job_posting`에 `recruitmentPostId` 추가 + `job_posting_source` enum에 `CATALOG` 추가 |
| 공개 API         | 5개 (비인증 — SSR/SEO 때문에 반드시 비인증 접근 가능해야 함)                          |
| 인증 API         | 3개 (담기/해제/내 관심 목록)                                                          |
| 어드민 API       | 공고·기업 CRUD + 벌크 임포트                                                          |
| 인증 보강        | 카카오 `redirectUri` 허용목록화, 애플 **웹(Services ID)** 지원                        |

---

## 1. 신규 스키마

### 1-1. `job_category` — 직무 분류

웹 목록 화면의 직무 필터 칩의 근거. 대분류 7 / 소분류 26 고정값이며 **시드 마이그레이션으로 투입**한다.

| 컬럼        | 타입               | 비고           |
| ----------- | ------------------ | -------------- |
| `id`        | int PK             |                |
| `groupName` | varchar(50)        | 대분류         |
| `name`      | varchar(50) UNIQUE | 소분류         |
| `sortOrder` | int                | 화면 노출 순서 |

기반 클래스 불필요(정적 마스터 데이터).

**시드 값** (대분류 → 소분류, 순서 그대로)

| 대분류          | 소분류                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| 경영·기획       | 경영·전략기획, 재무·회계, HR·인사, 사무지원·총무, 법무·컴플라이언스          |
| 영업·마케팅     | 영업·영업관리, 마케팅·브랜딩, 홍보·PR, MD·커머스, CS·CX                      |
| 금융·컨설팅     | 금융·투자, 리서치·컨설팅                                                     |
| IT·데이터       | 소프트웨어 개발, 데이터·AI, 정보보안·IT인프라, 서비스기획·PM, 디자인         |
| 연구·엔지니어링 | 전기·전자·반도체, 기계·자동차, 화학·소재, 바이오·제약 연구, 건설·토목·플랜트 |
| 생산·공급망     | 생산·품질관리, 구매·SCM·물류, 환경·안전(EHS)                                 |
| 콘텐츠          | 콘텐츠·미디어                                                                |

### 1-2. `company` — 기업

| 컬럼             | 타입                | 비고                                                   |
| ---------------- | ------------------- | ------------------------------------------------------ |
| `id`             | int PK              |                                                        |
| `name`           | varchar(100) UNIQUE | 예: `삼성전자`                                         |
| `industryLabel`  | varchar(100)        | 카드/상세의 업종 표기. 예: `대기업 · 반도체`           |
| `brandColor`     | varchar(7)          | 카드 썸네일 배경. 예: `#1428A0`                        |
| `brandTextColor` | varchar(7)          | 썸네일 글자색. 예: `#FFFFFF`                           |
| `logoUrl`        | varchar(1024) NULL  | 1차 릴리스에서는 미사용(색상+회사명 렌더). 추후 확장용 |

기반: `FullTimeEntity`

> 로고 이미지 업로드/스토리지는 이번 범위에서 제외했다. 필요해지면 별도 요청한다.

### 1-3. `recruitment_post` — 공식 공고

| 컬럼             | 타입                           | 비고                                                     |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| `id`             | int PK                         |                                                          |
| `companyId`      | int FK → `company`             | `ON DELETE RESTRICT`                                     |
| `title`          | varchar(255)                   | 예: `2026 하반기 3급 신입사원 공개채용`                  |
| `employmentType` | enum `employment_type`         | `NEW_GRAD` \| `CONVERSION_INTERN` \| `EXPERIENCE_INTERN` |
| `deadline`       | date NULL                      | **기존 도메인 규칙 그대로**: NULL = 마감 없음            |
| `deadlineTime`   | time NULL                      | NULL(미명시)과 `23:59`(명시)는 다른 데이터               |
| `closedOnHire`   | boolean default false          | 채용시 마감                                              |
| `publishedAt`    | timestamptz                    | 노출 시작 시각 = 목록의 "최근 등록순" 정렬 기준          |
| `sourceUrl`      | varchar(1024)                  | 기업 채용 페이지 원문 링크(지원 접수처)                  |
| `notice`         | text NULL                      | 상세의 "지원 전에 확인해요" 안내 문구                    |
| `contentHtml`    | text NULL                      | 공고 원문 본문(HTML)                                     |
| `status`         | enum `recruitment_post_status` | `DRAFT` \| `PUBLISHED` \| `HIDDEN`                       |

기반: `FullTimeEntity` + `@DeleteDateColumn`(**soft delete**)

- **soft delete인 이유**: 개인 `job_posting`이 이 레코드를 참조한다. hard delete 시 사용자가 담아둔 일정의 출처가 끊긴다.
- 인덱스: `(status, deadline)`, `(status, publishedAt)`
- **`contentHtml` sanitize**: 어드민 입력 시 서버에서 `sanitize-html` 등으로 정제 후 저장해달라. 웹은 저장된 값을 그대로 렌더한다(이중 방어는 하겠지만 저장 시점 정제가 1차 방어선).

### 1-4. `recruitment_role` — 모집 직무

한 공고에 직무 1~N개. 상세의 아코디언과 목록 카드의 직무 칩 근거.

| 컬럼            | 타입                        | 비고                                 |
| --------------- | --------------------------- | ------------------------------------ |
| `id`            | int PK                      |                                      |
| `postId`        | int FK → `recruitment_post` | `ON DELETE CASCADE`                  |
| `jobCategoryId` | int FK → `job_category`     | 필터 조인 키                         |
| `name`          | varchar(100)                | 공고상 직무명. 분류명과 다를 수 있음 |
| `summary`       | varchar(255)                | "하는 일" 한 줄                      |
| `details`       | jsonb                       | "주요 업무" 문자열 배열              |
| `sortOrder`     | int                         |                                      |

인덱스: `(postId)`, `(jobCategoryId)`

---

## 2. 기존 테이블 변경 — "저장 = 앱 내 공고로 담기"

웹의 별(★) 토글은 **북마크 테이블이 아니라 `job_posting` 레코드의 존재 여부**로 판정한다. 별도 북마크를 두면 "웹에서 저장했는데 앱에는 없음" 같은 상태 불일치가 생긴다.

### 2-1. `job_posting` 컬럼 추가

| 컬럼                | 타입                             | 비고                 |
| ------------------- | -------------------------------- | -------------------- |
| `recruitmentPostId` | int NULL FK → `recruitment_post` | `ON DELETE SET NULL` |

- **부분 유니크 인덱스**: `UNIQUE (userId, recruitmentPostId) WHERE recruitmentPostId IS NOT NULL` — 같은 공고 중복 담기 방지
- 기존 행은 전부 NULL (스크래핑/수기 등록분)

### 2-2. `job_posting_source` enum 값 추가

`SCRAPED`, `MANUAL` → **`CATALOG` 추가**. 웹 카탈로그에서 담은 공고를 통계에서 구분하기 위함.

### 2-3. 담기 시 필드 매핑

| `job_posting`                                | 채울 값                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `company`                                    | `company.name`                                                                        |
| `position`                                   | 사용자가 고른 직무의 `recruitment_role.name`. 직무 미선택 시 `recruitment_post.title` |
| `deadline` / `deadlineTime` / `closedOnHire` | 카탈로그 값 복사                                                                      |
| `url`                                        | `recruitment_post.sourceUrl`                                                          |
| `memo`                                       | NULL                                                                                  |
| `source`                                     | `CATALOG`                                                                             |
| `attemptId`                                  | NULL                                                                                  |
| `recruitmentPostId`                          | 해당 공고 id                                                                          |
| `applicationStatus`                          | `NOT_APPLIED`                                                                         |

### 2-4. 확정해둔 동작 규칙

| 상황                              | 동작                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| 이미 담은 공고를 다시 담기        | 에러 아님. **멱등** 처리 — 기존 `jobPostingId`를 그대로 200으로 반환                     |
| 웹에서 별 해제                    | 해당 `job_posting` **hard delete** (기존 공고 삭제 정책과 동일)                          |
| 앱에서 그 공고를 삭제             | 웹의 별이 자동으로 풀린 상태가 된다 (존재 여부로 판정하므로 별도 처리 불필요)            |
| 앱에서 마감일/회사명을 수정       | **원본 카탈로그에는 반영하지 않는다.** 개인 사본일 뿐이다                                |
| 원본 카탈로그의 마감일이 바뀜     | **이미 담긴 개인 사본에 소급 반영하지 않는다.** 사용자가 손댔을 수 있어 덮어쓰면 안 된다 |
| 마감 지난 공고 담기               | **허용**한다 (기존 "회고적 기록 지원" 방침 유지)                                         |
| 웹의 관심 목록/캘린더에 표시할 값 | **카탈로그 원본 값**을 쓴다. 웹은 카탈로그 페이지이고, 개인화된 수정본은 앱에서 본다     |

---

## 3. API 요청

### 3-1. 공개 API (비인증) — 단, 토큰이 오면 `savedByMe`를 채워준다

웹 목록/상세는 **SSR로 렌더해 SEO 색인 대상**이 된다. 반드시 비인증으로 200이 떨어져야 한다.
동시에 로그인 상태에서는 별 표시가 필요하므로, **선택적 인증 가드**(`OptionalJwtAuthGuard` — 토큰 있으면 파싱, 없으면 통과)를 신설해 목록/상세에 적용해달라.

#### `GET /recruitments`

| 쿼리                 | 타입    | 기본     | 설명                                                       |
| -------------------- | ------- | -------- | ---------------------------------------------------------- |
| `jobCategoryIds`     | int[]   | -        | 콤마 구분. 지정 시 해당 직무를 하나라도 모집하는 공고 (OR) |
| `deadlineWithinDays` | int     | -        | 지정 시 오늘부터 N일 내 마감 (마감 임박 섹션용)            |
| `includeExpired`     | boolean | false    | 기본은 마감 경과분 제외                                    |
| `sort`               | enum    | `latest` | `latest`(publishedAt DESC) \| `deadline`(마감 임박순)      |
| `page` / `limit`     | int     | 1 / 8    | 기존 어드민 관례와 동일                                    |

응답

```json
{
  "items": [
    {
      "id": 1,
      "title": "2026 하반기 3급 신입사원 공개채용",
      "employmentType": "NEW_GRAD",
      "deadline": "2026-09-16",
      "deadlineTime": "18:00",
      "closedOnHire": false,
      "publishedAt": "2026-09-01T00:00:00Z",
      "company": {
        "id": 1,
        "name": "삼성전자",
        "industryLabel": "대기업 · 반도체",
        "brandColor": "#1428A0",
        "brandTextColor": "#FFFFFF",
        "logoUrl": null
      },
      "roles": [
        {
          "id": 11,
          "name": "소프트웨어 개발",
          "jobCategoryId": 13,
          "summary": "임베디드 및 플랫폼 SW 개발"
        }
      ],
      "savedByMe": false
    }
  ],
  "total": 27
}
```

- `roles`는 목록에서도 전부 내려주면 된다(공고당 최대 7개 수준). 카드에서 선택 직무와 매칭해 강조 표시에 쓴다.
- `savedByMe`는 **비인증 요청 시 항상 `false`**.

**정렬 규칙 (기존 도메인 규칙 유지)**: `sort=deadline`일 때 `deadline` ASC → `deadlineTime` ASC이되 **`deadlineTime IS NULL`이 뒤로** 간다(`NULL`은 시간 미정이므로 `23:59` 명시보다 후순위). `deadline IS NULL`(마감 없음)은 맨 뒤.

#### `GET /recruitments/:id`

목록 항목 + `sourceUrl`, `notice`, `contentHtml`, `roles[].details`, `roles[].sortOrder`.
`status != PUBLISHED`이거나 soft delete된 공고는 **404**.

#### `GET /recruitments/calendar?year=&month=`

해당 월에 마감되는 공고의 경량 목록. 캘린더 셀과 날짜 패널을 한 번에 그린다.

```json
{
  "items": [
    {
      "id": 1,
      "title": "...",
      "deadline": "2026-09-16",
      "deadlineTime": "18:00",
      "company": { "name": "삼성전자", "brandColor": "#1428A0", "brandTextColor": "#FFFFFF" },
      "savedByMe": false
    }
  ]
}
```

- 마감 경과분도 **포함**한다(지난 날짜 칸에도 표시해야 함).
- 페이지네이션 없음.

#### `GET /job-categories`

```json
{ "items": [{ "groupName": "IT·데이터", "categories": [{ "id": 13, "name": "소프트웨어 개발" }] }] }
```

### 3-2. 인증 API

#### `POST /recruitments/:id/save`

```json
// req (직무 선택 없이 저장 가능)
{ "recruitmentRoleId": 11 }
```

| 응답                                         | 조건                  |
| -------------------------------------------- | --------------------- |
| `201 { "jobPostingId": 101, "saved": true }` | 새로 담김             |
| `200 { "jobPostingId": 101, "saved": true }` | 이미 담겨 있음 (멱등) |
| `404`                                        | 공고 없음 / 비공개    |

#### `DELETE /recruitments/:id/save`

연결된 `job_posting`을 hard delete → `204`. 없어도 `204`(멱등).

#### `GET /me/saved-recruitments`

내가 담은 카탈로그 공고 목록. 응답 형태는 `GET /recruitments`의 `items`와 동일(카탈로그 원본 값 기준), 마감 임박순 정렬, 마감 경과분 포함.

- 웹의 "관심 공고" 화면과 "관심 공고만 보기" 캘린더가 이 API를 쓴다.
- 캘린더용으로 `year`/`month` 쿼리를 함께 받아주면 호출이 하나로 끝난다.

### 3-3. 어드민 API

기존 `/admin/*` 인증 체계와 `AdminAction` 감사 로그를 그대로 따른다.

| Method           | Endpoint                         | 비고                                                               |
| ---------------- | -------------------------------- | ------------------------------------------------------------------ |
| GET/POST         | `/admin/companies`               | 목록(page/limit) · 생성                                            |
| PATCH/DELETE     | `/admin/companies/:id`           |                                                                    |
| GET/POST         | `/admin/recruitments`            | 목록(상태·기업·키워드 필터) · 생성(직무 중첩 생성)                 |
| GET/PATCH/DELETE | `/admin/recruitments/:id`        | 직무 목록 전체 교체 방식 허용                                      |
| PATCH            | `/admin/recruitments/:id/status` | `DRAFT` ↔ `PUBLISHED` ↔ `HIDDEN`                                   |
| POST             | `/admin/recruitments/import`     | **JSON 배열 벌크 임포트.** 초기 데이터 투입 수단이라 우선순위 높음 |

> 어드민 입력 UI(`trackareer-admin`)는 아직 없다. 초기 공고는 `import`로 채울 계획이니 **`import`를 CRUD보다 먼저** 열어주면 웹 개발이 실데이터로 바로 진행된다. 임포트용 JSON 스키마 예시는 웹 파트에서 별도 제공하겠다.

---

## 4. 인증 보강 요청

### 4-1. 카카오 — `redirectUri` 허용목록화 (필수)

현재 `POST /auth/kakao/web-login`은 `redirectUri`를 받지 않고 env `KAKAO_WEB_REDIRECT_URI` 하나로 고정한다. 그 값이 **계정 삭제 페이지 경로**라서, 새 웹의 로그인 콜백(`/auth/kakao/callback` 예정)을 쓸 수 없다.

요청:

- env를 `KAKAO_WEB_REDIRECT_URIS`(콤마 구분 허용목록)로 확장
- 요청 바디에 `redirectUri` 추가 → 허용목록에 있는 값만 통과, 없으면 `400`
- 기존 `KAKAO_WEB_REDIRECT_URI` 단일 값도 계속 동작하도록 하위 호환 유지(계정 삭제 페이지가 살아 있어야 함)

### 4-2. 애플 — 웹(Services ID) 지원 (필수, 1차 출시 범위)

현재 `apple.service.ts`는 `aud`를 `APPLE_CLIENT_ID`(앱 번들 ID) **하나로만** 검증한다. 웹의 Sign in with Apple은 **Services ID**가 `client_id`라 그대로는 `INVALID_APPLE_TOKEN`으로 떨어진다.

요청:

- env `APPLE_WEB_CLIENT_ID`(Services ID) 추가
- `identityToken` 검증 시 audience를 `[APPLE_CLIENT_ID, APPLE_WEB_CLIENT_ID]`로 허용
- client secret(JWT) 생성 시 `sub`을 **해당 요청의 clientId**로 맞춰야 토큰 교환/revoke가 성립한다 → `AppleLoginDto`에 `platform: 'ios' | 'web'` 추가 제안
- 계정 삭제 시 revoke 경로도 같은 분기를 타야 한다

웹은 `response_mode=form_post`로 `code`/`id_token`을 받아 기존 `POST /auth/apple/login` 계약 그대로 전달할 예정이다.

### 4-3. 신규 가입 플로우

웹도 기존 계약을 그대로 쓴다: 로그인 → `isNewUser: true` + `signupToken` → **약관 동의 화면** → `POST /auth/signup`. 서버 변경 없음. (웹에 동의 화면을 새로 만든다)

### 4-4. CORS

현재 `main.ts`는 `app.enableCors()`로 전면 허용이다. 웹은 서버 컴포넌트에서 호출하므로 CORS가 필수는 아니지만, 브라우저 직접 호출 경로(담기/해제)가 있어 **웹 도메인 허용 + origin 제한**을 이 기회에 함께 정리해달라 (`docs/dev-plan.md`의 잔여 항목과 동일 건).

---

## 5. 우선순위

| 순위 | 항목                                                                                   | 이유                                         |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1    | `job_category` 시드 + `company` + `recruitment_post` + `recruitment_role` 마이그레이션 | 모든 작업의 선행                             |
| 2    | `POST /admin/recruitments/import`                                                      | 실데이터 없이는 웹 개발이 목업 상태에 머문다 |
| 3    | `GET /recruitments`, `GET /recruitments/:id`, `GET /job-categories`                    | 목록·상세 화면                               |
| 4    | 카카오 `redirectUri` 허용목록                                                          | 로그인 화면                                  |
| 5    | `job_posting` 변경 + 담기/해제/`GET /me/saved-recruitments`                            | 관심 공고·관심 캘린더                        |
| 6    | `GET /recruitments/calendar`                                                           | 전체 마감 캘린더                             |
| 7    | 애플 웹 지원                                                                           | 1차 출시 범위이나 카카오보다 후순위 가능     |
| 8    | 어드민 CRUD 전체                                                                       | 임포트로 버틸 수 있음                        |

---

## 6. 웹 파트가 별도로 처리하는 것 (서버 작업 아님)

- 구 `trackareer-front`의 `/account/delete`(Google Play 필수 요건)와 `/app`(앱 다운로드) 페이지를 새 웹으로 이식. **카카오 콘솔의 기존 Redirect URI와 `KAKAO_WEB_REDIRECT_URI` 값은 경로까지 그대로 유지**할 예정이라 서버 설정 변경은 없다.
- D-day·마감 표기는 `Asia/Seoul` 고정으로 계산 (기존 "KST 단일 처리" 방침과 동일)
- `contentHtml` 렌더 시 클라이언트 측 sanitize 이중 방어
- SEO: 공고 상세에 `JobPosting` JSON-LD, sitemap 생성

---

## 7. 열린 항목 (회신 부탁)

1. `recruitment_post`에 `closedOnHire`(채용시 마감)를 두기로 했는데, 웹 카드/상세에 이 표기가 들어가면 목업에 없던 UI가 생긴다. 실제로 쓸 데이터인지 확인 부탁한다. 안 쓰면 컬럼만 두고 화면 노출은 생략하겠다.
2. 공고 조회수/인기순 정렬이 필요한가? 필요하면 `viewCount` 컬럼과 증가 엔드포인트를 지금 스키마에 같이 넣는 편이 낫다.
3. 회사명 키워드 검색이 1차 범위에 포함되는지. 포함되면 `GET /recruitments`에 `q` 파라미터를 추가해야 한다.
4. 목록 상단 배너(캐러셀)와 캘린더 우측 광고 슬롯을 운영 도구로 관리할 계획인지. 1차에는 웹에 하드코딩할 생각이다.
5. **근무지 필드가 필요하다.** 공고 상세에 `JobPosting` JSON-LD를 넣어 Google for Jobs 색인을 노리는데, 이 스키마는 `jobLocation`(또는 원격 근무 시 `applicantLocationRequirements`)이 없으면 리치 결과로 인정되지 않는다. 지금은 해당 필드를 비워 두고 내보내는 중이라 색인 가치가 떨어진다. `recruitment_post`에 `locationText varchar(255) NULL`(예: `서울 서초구`) 또는 근무지 테이블 추가를 검토해달라. 우선순위는 3순위와 같이 봐도 된다.

---

## 부록. 벌크 임포트 JSON 규격

`POST /admin/recruitments/import`의 요청 바디로 제안하는 형태다. 웹 목업 데이터가 이미 이 구조를 쓰고 있어(`src/features/recruitments/mock/rawPosts.ts`) 그대로 밀어 넣을 수 있다.

```jsonc
{
  "items": [
    {
      // 기업 — name으로 upsert 한다(있으면 재사용, 없으면 생성)
      "company": "삼성전자",
      "industryLabel": "대기업 · 반도체",
      "brandColor": "#1428A0",
      "brandTextColor": "#FFFFFF",

      "title": "2026 하반기 3급 신입사원 공개채용",
      "employmentType": "NEW_GRAD", // NEW_GRAD | CONVERSION_INTERN | EXPERIENCE_INTERN
      "deadline": "2026-09-16", // null 이면 마감 없음
      "deadlineTime": "18:00", // 빈 문자열/누락이면 시각 미명시(NULL)
      "closedOnHire": false,
      "publishedOn": "2026-09-01", // publishedAt 의 날짜 부분 (KST 기준)
      "sourceUrl": "https://www.samsungcareers.com/",
      "notice": "직무적합성평가(GSAT)를 꼭 봐야 해요.",
      "contentHtml": "<h4>지원 기간</h4>…", // 저장 시 서버에서 sanitize
      "status": "PUBLISHED",

      "roles": [
        {
          "name": "소프트웨어 개발", // 직무 분류 소분류명과 같으면 jobCategoryId 자동 매핑
          "jobCategory": "소프트웨어 개발", // 표기명이 분류명과 다를 때만 별도로 지정
          "summary": "임베디드 및 플랫폼 SW 개발",
          "details": ["반도체 제어 펌웨어·디바이스 드라이버 개발", "모바일·가전 플랫폼 SW 설계"],
        },
      ],
    },
  ],
}
```

**요청 사항**

- `jobCategory`(또는 `name`)가 분류 마스터에 없으면 그 건만 실패시키고, 응답에 실패한 인덱스와 사유를 함께 돌려달라. 전체 롤백보다 부분 성공 + 리포트가 운영에 낫다.
- 같은 `(company, title, deadline)` 조합이 이미 있으면 기본은 **건너뛰기**, `?mode=upsert`일 때만 덮어쓰기.
- 응답 예: `{ "created": 28, "skipped": 2, "failed": [{ "index": 5, "reason": "알 수 없는 직무 분류: 프로덕트 오너" }] }`
