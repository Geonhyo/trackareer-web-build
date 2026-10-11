/**
 * 약관 본문 블록. 문장 안에서는 `**굵게**`와 `[글자](URL)`만 쓴다(LegalText가 해석).
 */
export type LegalList = { type: 'ol' | 'ul'; items: LegalListItem[] };
export type LegalListItem = string | { text: string; sub: LegalList };
export type LegalBlock = { type: 'h2' | 'h3' | 'p'; text: string } | LegalList;

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
  blocks: LegalBlock[];
}
