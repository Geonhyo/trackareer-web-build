'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/features/auth/ui/SessionProvider';
import { getSavedIds, saveRecruitment, unsaveRecruitment } from '../service/savedService';

interface SavedContextValue {
  savedIds: ReadonlySet<number>;
  isReady: boolean;
  isSaved: (recruitmentId: number) => boolean;
  /** 비로그인이면 로그인 화면으로 보내고 아무것도 하지 않는다 */
  toggleSave: (recruitmentId: number) => Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

const EMPTY: ReadonlySet<number> = new Set();

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { status, requireLogin } = useSession();
  const [loaded, setLoaded] = useState<ReadonlySet<number> | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let alive = true;
    getSavedIds().then((ids) => {
      if (alive) setLoaded(new Set(ids));
    });
    return () => {
      alive = false;
    };
  }, [status]);

  // 비로그인은 항상 빈 집합 — 로그아웃 직후 이전 사용자의 목록이 남지 않는다
  const savedIds = status === 'authenticated' ? (loaded ?? EMPTY) : EMPTY;
  const isReady = status === 'unauthenticated' || (status === 'authenticated' && loaded !== null);

  const isSaved = useCallback((recruitmentId: number) => savedIds.has(recruitmentId), [savedIds]);

  const toggleSave = useCallback(
    async (recruitmentId: number) => {
      if (!requireLogin()) return;
      const next = savedIds.has(recruitmentId)
        ? await unsaveRecruitment(recruitmentId)
        : await saveRecruitment(recruitmentId);
      setLoaded(new Set(next));
    },
    [requireLogin, savedIds],
  );

  const value = useMemo(
    () => ({ savedIds, isReady, isSaved, toggleSave }),
    [savedIds, isReady, isSaved, toggleSave],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSaved는 SavedProvider 안에서만 쓸 수 있어요');
  return context;
}
