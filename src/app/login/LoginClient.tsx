'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/features/auth/ui/SessionProvider';
import { legalDocPath } from '@/features/legal/content';
import type { AuthProvider } from '@/features/auth/service/sessionService';
import styles from './login.module.css';

export function LoginClient({ next }: { next: string }) {
  const router = useRouter();
  const { signIn } = useSession();
  const [pending, setPending] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (provider: AuthProvider) => {
    setPending(provider);
    setError(null);
    try {
      const result = await signIn(provider);
      if (result.status === 'signup_required') {
        router.push(`/login/terms?next=${encodeURIComponent(next)}`);
        return;
      }
      router.push(next);
    } catch {
      setError('로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="center">
      <h2>
        관심 공고를 저장하면
        <br />
        마감일을 놓치지 않아요
      </h2>
      <p className="lede">
        저장한 공고는 마감 캘린더에 모이고, 트래커리어 앱에서 마감 전에 알려드려요.
      </p>

      <div className={styles.oauth}>
        <button
          type="button"
          className={styles.kakao}
          disabled={pending !== null}
          onClick={() => void handleSignIn('kakao')}
        >
          카카오로 계속하기
        </button>
        <button
          type="button"
          className={styles.apple}
          disabled={pending !== null}
          onClick={() => void handleSignIn('apple')}
        >
          Apple로 계속하기
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <p className={styles.terms}>
        계속하면{' '}
        <Link href={legalDocPath('terms-of-service')} target="_blank">
          이용약관
        </Link>
        과{' '}
        <Link href={legalDocPath('privacy-policy')} target="_blank">
          개인정보 처리방침
        </Link>
        에 동의하는 것으로 봐요.
        <br />
        Apple 로그인에서 이메일 가리기를 선택해도 가입할 수 있어요.
      </p>
    </div>
  );
}
