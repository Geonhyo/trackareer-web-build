/**
 * 카카오 JS SDK 중 계정 삭제 페이지가 쓰는 부분만 선언한다.
 * 토큰 교환은 서버(REST 키)가 하므로 프론트는 인가 요청(authorize)만 사용한다.
 */
interface KakaoAuthorizeParams {
  redirectUri: string;
  state?: string;
  scope?: string;
}

interface KakaoSdk {
  init: (jsKey: string) => void;
  isInitialized: () => boolean;
  Auth: {
    authorize: (params: KakaoAuthorizeParams) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

export {};
