import { APP_API_URL } from '../constants';

/**
 * 계정 삭제 페이지 전용 API 호출.
 * 공고 카탈로그용 BFF를 거치지 않고 앱 API를 직접 부른다 —
 * 이 페이지는 accessToken을 두 번만 쓰고 끝나며 세션을 만들지 않는다.
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
  // 🔴 refreshToken은 받지 않는다 — 이 페이지는 accessToken 두 번만 쓰고 끝난다.
  if (body.isNewUser === true) return { ok: true, isNewUser: true };
  return {
    ok: true,
    isNewUser: false,
    accessToken: String(body.accessToken),
    user: body.user as LoginSuccess['user'],
  };
};

export const saveWithdrawalReasons = async (
  accessToken: string,
  reasonTypes: string[],
  etcText: string | null,
): Promise<{ ok: true } | ApiFailure> => {
  const { ok, status, body } = await request('/me/withdrawal-reasons', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(etcText ? { reasonTypes, etcText } : { reasonTypes }),
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
