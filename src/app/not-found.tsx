import Link from 'next/link';
import { RECRUITMENT_CATALOG_ENABLED } from '@/shared/config/site';

export default function NotFound() {
  if (!RECRUITMENT_CATALOG_ENABLED) {
    return (
      <div className="center">
        <h2>찾는 페이지가 없어요</h2>
        <p className="lede">주소가 바뀌었거나 없어진 페이지예요.</p>
        <div style={{ marginTop: 'var(--x8)', display: 'grid', gap: 'var(--x2_5)' }}>
          <Link href="/" className="btnLg brand">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="center">
      <h2>
        찾는 공고가 없어요
        <br />
        마감돼 내려갔을 수 있어요
      </h2>
      <p className="lede">지금 지원할 수 있는 공고를 다시 살펴보세요.</p>
      <div style={{ marginTop: 'var(--x8)', display: 'grid', gap: 'var(--x2_5)' }}>
        <Link href="/" className="btnLg brand">
          공고 목록으로
        </Link>
      </div>
    </div>
  );
}
