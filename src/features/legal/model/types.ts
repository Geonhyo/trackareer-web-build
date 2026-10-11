/**
 * 약관 본문 블록. 문장 안에서는 `**굵게**`와 `[글자](URL)`만 쓴다(LegalText가 해석).
 */
export type LegalList = { type: 'ol' | 'ul'; items: LegalListItem[] };
export type LegalListItem = string | { text: string; sub: LegalList };
/** 표. 좁은 화면에서는 가로로 스크롤된다 */
export type LegalTable = { type: 'table'; head: string[]; rows: string[][] };
export type LegalBlock = { type: 'h2' | 'h3' | 'p'; text: string } | LegalList | LegalTable;

export type LegalDocSlug =
  'terms-of-service' | 'privacy-policy' | 'privacy-marketing' | 'marketing-notification';

export interface LegalDoc {
  slug: LegalDocSlug;
  title: string;
  description: string;
  /** 서버 app_setting.termsVersion과 맞춘다 — 동의 기록에 스탬프되는 값 */
  version: string;
  /** YYYY-MM-DD */
  effectiveDate: string;
  /** 이전 버전만. 다음 버전 시행 전날(YYYY-MM-DD) */
  effectiveUntil?: string;
  blocks: LegalBlock[];
}
