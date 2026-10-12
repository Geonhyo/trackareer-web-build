import { ACCOUNT_DELETE_PATH } from '@/shared/config/site';

/**
 * 카카오 JS SDK v2.8.2(2026-08-06 릴리스).
 * integrity는 배포 파일에서 직접 계산한 SRI 해시다(sha384, base64).
 * ⚠ 버전을 올릴 때 integrity를 함께 갱신하지 않으면 브라우저가 스크립트를 통째로 차단한다.
 */
export const KAKAO_SDK_SRC = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.2/kakao.min.js';
export const KAKAO_SDK_INTEGRITY =
  'sha384-zt/G7/KfaRQ9dT/QIkS0ujMtzouJqzuSJcXVQu50x0rl/+mD1dc70AeOejVbMD9E';

export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? '';

/**
 * 🔴 값의 출처는 env여야 하고 window.location.origin이면 안 된다.
 * 서버 KAKAO_WEB_REDIRECT_URI·카카오 콘솔 등록값과 문자열이 정확히 같아야 교환이 성립한다.
 * (apex는 www로 307 리다이렉트되므로 www 고정)
 */
export const KAKAO_REDIRECT_URI =
  process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ?? `https://www.trackareer.com${ACCOUNT_DELETE_PATH}`;

/**
 * '카카오계정과 함께 로그아웃'(kauth /oauth/logout)은 client_id로 REST API 키만 받는다(JS 키 불가).
 * 브라우저 리다이렉트로만 호출되는 값이라 공개돼도 된다 — 토큰 교환은 서버의 client secret이 막는다.
 * 비어 있으면 로그아웃 버튼을 숨긴다.
 */
export const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? '';
export const KAKAO_LOGOUT_URL = 'https://kauth.kakao.com/oauth/logout';
/**
 * 🔴 로그아웃이 끝나면 사이트 홈으로 보낸다. 카카오 콘솔 '로그아웃 리다이렉트 URI'에 이 문자열 그대로 등록한다
 * (운영 https://www.trackareer.com, DEV http://localhost:3000 — 끝 슬래시 없음).
 * SITE_URL은 로컬에서도 운영값으로 고정이라, 환경별로 갈리는 로그인 리다이렉트의 origin을 쓴다.
 * env가 빈 문자열이면 new URL이 모듈 로드 중에 던져 페이지가 통째로 죽으므로 가드한다.
 */
export const KAKAO_LOGOUT_REDIRECT_URI = URL.canParse(KAKAO_REDIRECT_URI)
  ? new URL(KAKAO_REDIRECT_URI).origin
  : 'https://www.trackareer.com';

export const APP_API_URL = (
  process.env.NEXT_PUBLIC_APP_API_URL ?? 'https://app-api.trackareer.com'
).replace(/\/$/, '');

export const STATE_STORAGE_KEY = 'trackareer.account-delete.state';

/**
 * 앱 2.0 계정 삭제 화면(AccountDeleteScreen)과 같은 여섯 개 · 같은 문구.
 * 한 개만 고르고 건너뛸 수 있다. value는 서버 enum(WithdrawalReasonType) 그대로.
 */
export const WITHDRAWAL_REASONS = [
  { value: 'JOB_SUCCESS', label: '취업에 성공해서 더 필요하지 않아요' },
  { value: 'FEATURES_LACKING', label: '원하는 기능이 없어요' },
  { value: 'COMPLEX_OR_INCONVENIENT', label: '쓰기 불편해요' },
  { value: 'NOTIFICATION_BURDEN', label: '알림이 부담스러워요' },
  { value: 'USING_OTHER_SERVICE', label: '다른 서비스를 쓰고 있어요' },
  { value: 'ETC', label: '기타' },
] as const;

export type WithdrawalReason = (typeof WITHDRAWAL_REASONS)[number]['value'];

export const ETC_REASON: WithdrawalReason = 'ETC';
/** 서버 허용 길이(기타 사유). 2.0부터 비워도 된다 */
export const ETC_MAX_LENGTH = 2000;
