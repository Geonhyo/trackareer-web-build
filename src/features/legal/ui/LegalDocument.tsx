import Link from 'next/link';
import type { ReactNode } from 'react';
import { getPreviousVersions, LEGAL_DOCS, legalDocPath } from '../content';
import type { LegalBlock, LegalDoc, LegalList, LegalTable } from '../model/types';
import styles from './LegalDocument.module.css';

/** `**굵게**`와 `[글자](URL)`만 해석한다. 그 밖의 마크다운은 글자 그대로 둔다. */
const INLINE = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

function LegalText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const [, bold, label, href] = match;
    nodes.push(
      bold !== undefined ? (
        <b key={index}>{bold}</b>
      ) : (
        <a
          key={index}
          href={href}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      ),
    );
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

function List({ list }: { list: LegalList }) {
  const Tag = list.type;
  return (
    <Tag className={styles[list.type]}>
      {list.items.map((item, i) =>
        typeof item === 'string' ? (
          <li key={i}>
            <LegalText text={item} />
          </li>
        ) : (
          <li key={i}>
            <LegalText text={item.text} />
            <List list={item.sub} />
          </li>
        ),
      )}
    </Tag>
  );
}

function Table({ table }: { table: LegalTable }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {table.head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  <LegalText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2>{block.text}</h2>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'p':
      return (
        <p>
          <LegalText text={block.text} />
        </p>
      );
    case 'table':
      return <Table table={block} />;
    default:
      return <List list={block} />;
  }
}

const formatDate = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

/** 현재 버전이면 이전 버전 링크를, 이전 버전이면 현재 버전으로 가는 안내를 보여 준다 */
function VersionNav({ doc }: { doc: LegalDoc }) {
  if (doc.effectiveUntil) {
    return (
      <p className={styles.archived}>
        {formatDate(doc.effectiveUntil)}까지 적용된 이전 버전입니다.{' '}
        <Link href={legalDocPath(doc.slug)}>현재 버전 보기</Link>
      </p>
    );
  }
  const previous = getPreviousVersions(doc.slug);
  if (!previous.length) return null;
  return (
    <p className={styles.versions}>
      이전 버전:{' '}
      {previous.map((old, i) => (
        <span key={old.version}>
          {i > 0 ? ', ' : null}
          <Link href={legalDocPath(old.slug, old.version)}>
            {old.version} ({formatDate(old.effectiveDate)} ~ {formatDate(old.effectiveUntil ?? '')})
          </Link>
        </span>
      ))}
    </p>
  );
}

/**
 * 약관 문서 페이지. 앱이 외부 브라우저·웹뷰로 여는 화면이므로 서버에서 전부 렌더한다.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className={styles.page}>
      <header className={styles.head}>
        <h1>{doc.title}</h1>
        <p>
          시행일 {formatDate(doc.effectiveDate)} · 버전 {doc.version}
        </p>
        <VersionNav doc={doc} />
      </header>

      <div className={styles.body}>
        {doc.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>

      <nav className={styles.others} aria-label="다른 약관">
        {LEGAL_DOCS.filter((other) => other.slug !== doc.slug).map((other) => (
          <Link key={other.slug} href={legalDocPath(other.slug)}>
            {other.title}
          </Link>
        ))}
      </nav>
    </article>
  );
}
