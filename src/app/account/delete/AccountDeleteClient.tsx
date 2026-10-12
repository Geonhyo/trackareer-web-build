'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import {
  ETC_MAX_LENGTH,
  ETC_REASON,
  KAKAO_JS_KEY,
  KAKAO_LOGOUT_REDIRECT_URI,
  KAKAO_LOGOUT_URL,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_API_KEY,
  KAKAO_SDK_INTEGRITY,
  KAKAO_SDK_SRC,
  STATE_STORAGE_KEY,
  WITHDRAWAL_REASONS,
  type WithdrawalReason,
} from '@/features/account/constants';
import {
  exchangeCode,
  requestDeletion,
  saveWithdrawalReason,
  type ApiFailure,
} from '@/features/account/service/accountDeleteApi';
import { SUPPORT_EMAIL } from '@/shared/config/site';
import styles from './accountDelete.module.css';

type Screen =
  | { kind: 'idle' }
  | { kind: 'exchanging' }
  | { kind: 'reasons'; accessToken: string; account: string }
  | { kind: 'done'; willBeDeletedAt: string }
  | { kind: 'pending'; willBeDeletedAt?: string }
  | { kind: 'notice'; title: string; message: string; retry: 'kakao' | 'email' };

const EMAIL_NOTICE_TITLE = '이메일 정보가 필요해요';

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default function AccountDeleteClient() {
  const [screen, setScreen] = useState<Screen>({ kind: 'idle' });
  const [reason, setReason] = useState<WithdrawalReason | null>(null);
  const [etcText, setEtcText] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // 🔴 복귀 처리 전체를 한 번만 — 교환만 가드하면 StrictMode 2회차가 state 대조에서
  // 이미 삭제된 저장값을 보고 정상 흐름을 차단 화면으로 떨어뜨린다.
  const handledReturn = useRef(false);

  const notice = (title: string, message: string, retry: 'kakao' | 'email' = 'kakao') =>
    setScreen({ kind: 'notice', title, message, retry });

  const startKakao = (scope?: string) => {
    const kakao = window.Kakao;
    if (!KAKAO_JS_KEY || !kakao) {
      notice(
        '지금은 로그인할 수 없어요',
        '잠시 후 다시 시도해 주세요. 계속 실패하면 아래 메일로 삭제를 요청하실 수 있어요.',
        'email',
      );
      return;
    }
    if (!kakao.isInitialized()) kakao.init(KAKAO_JS_KEY);

    const state = crypto.randomUUID();
    sessionStorage.setItem(STATE_STORAGE_KEY, state);
    kakao.Auth.authorize({ redirectUri: KAKAO_REDIRECT_URI, state, ...(scope ? { scope } : {}) });
  };

  /**
   * 공용 PC 대비 선택지. 우리 세션은 서버가 이미 모두 끊었고, 이건 브라우저의 카카오계정 로그인까지 끊는다.
   * 끝나면 카카오가 사이트 홈(KAKAO_LOGOUT_REDIRECT_URI)으로 보낸다.
   */
  const logoutKakao = () => {
    const url = new URL(KAKAO_LOGOUT_URL);
    url.search = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY,
      logout_redirect_uri: KAKAO_LOGOUT_REDIRECT_URI,
    }).toString();
    window.location.assign(url);
  };

  const onFailure = (failure: ApiFailure) => {
    // 🔴 401은 두 가지 뜻이다(삭제 대기 / 코드 교환 실패). details 유무로 가른다 —
    // status로 가르면 교환 실패가 "삭제 예정일 미상" 정보 화면이 되어
    // 하지도 않은 삭제가 접수된 것처럼 보인다.
    if (failure.status === 401 && failure.details) {
      setScreen({ kind: 'pending', willBeDeletedAt: failure.details.willBeDeletedAt });
      return;
    }
    if (failure.status === 401) {
      notice('다시 로그인해 주세요', '로그인 정보가 만료되었어요. 처음부터 다시 시도해 주세요.');
      return;
    }
    if (failure.code === 'EMAIL_NOT_PROVIDED') {
      setScreen({ kind: 'notice', title: EMAIL_NOTICE_TITLE, message: '', retry: 'kakao' });
      return;
    }
    // 이 카카오 이메일로 Apple 계정이 가입돼 있다. 웹은 아직 Apple 로그인을 받지 않는다
    if (failure.code === 'EMAIL_REGISTERED_WITH_OTHER_PROVIDER') {
      notice(
        'Apple로 가입된 계정이에요',
        'Apple 계정은 앱의 마이페이지 > 계정 관리 > 계정 삭제에서 삭제해 주세요.',
      );
      return;
    }
    notice(
      '요청을 처리하지 못했어요',
      '잠시 후 다시 시도해 주세요. 계속 실패하면 아래 메일로 삭제를 요청하실 수 있어요.',
      'email',
    );
  };

  /**
   * 카카오 인가 복귀 처리. 마운트 시 URL 쿼리(외부 시스템)를 한 번 읽어 화면을 정한다.
   * 쿼리는 SSR 시점에 알 수 없어 렌더 중 파생이 불가능하므로 effect에서 setState 한다.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (handledReturn.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const returnedState = params.get('state');
    const error = params.get('error');
    if (!code && !error) return;

    handledReturn.current = true;
    // 🔴 교환 전에 쿼리를 통째로 지운다. code·state·error가 URL에 남으면
    // 새로고침 때마다 1회용 코드를 다시 쓰거나 state 부재 화면이 뜬다.
    window.history.replaceState(null, '', window.location.pathname);

    const savedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    sessionStorage.removeItem(STATE_STORAGE_KEY);

    if (error) {
      // ⚠ error_description은 외부 입력이라 그대로 렌더하지 않는다.
      notice('로그인이 취소되었어요', '계정 삭제를 요청하려면 카카오 로그인이 필요해요.');
      return;
    }
    if (!savedState) {
      // 공격이 아니라 정상 사용자일 수 있다(카카오톡 간편로그인 후 다른 탭으로 복귀 등).
      notice(
        '다시 시도해 주세요',
        '로그인 정보가 유지되지 않았어요. 같은 브라우저 창에서 다시 시도해 주세요.',
      );
      return;
    }
    if (savedState !== returnedState) {
      notice(
        '요청이 확인되지 않았어요',
        '보안을 위해 처리를 중단했어요. 이 페이지를 직접 열어 다시 시도해 주세요.',
      );
      return;
    }
    if (!code) {
      notice('다시 시도해 주세요', '로그인 정보를 받지 못했어요.');
      return;
    }

    setScreen({ kind: 'exchanging' });
    exchangeCode(code)
      .then((result) => {
        if (!result.ok) {
          onFailure(result);
          return;
        }
        if (result.isNewUser) {
          notice(
            '가입 이력이 없어요',
            '이 카카오 계정으로 가입한 내역을 찾지 못했어요. 다른 카카오 계정으로 가입하셨다면 그 계정으로 로그인해 주세요. Apple로 가입하셨다면 앱의 마이페이지 > 계정 관리 > 계정 삭제에서 삭제해 주세요.',
          );
          return;
        }
        setScreen({
          kind: 'reasons',
          accessToken: result.accessToken,
          account: result.user?.email ?? result.user?.nickname ?? '',
        });
      })
      .catch(() =>
        notice('연결에 실패했어요', '네트워크 상태를 확인하고 다시 시도해 주세요.', 'email'),
      );
    // 마운트 시 1회만 — 의존성을 넣으면 1회용 인가 코드를 다시 처리하게 된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 앱과 같이 하나만 고르고, 다시 누르면 해제한다
  const toggleReason = (value: WithdrawalReason) =>
    setReason((current) => (current === value ? null : value));

  /** 사유는 익명 통계용이라 실패해도 삭제 결과를 바꾸지 않는다(앱과 동일) */
  const saveReasonBestEffort = async (accessToken: string) => {
    if (!reason) return;
    await saveWithdrawalReason(
      accessToken,
      reason,
      reason === ETC_REASON ? etcText.trim() || null : null,
    ).catch(() => undefined);
  };

  const onConfirmDelete = async () => {
    if (screen.kind !== 'reasons') return;
    setSubmitting(true);
    setFormError(null);
    try {
      // 앱과 같은 순서: 삭제가 성공해야 사유를 남긴다
      const deleted = await requestDeletion(screen.accessToken);
      if (!deleted.ok) {
        setConfirming(false);
        onFailure(deleted);
        return;
      }
      await saveReasonBestEffort(screen.accessToken);
      setScreen({ kind: 'done', willBeDeletedAt: deleted.willBeDeletedAt });
    } catch {
      setFormError('연결에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const mailTo = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('계정 삭제 요청')}`;

  return (
    <section className={styles.stack}>
      <Script src={KAKAO_SDK_SRC} integrity={KAKAO_SDK_INTEGRITY} crossOrigin="anonymous" />

      {screen.kind === 'idle' ? (
        <button type="button" className={styles.kakaoBtn} onClick={() => startKakao()}>
          카카오로 로그인하고 삭제 요청
        </button>
      ) : null}

      {screen.kind === 'exchanging' ? <p className={styles.muted}>확인 중이에요…</p> : null}

      {screen.kind === 'notice' ? (
        <div className={styles.card}>
          <h2>{screen.title}</h2>
          {screen.title === EMAIL_NOTICE_TITLE ? (
            <>
              <p>
                삭제할 계정을 확인하려면 카카오 이메일 정보가 필요해요. 동의 없이 요청하시려면
                메일로 보내주셔도 됩니다.
              </p>
              <div className={styles.row}>
                <button
                  type="button"
                  className={`${styles.rowBtn} ${styles.kakao}`}
                  onClick={() => startKakao('account_email')}
                >
                  이메일 정보 동의하고 계속
                </button>
                <a className={`${styles.rowBtn} ${styles.outline}`} href={mailTo}>
                  메일로 삭제 요청
                </a>
              </div>
            </>
          ) : (
            <>
              <p>{screen.message}</p>
              <div className={styles.row}>
                <button
                  type="button"
                  className={`${styles.rowBtn} ${styles.kakao}`}
                  onClick={() => startKakao()}
                >
                  카카오로 다시 시도
                </button>
                {screen.retry === 'email' ? (
                  <a className={`${styles.rowBtn} ${styles.outline}`} href={mailTo}>
                    메일로 삭제 요청
                  </a>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      {screen.kind === 'pending' ? (
        <div className={styles.card}>
          <h2>이미 삭제를 요청한 계정이에요</h2>
          <p>
            {screen.willBeDeletedAt
              ? `${formatDate(screen.willBeDeletedAt)}에 탈퇴가 완료될 예정이에요.`
              : '삭제 예정일은 아래 메일로 문의해 주세요.'}{' '}
            그 전까지 앱에서 다시 로그인하면 복구할 수 있어요.
          </p>
        </div>
      ) : null}

      {screen.kind === 'done' ? (
        <div className={`${styles.card} ${styles.filled}`}>
          <h2>삭제 요청이 접수되었어요</h2>
          <p>
            <b>{formatDate(screen.willBeDeletedAt)}</b>에 탈퇴가 완료되고 카카오 연결도 해제됩니다.
            그 전까지 앱에서 다시 로그인하면 복구할 수 있어요.
          </p>
          {KAKAO_REST_API_KEY ? (
            <>
              <p>여러 사람이 함께 쓰는 기기라면 카카오 계정에서도 로그아웃해 주세요.</p>
              <div className={styles.row}>
                <button
                  type="button"
                  className={`${styles.rowBtn} ${styles.outline}`}
                  onClick={logoutKakao}
                >
                  카카오 계정에서도 로그아웃
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {screen.kind === 'reasons' ? (
        <div className={styles.stack}>
          {screen.account ? (
            <p className={styles.muted}>
              삭제할 계정: <b className={styles.account}>{screen.account}</b>
            </p>
          ) : null}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>떠나시는 이유를 알려주세요 (선택)</legend>
            {WITHDRAWAL_REASONS.map((item) => (
              <label key={item.value} className={styles.check}>
                <input
                  type="checkbox"
                  checked={reason === item.value}
                  onChange={() => toggleReason(item.value)}
                />
                {item.label}
              </label>
            ))}
          </fieldset>

          {reason === ETC_REASON ? (
            <textarea
              className={styles.textarea}
              value={etcText}
              onChange={(event) => setEtcText(event.target.value)}
              rows={3}
              maxLength={ETC_MAX_LENGTH}
              placeholder="어떤 점이 아쉬우셨나요?"
            />
          ) : null}

          {formError ? <p className={styles.error}>{formError}</p> : null}

          <button type="button" className={styles.danger} onClick={() => setConfirming(true)}>
            계정 삭제 요청
          </button>
        </div>
      ) : null}

      {confirming && screen.kind === 'reasons' ? (
        <div className={styles.dim} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2>정말 삭제를 요청할까요?</h2>
            <p>
              삭제할 계정: <b>{screen.account}</b>
            </p>
            <p>
              바로 로그인과 알림이 중단되고, 30일 뒤 탈퇴가 완료되며 카카오 연결도 해제돼요. 30일
              안에 앱에서 다시 로그인하면 복구할 수 있고, 그 뒤에는 복구할 수 없어요.
            </p>
            <div className={styles.modalBtns}>
              <button
                type="button"
                className={`${styles.rowBtn} ${styles.outline}`}
                disabled={submitting}
                onClick={() => setConfirming(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={`${styles.rowBtn} ${styles.confirm}`}
                disabled={submitting}
                onClick={() => void onConfirmDelete()}
              >
                {submitting ? '처리 중…' : '삭제 요청'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
