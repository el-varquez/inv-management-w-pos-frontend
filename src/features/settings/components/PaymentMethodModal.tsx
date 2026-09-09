import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import type { PaymentMethod } from '../../../types';
import {
  CASH_METHOD_ID,
  type CreatePaymentMethodPayload,
  type UpdatePaymentMethodPayload,
} from '../services/paymentMethodsService';

interface PaymentMethodModalProps {
  method: PaymentMethod | null;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onCreate: (payload: CreatePaymentMethodPayload) => Promise<boolean>;
  onUpdate: (id: string, payload: UpdatePaymentMethodPayload) => Promise<boolean>;
}

export const PaymentMethodModal = ({
  method,
  saving,
  saveError,
  onClose,
  onCreate,
  onUpdate,
}: PaymentMethodModalProps) => {
  const adding = method === null;
  const isCash = method?.id === CASH_METHOD_ID;

  const [name, setName] = useState(method?.name ?? '');
  const [requiresReference, setRequiresReference] = useState(
    method?.requiresReference ?? false
  );
  const [isActive, setIsActive] = useState(method?.isActive ?? true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = adding
      ? await onCreate({
          name: name.trim(),
          requiresReference,
        })
      : await onUpdate(method.id, {
          name: name.trim(),
          requiresReference,
          isActive: isCash ? true : isActive,
        });
    if (ok) onClose();
  };

  return (
    <Modal
      title={adding ? 'Add payment method' : 'Edit payment method'}
      subtitle={
        adding
          ? 'It appears at the register as soon as it is saved.'
          : 'Renaming is safe — closed shift and day reads keep the name they were frozen with.'
      }
      onClose={onClose}
    >
      <form onSubmit={submit}>
        {saveError && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {saveError}
          </div>
        )}

        <div className="field">
          <label htmlFor="method-name">Name</label>
          <input
            id="method-name"
            className="input"
            type="text"
            maxLength={40}
            autoComplete="off"
            placeholder="e.g. Bank transfer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-row">
          <div className="setting-copy">
            <div className="setting-name" id="method-ref-label">
              Requires a reference number
            </div>
            <p className="setting-desc">
              The register asks for a reference before completing the sale.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={requiresReference}
            aria-labelledby="method-ref-label"
            className={`switch${requiresReference ? ' switch-on' : ''}`}
            onClick={() => setRequiresReference(!requiresReference)}
          >
            <span className="switch-knob" />
          </button>
        </div>

        {!adding && (
          <div className="modal-row">
            <div className="setting-copy">
              <div className="setting-name" id="method-active-label">
                Active
              </div>
              <p className="setting-desc">
                {isCash
                  ? 'Cash can’t be turned off.'
                  : 'Off hides it from new sales at the register. Every past sale keeps it.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-labelledby="method-active-label"
              className={`switch${isActive ? ' switch-on' : ''}`}
              disabled={isCash}
              onClick={() => setIsActive(!isActive)}
            >
              <span className="switch-knob" />
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {adding ? 'Add method' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
