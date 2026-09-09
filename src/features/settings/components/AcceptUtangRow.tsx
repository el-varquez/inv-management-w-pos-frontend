import { useState } from 'react';
import { peso } from '../../../lib/format';
import type { UtangOutstanding } from '../../../types';

interface Props {
  acceptUtang: boolean;
  reminderDays: number;
  outstanding: UtangOutstanding | null;
  disabled: boolean;
  onToggle: (next: boolean) => void;
  onReminderDaysSave: (days: number) => Promise<boolean>;
}

export const AcceptUtangRow = ({
  acceptUtang,
  reminderDays,
  outstanding,
  disabled,
  onToggle,
  onReminderDaysSave,
}: Props) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const shown = draft ?? String(reminderDays);

  const handleBlur = async () => {
    if (draft === null) return;
    const parsed = Number(draft.trim());
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 365) {
      setFieldError('Enter a whole number of days from 1 to 365.');
      return;
    }
    setFieldError(null);
    if (parsed === reminderDays) {
      setDraft(null);
      return;
    }
    const ok = await onReminderDaysSave(parsed);
    if (ok) {
      setDraft(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="setting-row">
      <div className="setting-copy">
        <div className="setting-name" id="accept-utang-label">
          Accept utang
        </div>
        <p className="setting-desc">
          Lets the register charge a suki on credit and this admin record
          collections. Off hides utang everywhere — balances are kept.
        </p>
        {!acceptUtang && outstanding && outstanding.owingCount > 0 && (
          <p className="setting-desc" style={{ color: 'var(--gold)' }}>
            Utang is off · {peso.format(outstanding.totalOwed)} outstanding
            across {outstanding.owingCount}{' '}
            {outstanding.owingCount === 1 ? 'suki' : 'sukis'}
          </p>
        )}
      </div>
      <div className="setting-control setting-control-utang">
        <div className="utang-control-row">
          {acceptUtang && (
            <span className="reminder-inline">
              Remind after
              <input
                className="input tnum reminder-days"
                type="number"
                min="1"
                max="365"
                step="1"
                inputMode="numeric"
                aria-label="Reminder days"
                disabled={disabled}
                value={shown}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setFieldError(null);
                  setSaved(false);
                }}
                onBlur={handleBlur}
              />
              days without a payment
            </span>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={acceptUtang}
            aria-labelledby="accept-utang-label"
            className={`switch${acceptUtang ? ' switch-on' : ''}`}
            disabled={disabled}
            onClick={() => onToggle(!acceptUtang)}
          >
            <span className="switch-knob" />
          </button>
        </div>
        {fieldError && <p className="field-hint text-red">{fieldError}</p>}
        {!fieldError && saved && <p className="setting-saved">Saved</p>}
      </div>
    </div>
  );
};
