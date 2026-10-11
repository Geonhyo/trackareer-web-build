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

/** 서버 enum과 1:1. 라벨은 앱 탈퇴 화면과 동일 문구. */
export const WITHDRAWAL_REASONS = [
  { value: 'JOB_SUCCESS', label: '취업에 성공하여 필요가 없어졌어요' },
  { value: 'FEATURES_LACKING', label: '원하는 기능이 부족했어요' },
  { value: 'COMPLEX_OR_INCONVENIENT', label: '사용하기 복잡하거나 불편했어요' },
  { value: 'NOT_HELPFUL', label: '생각보다 서비스가 도움이 되지 않았어요' },
  { value: 'STAGE_MISMATCH', label: '서비스가 제 취업 단계와 맞지 않았어요' },
  { value: 'NOTIFICATION_BURDEN', label: '알림이 부담스러웠어요' },
  { value: 'USING_OTHER_SERVICE', label: '다른 서비스를 사용하고 있어요' },
  { value: 'ETC', label: '기타' },
] as const;

export const ETC_REASON = 'ETC';
export const ETC_MIN_LENGTH = 6;
