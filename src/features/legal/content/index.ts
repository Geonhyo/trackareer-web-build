import type { LegalDoc, LegalDocSlug } from '../model/types';
import { marketingNotificationV1 } from './archive/marketingNotificationV1';
import { privacyMarketingV1 } from './archive/privacyMarketingV1';
import { privacyPolicyV1 } from './archive/privacyPolicyV1';
import { termsOfServiceV1 } from './archive/termsOfServiceV1';
import { marketingNotification } from './marketingNotification';
import { privacyMarketing } from './privacyMarketing';
import { privacyPolicy } from './privacyPolicy';
import { termsOfService } from './termsOfService';

/** 표시 · 링크 순서. 경로 `/docs/{slug}`는 앱 env(약관 4종 URL)가 그대로 가리키므로 slug를 바꾸지 않는다. */
export const LEGAL_DOCS: LegalDoc[] = [
  termsOfService,
  privacyPolicy,
  privacyMarketing,
  marketingNotification,
];

/** 이전 버전(최신순). 개정 이력을 공개해야 하므로 지우지 않는다. 경로는 `/docs/{slug}/{version}` */
const PREVIOUS_VERSIONS: Record<LegalDocSlug, LegalDoc[]> = {
  'terms-of-service': [termsOfServiceV1],
  'privacy-policy': [privacyPolicyV1],
  'privacy-marketing': [privacyMarketingV1],
  'marketing-notification': [marketingNotificationV1],
};

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}

export function getPreviousVersions(slug: LegalDocSlug): LegalDoc[] {
  return PREVIOUS_VERSIONS[slug];
}

export function getLegalDocVersion(slug: string, version: string): LegalDoc | undefined {
  const current = getLegalDoc(slug);
  if (!current) return undefined;
  return getPreviousVersions(current.slug).find((doc) => doc.version === version);
}

export function legalDocPath(slug: LegalDocSlug, version?: string): string {
  return version ? `/docs/${slug}/${version}` : `/docs/${slug}`;
}
