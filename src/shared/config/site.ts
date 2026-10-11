/** 사이트 전역 상수. 구 trackareer-front의 값을 그대로 승계한다. */
export const SITE_NAME = '트래커리어';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.trackareer.com';
/** 사용자 문의(이용 · 계정 · 개인정보) */
export const SUPPORT_EMAIL = 'support@trackareer.com';
/** 광고 · 제휴 · 채용공고 등록 등 비즈니스 문의 */
export const BUSINESS_EMAIL = 'business@trackareer.com';

export const APP_STORE_URL = 'https://apps.apple.com/app/id6770530325';
export const ANDROID_WAITLIST_FORM_URL = 'https://forms.gle/CB2onWj4K2osn1RK8';
/** 안드로이드 출시 후 채우면 앱 다운로드 안내가 플레이스토어로 연결된다 */
export const PLAY_STORE_URL = '';

/**
 * 공고 목록 · 상세 · 마감 캘린더 · 관심 공고 · 로그인.
 * 아직 목업 데이터라 끄고, 그동안 홈은 앱 소개(다운로드) 화면으로 둔다. 실제 데이터가 붙으면 켠다.
 */
export const RECRUITMENT_CATALOG_ENABLED = false;

export const APP_DOWNLOAD_PATH = '/app';
