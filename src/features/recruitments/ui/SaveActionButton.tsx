'use client';

import { useSaved } from '@/features/saved/ui/SavedProvider';

/** 상세 사이드카드의 관심 등록 버튼. */
export function SaveActionButton({ recruitmentId }: { recruitmentId: number }) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(recruitmentId);

  return (
    <button
      type="button"
      className="btnLg ghost"
      aria-pressed={saved}
      onClick={() => void toggleSave(recruitmentId)}
    >
      {saved ? '관심 등록됨 ★' : '관심 등록 ☆'}
    </button>
  );
}
