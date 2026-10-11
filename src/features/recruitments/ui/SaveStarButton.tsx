'use client';

import { useSaved } from '@/features/saved/ui/SavedProvider';

interface Props {
  recruitmentId: number;
  className?: string;
  activeClassName?: string;
}

/**
 * 관심 공고 토글.
 * 저장은 앱의 개인 공고 생성과 같은 동작이라, 비로그인 상태에서는 로그인 화면으로 보낸다.
 */
export function SaveStarButton({ recruitmentId, className, activeClassName }: Props) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(recruitmentId);

  return (
    <button
      type="button"
      className={`${className ?? ''} ${saved ? (activeClassName ?? '') : ''}`.trim()}
      aria-pressed={saved}
      aria-label={saved ? '관심 공고에서 빼기' : '관심 공고로 저장'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleSave(recruitmentId);
      }}
    >
      {saved ? '★' : '☆'}
    </button>
  );
}
