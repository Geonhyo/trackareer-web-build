'use client';

/**
 * 세션 경계.
 *
 * 흐름은 서버 계약을 그대로 따른다.
 *   로그인 → 기존 사용자면 세션 확립 / 신규면 signupToken 발급
 *   → 약관 동의 화면 → `POST /auth/signup` → 세션 확립
 *
 * 지금은 브라우저 저장소를 쓰는 목업이다. 실제 연동에 필요한 서버 작업은
 * docs/backend-request-recruitment-catalog.md §4 에 요청해 뒀다.
 * W4 연동 시 이 파일의 본문만 BFF(Route Handler) 호출로 바꾸고
 * refresh token은 httpOnly 쿠키에 둔다 — 브라우저 저장소에 두지 않는다.
 */

export type AuthProvider = 'kakao' | 'apple';

export interface SessionUser {
  id: number;
  nickname: string;
  email: string;
}

/** `POST /auth/signup` 요청 바디와 동일 */
export interface TermsAgreementInput {
  termsOfServiceAgreed: boolean;
  privacyPolicyAgreed: boolean;
  privacyMarketingAgreed: boolean;
  marketingNotificationAgreed: boolean;
}

export type SignInResult =
  | { status: 'authenticated'; user: SessionUser }
  | { status: 'signup_required'; signupToken: string };

const SESSION_KEY = 'trackareer.web.session';
const SIGNED_UP_KEY = 'trackareer.web.signed-up';

const MOCK_USER: SessionUser = { id: 1, nickname: '성실한 수달', email: 'demo@trackareer.com' };

const readJson = <T>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장소를 못 쓰는 환경에서도 화면은 동작해야 한다 */
  }
};

export async function getSession(): Promise<SessionUser | null> {
  return readJson<SessionUser>(SESSION_KEY);
}

/**
 * `POST /auth/kakao/web-login` · `POST /auth/apple/login`
 * 실제로는 OAuth 콜백에서 받은 인가 코드/identityToken을 BFF에 넘긴다.
 */
export async function signIn(provider: AuthProvider): Promise<SignInResult> {
  void provider;
  if (!readJson<boolean>(SIGNED_UP_KEY)) {
    return { status: 'signup_required', signupToken: 'mock-signup-token' };
  }
  writeJson(SESSION_KEY, MOCK_USER);
  return { status: 'authenticated', user: MOCK_USER };
}

/** `POST /auth/signup` — 필수 약관 미동의는 서버가 400으로 막는다 */
export async function completeSignup(input: TermsAgreementInput): Promise<SessionUser> {
  if (!input.termsOfServiceAgreed || !input.privacyPolicyAgreed) {
    throw new Error('필수 약관에 동의해야 가입할 수 있어요');
  }
  writeJson(SIGNED_UP_KEY, true);
  writeJson(SESSION_KEY, MOCK_USER);
  return MOCK_USER;
}

export async function signOut(): Promise<void> {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}
