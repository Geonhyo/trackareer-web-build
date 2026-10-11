'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/features/auth/ui/SessionProvider';
import { Wordmark } from './Wordmark';
import styles from './SiteHeader.module.css';

const NAV_ITEMS = [
  { href: '/', label: '신입/인턴 공고' },
  { href: '/calendar', label: '마감 캘린더' },
  { href: '/saved', label: '관심 공고' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { status, user, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // 경로가 바뀌면 모바일 메뉴를 닫는다 (렌더 중 파생 — effect가 필요 없다)
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const isCurrent = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/recruitments') : pathname === href;

  return (
    <header className={styles.hdr}>
      <Link href="/" aria-label="트래커리어 홈">
        <Wordmark className={styles.wm} />
      </Link>

      <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.right}>
        {status === 'authenticated' && user ? (
          <>
            <span className={styles.who}>{user.nickname}님</span>
            <button type="button" className={styles.ghost} onClick={() => void signOut()}>
              로그아웃
            </button>
          </>
        ) : null}
        {status === 'unauthenticated' ? (
          <Link href="/login" className={styles.login}>
            로그인
          </Link>
        ) : null}
      </div>

      <button
        type="button"
        className={styles.menuBtn}
        aria-label="메뉴"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>
    </header>
  );
}
