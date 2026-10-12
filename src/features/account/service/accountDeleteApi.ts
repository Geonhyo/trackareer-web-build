import { APP_API_URL } from '../constants';

/**
 * 계정 삭제 페이지 전용 API 호출.
 * 공고 카탈로그용 BFF를 거치지 않고 앱 API를 직접 부른다 —
 * 이 페이지는 accessToken을 두 번만 쓰고 끝나며 브라우저에 세션을 남기지 않는다.
 * 서버 세션(web-login이 만든 것)은 삭제 요청이 모두 끊고, 삭제하지 않고 나가면 logout이 끊는다.
 */
export type ApiFailure = {
  ok: false;
  status: number;
  code?: string;
  details?: { deletionRequestedAt?: string; willBeDeletedAt?: string };
};

export type LoginSuccess = {
  ok: true;
  isNewUser: false;
  accessToken: string;
  refreshToken: string;
  user: { id: number; nickname: string; email: string };
};

export type LoginNewUser = { ok: true; isNewUser: true };

const request = async (
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> => {
  const response = await fetch(`${APP_API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  const text = await response.text();
  const body: Record<string, unknown> = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  return { ok: response.ok, status: response.status, body };
};

const toFailure = (status: number, body: Record<string, unknown>): ApiFailure => ({
  ok: false,
  status,
  code: typeof body.code === 'string' ? body.code : undefined,
  details: (body.details as ApiFailure['details']) ?? undefined,
});

/** 인가 코드를 서버가 액세스 토큰으로 교환한 뒤 앱과 동일한 로그인 응답을 준다. */
export const exchangeCode = async (
  code: string,
): Promise<LoginSuccess | LoginNewUser | ApiFailure> => {
  const { ok, status, body } = await request('/auth/kakao/web-login', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  if (!ok) return toFailure(status, body);
  // 🔴 refreshToken은 화면 state(메모리)에만 둔다 — 갱신에는 쓰지 않고, 삭제하지 않고 나갈 때 세션 폐기용.
  // 브라우저 저장소에 넣지 않는다.
  if (body.isNewUser === true) return { ok: true, isNewUser: true };
  return {
    ok: true,
    isNewUser: false,
    accessToken: String(body.accessToken),
    refreshToken: String(body.refreshToken),
    user: body.user as LoginSuccess['user'],
  };
};

/** 삭제 요청 뒤에 부른다(앱과 같은 순서). 서버는 삭제 대기 계정의 액세스 토큰도 받는다 */
export const saveWithdrawalReason = async (
  accessToken: string,
  reasonType: string,
  etcText: string | null,
): Promise<{ ok: true } | ApiFailure> => {
  const { ok, status, body } = await request('/me/withdrawal-reasons', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ reasonTypes: [reasonType], ...(etcText ? { etcText } : {}) }),
  });
  return ok ? { ok: true } : toFailure(status, body);
};

export const requestDeletion = async (
  accessToken: string,
): Promise<{ ok: true; willBeDeletedAt: string } | ApiFailure> => {
  const { ok, status, body } = await request('/me', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return ok ? { ok: true, willBeDeletedAt: String(body.willBeDeletedAt) } : toFailure(status, body);
};

/** 삭제하지 않고 나갈 때 web-login이 만든 서버 세션을 끊는다 */
export const logout = async (
  accessToken: string,
  refreshToken: string,
): Promise<{ ok: true } | ApiFailure> => {
  const { ok, status, body } = await request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refreshToken }),
  });
  return ok ? { ok: true } : toFailure(status, body);
};
