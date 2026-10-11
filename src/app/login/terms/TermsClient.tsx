'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/features/auth/ui/SessionProvider';
import type { TermsAgreementInput } from '@/features/auth/service/sessionService';
import { legalDocPath } from '@/features/legal/content';
import type { LegalDocSlug } from '@/features/legal/model/types';
import styles from '../login.module.css';

type AgreementKey = keyof TermsAgreementInput;

const ITEMS: { key: AgreementKey; label: string; required: boolean; doc: LegalDocSlug }[] = [
  { key: 'termsOfServiceAgreed', label: '이용약관 동의', required: true, doc: 'terms-of-service' },
  {
    key: 'privacyPolicyAgreed',
    label: '개인정보 수집·이용 동의',
    required: true,
    doc: 'privacy-policy',
  },
  {
    key: 'privacyMarketingAgreed',
    label: '마케팅 목적 개인정보 이용 동의',
    required: false,
    doc: 'privacy-marketing',
  },
  {
    key: 'marketingNotificationAgreed',
    label: '마케팅 정보 수신 동의',
    required: false,
    doc: 'marketing-notification',
  },
];

const INITIAL: TermsAgreementInput = {
  termsOfServiceAgreed: false,
  privacyPolicyAgreed: false,
  privacyMarketingAgreed: false,
  marketingNotificationAgreed: false,
};

export function TermsClient({ next }: { next: string }) {
  const router = useRouter();
  const { completeSignup } = useSession();
  const [agreed, setAgreed] = useState<TermsAgreementInput>(INITIAL);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = ITEMS.every((item) => agreed[item.key]);
  const requiredMet = ITEMS.filter((item) => item.required).every((item) => agreed[item.key]);

  const toggleAll = () => {
    const checkAll = !allChecked;
    setAgreed({
      termsOfServiceAgreed: checkAll,
      privacyPolicyAgreed: checkAll,
      privacyMarketingAgreed: checkAll,
      marketingNotificationAgreed: checkAll,
    });
  };

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await completeSignup(agreed);
      router.push(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '가입에 실패했어요.');
      setPending(false);
    }
  };

  return (
    <div className="center">
      <h2>
        약관에 동의하면
        <br />
        가입이 끝나요
      </h2>
      <p className="lede">필수 항목에 동의해야 서비스를 이용할 수 있어요.</p>

      <div className={styles.agreements}>
        <label className={`${styles.row} ${styles.all}`}>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          <span>전체 동의</span>
        </label>

        {ITEMS.map((item) => (
          <label key={item.key} className={styles.row}>
            <input
              type="checkbox"
              checked={agreed[item.key]}
              onChange={(event) =>
                setAgreed((current) => ({ ...current, [item.key]: event.target.checked }))
              }
            />
            <span className={item.required ? styles.required : styles.optional}>
              {item.required ? '[필수]' : '[선택]'}
            </span>
            <span>{item.label}</span>
            <Link href={legalDocPath(item.doc)} target="_blank" className={styles.view}>
              보기
            </Link>
          </label>
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button
        type="button"
        className={`btnLg brand ${styles.submit}`}
        disabled={!requiredMet || pending}
        onClick={() => void submit()}
      >
        {pending ? '가입 중…' : '동의하고 시작하기'}
      </button>
    </div>
  );
}
