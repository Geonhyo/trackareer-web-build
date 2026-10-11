'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  completeSignup as completeSignupRequest,
  getSession,
  signIn as signInRequest,
  signOut as signOutRequest,
  type AuthProvider,
  type SessionUser,
  type SignInResult,
  type TermsAgreementInput,
} from '../service/sessionService';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionContextValue {
  status: SessionStatus;
  user: SessionUser | null;
  signIn: (provider: AuthProvider) => Promise<SignInResult>;
  completeSignup: (input: TermsAgreementInput) => Promise<void>;
  signOut: () => Promise<void>;
  /** 로그인 상태면 true, 아니면 로그인 화면으로 보내고 false */
  requireLogin: () => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      setUser(session);
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (provider: AuthProvider) => {
    const result = await signInRequest(provider);
    if (result.status === 'authenticated') {
      setUser(result.user);
      setStatus('authenticated');
    }
    return result;
  }, []);

  const completeSignup = useCallback(async (input: TermsAgreementInput) => {
    const session = await completeSignupRequest(input);
    setUser(session);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const requireLogin = useCallback(() => {
    if (user) return true;
    router.push('/login');
    return false;
  }, [router, user]);

  const value = useMemo(
    () => ({ status, user, signIn, completeSignup, signOut, requireLogin }),
    [status, user, signIn, completeSignup, signOut, requireLogin],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession은 SessionProvider 안에서만 쓸 수 있어요');
  return context;
}
