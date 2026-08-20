import { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { PasswordInput } from '../../../components/PasswordInput';
import { daysService } from '../../../services/daysService';
import { getApiErrorMessage } from '../../../services/apiError';
import { peso, formatTime } from '../../../lib/format';
import type { DaySummary } from '../../../types';

const isToday = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString();

export const UndoZReadSection = () => {
  const [day, setDay] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [undone, setUndone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const latest = await daysService.getLatest();
        if (!cancelled) setDay(latest);
      } catch (err) {
        if (!cancelled)
          setLoadError(getApiErrorMessage(err, 'Failed to load the latest day.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const undoable = Boolean(day && day.isClosed && isToday(day.openedAt));

  const openConfirm = () => {
    setUsername('');
    setPassword('');
    setReason('');
    setSubmitError(null);
    setConfirming(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!day) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await daysService.reopen(day.id, username, password, reason);
      const latest = await daysService.getLatest();
      setDay(latest);
      setConfirming(false);
      setUndone(true);
      window.setTimeout(() => setUndone(false), 2000);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to undo the Z read.'));
    } finally {
      setSubmitting(false);
    }
  };

  const description = loading
    ? 'Loading the latest day…'
    : loadError
      ? loadError
      : undoable && day
        ? `Day #${day.number} — closed ${day.closedAt ? formatTime(day.closedAt) : '—'}${
            day.countedCash !== null ? ` · ${peso.format(day.countedCash)} counted` : ''
          }`
        : 'No Z read today to undo.';

  return (
    <>
      <div className="setting-row">
        <div className="setting-copy">
          <div className="setting-name text-red">Undo Z read</div>
          <p className="setting-desc">{description}</p>
        </div>
        {undoable && day && (
          <div className="setting-control">
            <button type="button" className="btn btn-danger" onClick={openConfirm}>
              Undo Z read
            </button>
            {undone && <p className="setting-saved">Z read undone</p>}
          </div>
        )}
      </div>

      {confirming && day && (
        <Modal
          title="Undo Z read"
          subtitle={`Day #${day.number}`}
          onClose={() => setConfirming(false)}
        >
          <form onSubmit={handleSubmit}>
            <p className="modal-summary">
              This reopens day #{day.number} and discards its Z read. Not normal
              — an admin must confirm.
            </p>

            {submitError && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">⚠</span>
                {submitError}
              </div>
            )}

            <div className="field">
              <label htmlFor="undo-z-username">Admin username</label>
              <input
                id="undo-z-username"
                className="input"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label htmlFor="undo-z-password">Admin password</label>
              <PasswordInput
                id="undo-z-password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="undo-z-reason">Reason</label>
              <input
                id="undo-z-reason"
                className="input"
                type="text"
                maxLength={256}
                placeholder="Closed the day by mistake"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submitting}>
                {submitting ? <span className="spinner" aria-hidden="true" /> : null}
                {submitting ? 'Undoing…' : 'UNDO Z READ'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
