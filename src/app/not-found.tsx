import Link from 'next/link';

export default function NotFound() {
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
