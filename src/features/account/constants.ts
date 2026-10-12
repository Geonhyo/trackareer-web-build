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
