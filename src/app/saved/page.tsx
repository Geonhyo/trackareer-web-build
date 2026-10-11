import type { Metadata } from 'next';
import { SavedRecruitmentList } from './SavedRecruitmentList';

export const metadata: Metadata = {
  title: '관심 공고',
  description: '저장한 신입·인턴 채용 공고를 마감이 가까운 순으로 모아 봅니다.',
  alternates: { canonical: '/saved' },
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <div className="gutter">
      <section className="sec" style={{ paddingBottom: 'var(--x12)' }}>
        <SavedRecruitmentList />
      </section>
    </div>
  );
}
