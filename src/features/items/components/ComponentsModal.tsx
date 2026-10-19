import { useEffect, useState } from 'react';
import { Modal } from '../../../components/Modal';
import { ItemSearchSelect } from './ItemSearchSelect';
import { useItemComponents } from '../hooks/useItemComponents';
import { peso } from '../../../lib/format';
import type { Item } from '../../../types';

interface Props {
  item: Item;
  onClose: () => void;
  onSaved: () => void;
}

/** A recipe line. Name and cost ride along with the id because only a page of items is ever loaded. */
interface Row {
  componentItemId: string;
  componentItemName: string;
  componentCostPrice: number;
  quantity: string;
}

export const ComponentsModal = ({ item, onClose, onSaved }: Props) => {
  const { components, load, save, loading, saving, error } = useItemComponents();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    load(item.id);
  }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!components) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(
      components.components.map((c) => ({
        componentItemId: c.componentItemId,
        componentItemName: c.componentItemName,
        componentCostPrice: c.componentCostPrice,
        quantity: String(c.quantity),
      }))
    );
  }, [components]);

  const totalCost = rows.reduce((sum, r) => {
    const qty = Number(r.quantity);
    return sum + (qty > 0 ? r.componentCostPrice * qty : 0);
  }, 0);

  const chosenIds = rows.map((r) => r.componentItemId).filter(Boolean);
  const hasDuplicate = new Set(chosenIds).size !== chosenIds.length;
  const hasInvalidRow = rows.some(
    (r) => r.componentItemId === '' || Number(r.quantity) <= 0
  );
  const canSave = !hasInvalidRow && !hasDuplicate && !saving;

  /** The parent itself and every other row's pick are kept out of a row's options. */
  const excludeIdsFor = (index: number) => [
    item.id,
    ...rows
      .filter((_, i) => i !== index)
      .map((r) => r.componentItemId)
      .filter(Boolean),
  ];

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { componentItemId: '', componentItemName: '', componentCostPrice: 0, quantity: '1' },
    ]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );

  const handleSave = async () => {
    if (!canSave) return;
    const ok = await save(
      item.id,
      rows.map((r) => ({
        componentItemId: r.componentItemId,
        quantity: Number(r.quantity),
      }))
    );
    if (ok) onSaved();
  };

  const isEmpty = rows.length === 0;

  return (
    <Modal
      title="Recipe"
      subtitle={`${item.name} — components consumed on each sale`}
      onClose={onClose}
    >
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="state">
          <span className="spinner" aria-hidden="true" />
          <p className="state-msg">Loading recipe…</p>
        </div>
      ) : (
        <>
          {isEmpty ? (
            <p className="field-hint">
              This item has no components. Add one to turn it into a composite —
              selling it will then draw down the components below instead of its
              own stock.
            </p>
          ) : (
            <div className="component-rows">
              {rows.map((row, index) => (
                <div className="component-row" key={index}>
                  <ItemSearchSelect
                    value={row.componentItemId}
                    selectedLabel={row.componentItemName}
                    onChange={(id, picked) =>
                      updateRow(index, {
                        componentItemId: id,
                        componentItemName: picked?.name ?? '',
                        componentCostPrice: picked?.costPrice ?? 0,
                      })
                    }
                    excludeIds={excludeIdsFor(index)}
                    activeOnly
                    placeholder="Search for a component…"
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(index, { quantity: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={() => removeRow(index)}
                    aria-label="Remove component"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasDuplicate && (
            <p className="field-hint text-red">
              Each component can only be listed once.
            </p>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addRow}
            style={{ marginTop: 8 }}
          >
            + Add component
          </button>

          <div className="modal-summary">
            <span>Total component cost</span>
            <strong className="tnum">{peso.format(totalCost)}</strong>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? <span className="spinner" aria-hidden="true" /> : null}
              {saving
                ? 'Saving…'
                : isEmpty
                  ? 'Remove recipe'
                  : 'Save recipe'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
