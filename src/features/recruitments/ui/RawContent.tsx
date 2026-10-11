'use client';

import { useState } from 'react';
import styles from './RawContent.module.css';

/** 서버에서 정제를 마친 HTML만 받는다. */
export function RawContent({ html }: { html: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`${styles.wrap} ${open ? styles.open : ''}`}>
        <div className={styles.raw} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className={styles.more}>
        <button type="button" className="btn neutral" onClick={() => setOpen((value) => !value)}>
          {open ? '접기 ▴' : '공고 원문 전체 보기 ▾'}
        </button>
      </div>
    </>
  );
}
