# trackareer-web

신입·인턴 **채용공고 공개 페이지**. 구 `trackareer-front`(취준 웹 다이어리)를 대체한다.

- 공고 목록 / 직무 필터 / 마감 임박 섹션
- 공고 상세 (모집 직무, 공고 원문)
- 마감 캘린더 (전체 / 관심 공고)
- 로그인(카카오·Apple) + 약관 동의
- 관심 공고 저장 — **앱의 개인 공고로 담기**
- `/app`(앱 다운로드) — 구 front 주소 그대로
- `/account/delete`(계정 삭제 요청, Google Play 요건) — 지금은 카카오 계정만
- 약관 4종: `/docs/terms-of-service` · `privacy-policy` · `privacy-marketing` · `marketing-notification` (앱 env가 이 주소를 가리킨다)

> 공고 화면(목록 · 상세 · 캘린더 · 관심 공고 · 로그인)은 아직 목업이라 `RECRUITMENT_CATALOG_ENABLED = false`(`src/shared/config/site.ts`)로 꺼 두었다. 꺼져 있으면 홈은 앱 소개 화면이고 공고 경로는 404, 헤더 메뉴 · 사이트맵에서도 빠진다.

## 실행

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev                      # http://localhost:3000

pnpm build                    # 프로덕션 빌드
pnpm typecheck                # tsc --noEmit
pnpm lint                     # eslint
pnpm format                   # prettier
```

## 스택과 선택 이유

| 항목       | 결정                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| 프레임워크 | Next 16 App Router (구 front와 동일 계열)                                  |
| 언어       | TypeScript strict                                                          |
| 스타일     | **CSS Modules + CSS 변수 토큰**                                            |
| 상태       | React Context (세션 / 관심 공고). 전역 상태 라이브러리 없음                |
| 원문 정제  | `sanitize-html` — 서버 컴포넌트에서만 호출해 클라이언트 번들에 넣지 않는다 |

**Tailwind 대신 CSS Modules를 쓴 이유**: 디자인 기준인 목업(`trackareer_web_mockup.html`)이 SEED 디자인 시스템 토큰 위에 배너·캘린더·카드까지 직접 짜인 CSS다. 유틸리티 클래스로 옮기면 재현도가 떨어지고 diff를 대조하기 어려워, 토큰은 CSS 변수 그대로 두고 컴포넌트 CSS를 1:1로 옮겼다.

목업의 `container query` 반응형은 실제 뷰포트 `@media`로 바꿨고, 목업 하단의 개발용 컨트롤 바(PC/모바일·로그인 토글)는 제거했다.

## 구조

```
src/
├── app/                      라우트 (서버 컴포넌트 기본)
│   ├── globals.css           SEED 토큰 + 리셋 + 공통 프리미티브(.btn/.grid/.sec/.tag …)
│   ├── page.tsx              공고 목록 — 필터·페이지는 URL searchParams
│   ├── recruitments/[id]/    공고 상세 + JobPosting JSON-LD
│   ├── calendar/             마감 캘린더
│   ├── saved/                관심 공고
│   ├── login/                로그인 + /login/terms 약관 동의
│   ├── account/delete/       계정 삭제 요청 (Google Play 요건)
│   ├── app/                  앱 다운로드
│   ├── docs/[slug]/          약관 4종
│   └── api/saved-recruitments/  관심 공고 BFF (임시)
├── components/               레이아웃·공용 UI
├── features/
│   ├── recruitments/  model(타입) · mock(목업 데이터) · service(조회 경계) · ui
│   ├── calendar/ui
│   ├── saved/         service · ui(SavedProvider)
│   ├── auth/          service · ui(SessionProvider)
│   ├── legal/         약관 본문(content) · 렌더러(ui)
│   ├── app-download/  앱 소개 화면 (홈 · /app 공용)
│   └── account/       계정 삭제 전용 상수 · API
└── shared/            lib(날짜·정제·경로) · config(사이트 상수)
```

## 🔴 지금은 목업이다 — 교체 지점

서버의 공고 카탈로그 도메인이 아직 없다. 요청서는 [docs/backend-request-recruitment-catalog.md](docs/backend-request-recruitment-catalog.md)에 있다.
화면은 전부 완성돼 있고, 아래 **세 파일의 본문만** 실제 API 호출로 바꾸면 된다. 타입과 함수 시그니처는 이미 서버 계약에 맞춰 뒀다.

| 파일                                                  | 현재                  | 교체 후                                                                               |
| ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| `features/recruitments/service/recruitmentService.ts` | `mock/` 데이터 필터링 | `GET /recruitments`, `/recruitments/:id`, `/recruitments/calendar`, `/job-categories` |
| `features/saved/service/savedService.ts`              | localStorage          | `POST`/`DELETE /recruitments/:id/save`, `GET /me/saved-recruitments`                  |
| `features/auth/service/sessionService.ts`             | localStorage          | 카카오/애플 콜백 → BFF → `POST /auth/*`                                               |

교체 시 함께 할 일:

1. **세션은 BFF + httpOnly 쿠키로.** refresh token을 브라우저 저장소에 두지 않는다. Route Handler에서 앱 API를 중계한다.
2. `app/api/saved-recruitments/route.ts`는 지금 클라이언트가 보관한 id를 받는다. 세션이 생기면 `ids` 없이 `GET /me/saved-recruitments`를 중계하도록 바꾼다.
3. 서버 응답의 `savedByMe`를 쓰게 되면 `SavedProvider`는 초기값을 서버에서 받아 시작할 수 있다.
4. 카카오 로그인 콜백 경로를 새로 만들 때 서버의 `redirectUri` 허용목록에 등록돼 있어야 한다(요청서 §4-1).

## 주의할 규칙

- **날짜는 항상 한국 기준**(`shared/lib/date.ts`). 브라우저 타임존이 달라도 D-day가 흔들리면 안 된다.
- **마감 시각 `null`(미명시)은 `23:59` 명시보다 뒤로 정렬**한다. 서버 도메인 규칙과 같다.
- **마감 지난 공고도 표시·저장 가능**하다(회고적 기록 지원 방침).
- **관심 저장 = 앱의 개인 공고 생성.** 웹 전용 북마크가 아니다. 앱에서 그 공고를 지우면 웹의 별도 풀린다.
- `/account/delete` 경로와 `NEXT_PUBLIC_KAKAO_REDIRECT_URI`는 **카카오 콘솔 등록값·서버 `KAKAO_WEB_REDIRECT_URI`와 문자열이 정확히 같아야 한다.** 경로를 바꾸면 계정 삭제 로그인이 깨지고 Google Play 요건도 깨진다.
- **계정 삭제 페이지는 지금 카카오 계정만 받는다.** Apple 계정은 앱에서 삭제하도록 안내한다(메일 안내는 하지 않는다). 웹 정식 오픈 때 웹 Apple 로그인(Services ID)을 붙이면서 여기도 Apple을 받는다. 탈퇴 흐름(사유 하나 · 선택, 삭제 먼저 → 사유 저장)과 문구는 앱 2.0 계정 삭제 화면과 맞추고, 안내는 "30일 보관 → 탈퇴 완료, 그 안에 앱에서 다시 로그인하면 복구"까지만 한다(익명화 세부는 처리방침에 맡김).
- 공고 원문 HTML은 서버 컴포넌트에서 `sanitizeContentHtml()`을 거친 것만 렌더한다.

## 남은 일

- [ ] 서버 카탈로그 API 연동 (위 교체 지점)
- [ ] 카카오 로그인 콜백 라우트 + BFF 세션
- [ ] Apple 웹 로그인 (서버의 Services ID 대응 후)
- [ ] 회사명 검색 (서버 `q` 파라미터 확정 후)
- [ ] 배너·광고 슬롯 운영 도구화 여부 확정
- [ ] 구 `trackareer-front` 내리고 배포 전환
