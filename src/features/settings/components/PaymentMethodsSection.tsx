import { useState } from 'react';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { CASH_METHOD_ID } from '../services/paymentMethodsService';
import { PaymentMethodModal } from './PaymentMethodModal';
import type { PaymentMethod } from '../../../types';

type ModalState = { open: false } | { open: true; method: PaymentMethod | null };

export const PaymentMethodsSection = () => {
  const {
    methods,
    loading,
    error,
    saving,
    saveError,
    clearSaveError,
    create,
    update,
  } = usePaymentMethods();

  const [modal, setModal] = useState<ModalState>({ open: false });

  const openModal = (method: PaymentMethod | null) => {
    clearSaveError();
    setModal({ open: true, method });
  };

  const toggleActive = (method: PaymentMethod) => {
    if (method.id === CASH_METHOD_ID) return;
    update(method.id, {
      name: method.name,
      requiresReference: method.requiresReference,
      isActive: !method.isActive,
    });
  };

  const inactiveInvoice = methods
    .filter((m) => m.type === 'Invoice' && !m.isActive)
    .map((m) => m.name);
  const noActiveInvoice = !methods.some(
    (m) => m.type === 'Invoice' && m.isActive
  );

  return (
    <div className="setting-block">
      <div className="setting-block-head">
        <div className="setting-copy">
          <div className="setting-name">Payment methods</div>
          <p className="setting-desc">
            What the register can accept at checkout. Turning one off hides it
            from new sales — history and reports keep every past sale.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => openModal(null)}
        >
          ＋ Add method
        </button>
      </div>

      {!modal.open && saveError && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {saveError}
        </div>
      )}

      {error ? (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      ) : (
        <div className="method-panel">
          <table className="method-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Type</th>
                <th>Reference</th>
                <th className="mid">Active</th>
                <th className="right" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="method-sub">Loading payment methods…</div>
                  </td>
                </tr>
              ) : (
                methods.map((m) => {
                  const isCash = m.id === CASH_METHOD_ID;
                  return (
                    <tr key={m.id} className={m.isActive ? undefined : 'is-off'}>
                      <td>
                        <div className="method-name">{m.name}</div>
                        {m.isSystem && <div className="method-sub">System</div>}
                      </td>
                      <td>
                        {m.type === 'Invoice' ? (
                          <span className="pill pill-gold">Invoice</span>
                        ) : (
                          <span className="pill pill-muted">Sales</span>
                        )}
                      </td>
                      <td>
                        {m.requiresReference ? (
                          <span className="pill pill-muted">
                            Reference required
                          </span>
                        ) : (
                          <span className="dash">—</span>
                        )}
                      </td>
                      <td className="mid">
                        <span className="switch-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={m.isActive}
                            aria-label={`${m.name} active`}
                            className={`switch${m.isActive ? ' switch-on' : ''}`}
                            disabled={isCash || saving}
                            onClick={() => toggleActive(m)}
                          >
                            <span className="switch-knob" />
                          </button>
                          {isCash && (
                            <span className="switch-hint">
                              Cash can’t be turned off.
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="right">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => openModal(m)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {inactiveInvoice.length > 0 && noActiveInvoice ? (
        <p className="method-foot is-gold">
          {inactiveInvoice.join(', ')} is off — the register takes no new
          charges. Collections on existing balances continue, and the ledger
          stays visible until every suki reaches zero.
        </p>
      ) : (
        <p className="method-foot">
          An <b>Invoice</b> method is charged to a suki’s ledger at utang prices
          and is never counted as sales. Methods are never deleted — turn one
          off instead.
        </p>
      )}

      {modal.open && (
        <PaymentMethodModal
          method={modal.method}
          saving={saving}
          saveError={saveError}
          onClose={() => setModal({ open: false })}
          onCreate={create}
          onUpdate={update}
        />
      )}
    </div>
  );
};
