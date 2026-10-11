import Link from 'next/link';
import { getDday, getDdayLabel, getDeadlineText, isExpired } from '@/shared/lib/date';
import { EMPLOYMENT_TYPE_SHORT, type RecruitmentListItem } from '../model/types';
import { SaveStarButton } from './SaveStarButton';
import styles from './RecruitmentCard.module.css';

interface Props {
  item: RecruitmentListItem;
  /** 선택된 직무 — 해당 직무를 뽑는 공고는 그 직무를 카드에 끌어올려 보여준다 */
  highlightCategoryIds?: number[];
}

const ddayToneClass = (deadline: string | null): string => {
  if (isExpired(deadline)) return styles.over;
  const dday = getDday(deadline);
  if (dday === null) return '';
  if (dday <= 3) return styles.urgent;
  if (dday <= 7) return styles.soon;
  return '';
};

export function RecruitmentCard({ item, highlightCategoryIds }: Props) {
  const expired = isExpired(item.deadline);
  const highlighted = highlightCategoryIds?.length
    ? item.roles.filter((role) => highlightCategoryIds.includes(role.jobCategoryId))
    : [];
  const chipRoles = highlighted.length ? highlighted : item.roles;
  // 고른 직무로 들어가면 상세의 해당 직무가 먼저 펼쳐진다
  const href = highlighted.length
    ? `/recruitments/${item.id}?role=${highlighted[0].jobCategoryId}`
    : `/recruitments/${item.id}`;

  return (
    <article className={styles.card}>
      <div
        className={styles.thumb}
        style={{ background: item.company.brandColor, color: item.company.brandTextColor }}
      >
        <span className={styles.nm}>{item.company.name}</span>
        <span className={`${styles.dday} ${ddayToneClass(item.deadline)}`}>
          {getDdayLabel(item.deadline)}
        </span>
        <SaveStarButton
          recruitmentId={item.id}
          className={styles.star}
          activeClassName={styles.on}
        />
      </div>

      <h3 className={styles.title}>
        <Link href={href}>
          {item.company.name}｜{item.title}
        </Link>
      </h3>

      <p className={`${styles.due} ${expired ? styles.over : ''}`}>
        {getDeadlineText(item.deadline, item.deadlineTime)}
      </p>

      <div className={styles.meta}>
        <span className={`tag ${item.employmentType}`}>
          {EMPLOYMENT_TYPE_SHORT[item.employmentType]}
        </span>
        {chipRoles[0] ? (
          <span className={`${styles.jchip} ${highlighted.length ? styles.on : ''}`}>
            {chipRoles[0].name}
          </span>
        ) : null}
        {chipRoles.length > 1 ? (
          <span className={`${styles.jchip} ${styles.more}`}>+{chipRoles.length - 1}</span>
        ) : null}
      </div>

      {highlighted.map((role) => (
        <div key={role.id} className={styles.focus}>
          <b>{role.name}</b>
          <span>{role.summary}</span>
        </div>
      ))}
    </article>
  );
}
