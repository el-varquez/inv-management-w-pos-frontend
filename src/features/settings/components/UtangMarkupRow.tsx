import { useState } from 'react';

interface Props {
  value: number | null;
  disabled: boolean;
  onSave: (value: number) => Promise<boolean>;
}

export const UtangMarkupRow = ({ value, disabled, onSave }: Props) => {
  const [draft, setDraft] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const stored = value === null ? '' : value.toFixed(2);
  const shown = draft ?? stored;

  const handleBlur = async () => {
    if (draft === null) return;

    const trimmed = draft.trim();
    const parsed = trimmed === '' ? 0 : Number(trimmed);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setFieldError('Enter an amount of 0 or more.');
      return;
    }
    if (Math.abs(parsed * 100 - Math.round(parsed * 100)) > 1e-9) {
      setFieldError('Use at most 2 decimal places.');
      return;
    }

    setFieldError(null);

    if (parsed === value) {
      setDraft(null);
      return;
    }

    const ok = await onSave(parsed);
    if (ok) {
      setDraft(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="setting-row">
      <div className="setting-copy">
        <div className="setting-name" id="utang-markup-label">
          Default utang markup
        </div>
        <p className="setting-desc">
          Added per unit when a sale is taken on utang. Items can override this.
        </p>
      </div>
      <div className="setting-control">
        <div className="peso-input">
          <span className="peso-input-sign" aria-hidden="true">
            ₱
          </span>
          <input
            className="input tnum"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            aria-labelledby="utang-markup-label"
            disabled={disabled}
            value={shown}
            onChange={(e) => {
              setDraft(e.target.value);
              setFieldError(null);
              setSaved(false);
            }}
            onBlur={handleBlur}
          />
        </div>
        {fieldError && <p className="field-hint text-red">{fieldError}</p>}
        {!fieldError && saved && <p className="setting-saved">Saved</p>}
      </div>
    </div>
  );
};
