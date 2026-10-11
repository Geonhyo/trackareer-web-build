import type { LegalDoc, LegalDocSlug } from '../model/types';
import { marketingNotification } from './marketingNotification';
import { privacyMarketing } from './privacyMarketing';
import { privacyPolicy } from './privacyPolicy';
import { termsOfService } from './termsOfService';

/** 표시·링크 순서. 경로 `/docs/{slug}`는 앱 env(약관 4종 URL)가 그대로 가리키므로 slug를 바꾸지 않는다. */
export const LEGAL_DOCS: LegalDoc[] = [
  termsOfService,
  privacyPolicy,
  privacyMarketing,
  marketingNotification,
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}

export function legalDocPath(slug: LegalDocSlug): string {
  return `/docs/${slug}`;
}
