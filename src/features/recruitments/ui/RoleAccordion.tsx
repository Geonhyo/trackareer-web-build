'use client';

import { useState } from 'react';
import { getGroupNameByCategoryId } from '../mock/jobCategories';
import type { RecruitmentRoleDetail } from '../model/types';
import styles from './RoleAccordion.module.css';

interface Props {
  roles: RecruitmentRoleDetail[];
  /** 목록에서 직무를 고르고 들어온 경우 그 직무를 먼저 펼친다 */
  initialOpenCategoryId?: number;
}

export function RoleAccordion({ roles, initialOpenCategoryId }: Props) {
  const initialIndex = initialOpenCategoryId
    ? Math.max(
        0,
        roles.findIndex((role) => role.jobCategoryId === initialOpenCategoryId),
      )
    : 0;
  const [openIndex, setOpenIndex] = useState<number | null>(initialIndex);

  return (
    <>
      {roles.map((role, index) => {
        const open = openIndex === index;
        return (
          <div key={role.id} className={`${styles.role} ${open ? styles.open : ''}`}>
            <button
              type="button"
              className={styles.head}
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className={styles.name}>{role.name}</span>
              <span className={styles.group}>{getGroupNameByCategoryId(role.jobCategoryId)}</span>
              <span className={styles.chev} aria-hidden="true">
                {open ? '▲' : '▼'}
              </span>
            </button>
            {open ? (
              <div className={styles.body}>
                <dl>
                  <dt>하는 일</dt>
                  <dd>{role.summary}</dd>
                  <dt>주요 업무</dt>
                  <dd>
                    <ul>
                      {role.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </dd>
                </dl>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
