import { useEffect, useRef, useState } from 'react';
import { InventoryTabs } from '../components/InventoryTabs';
import { QuickCreateItemModal } from '../components/QuickCreateItemModal';
import { useItemSearch } from '../hooks/useItemSearch';
import { useReceiveStock } from '../hooks/useReceiveStock';
import { itemService } from '../../items/services/itemService';
import { peso } from '../../../lib/format';
import type { SearchItem } from '../../../types';

interface ReceiveLine {
  item: SearchItem;
  qty: number;
  cost: string;
  price: string;
}

interface Draft {
  lines: ReceiveLine[];
  supplier: string;
  notes: string;
}

const DRAFT_KEY = 'receive-stock-draft';

const loadDraft = (): Draft | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

export const ReceiveStockScreen = () => {
  const [draft] = useState(loadDraft);
  const [lines, setLines] = useState<ReceiveLine[]>(draft?.lines ?? []);
  const [supplier, setSupplier] = useState(draft?.supplier ?? '');
  const [notes, setNotes] = useState(draft?.notes ?? '');
  const [term, setTerm] = useState('');
  const [quickCreate, setQuickCreate] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const { results, searching } = useItemSearch(term);
  const { receiveStock, loading, error, clearError } = useReceiveStock();
  const pickable = results.filter((r) => r.tracksStock);

  // Draft survives accidental navigation; beforeunload covers close/refresh.
  useEffect(() => {
    if (lines.length === 0 && !supplier && !notes) {
      sessionStorage.removeItem(DRAFT_KEY);
      return;
    }
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ lines, supplier, notes } satisfies Draft)
    );
  }, [lines, supplier, notes]);

  useEffect(() => {
    if (lines.length === 0) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [lines.length]);

  const focusScan = () => scanRef.current?.focus();

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId((f) => (f === id ? null : f)), 600);
  };

  const addItem = (item: SearchItem) => {
    if (item.isComposite || !item.tracksStock) return;
    setSuccess(null);
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [
        ...prev,
        {
          item,
          qty: 1,
          cost: String(item.costPrice),
          price: String(item.sellingPrice),
        },
      ];
    });
    flash(item.id);
    setTerm('');
    focusScan();
  };

  /** Scanner path: scanners type the code and send Enter. Fresh lookup —
   *  never trust the debounced dropdown for this. */
  const handleScanEnter = async () => {
    const code = term.trim();
    if (!code) return;
    let hits: SearchItem[];
    try {
      hits = await itemService.search(code);
    } catch {
      return; // search failed; leave the term for the user to retry
    }
    const exact = hits.find(
      (h) => h.barcode === code && !h.isComposite && h.tracksStock
    );
    if (exact) {
      addItem(exact);
      return;
    }
    const addable = hits.filter((h) => !h.isComposite && h.tracksStock);
    if (addable.length === 1) {
      addItem(addable[0]);
      return;
    }
    if (hits.length === 0) setQuickCreate(code);
    // multiple loose matches: dropdown stays open, user picks
  };

  const setLine = (id: string, patch: Partial<ReceiveLine>) =>
    setLines((prev) =>
      prev.map((l) => (l.item.id === id ? { ...l, ...patch } : l))
    );

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.item.id !== id));

  const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);
  const totalCost = lines.reduce(
    (sum, l) => sum + l.qty * (Number(l.cost) || 0),
    0
  );
  const allValid =
    lines.length > 0 &&
    lines.every(
      (l) => l.qty >= 1 && Number(l.cost) >= 0 && Number(l.price) > 0
    );

  const handleReceive = async () => {
    if (!allValid || loading) return;
    const ok = await receiveStock({
      supplierName: supplier.trim() || undefined,
      notes: notes.trim() || undefined,
      lines: lines.map((l) => ({
        itemId: l.item.id,
        quantity: l.qty,
        costPerUnit: Number(l.cost),
        sellingPrice: Number(l.price),
      })),
    });
    if (ok) {
      setSuccess(
        `Received ${lines.length} item${lines.length === 1 ? '' : 's'} · ${totalUnits} unit${totalUnits === 1 ? '' : 's'} · ${peso.format(totalCost)} recorded as expense.`
      );
      setLines([]);
      setSupplier('');
      setNotes('');
      sessionStorage.removeItem(DRAFT_KEY);
      focusScan();
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory · Stock</p>
          <h1 className="page-title">Receive stock</h1>
          <p className="page-lead">
            Scan each product as you unpack the delivery — quantities, costs,
            and prices land in one batch.
          </p>
        </div>
      </div>

      <InventoryTabs />

      {success && (
        <div className="card receive-success" role="status">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {error}
          <button className="btn btn-quiet btn-sm" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      <div className="card receive-scan">
        <div className="search-select">
          <input
            ref={scanRef}
            className="input"
            type="text"
            placeholder="Scan barcode, or type item code / name…"
            value={term}
            autoFocus
            autoComplete="off"
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleScanEnter();
              } else if (e.key === 'Escape') {
                setTerm('');
              }
            }}
          />
          {term.trim() && (
            <ul className="search-select-menu" role="listbox">
              {pickable.map((r) => (
                <li
                  key={r.id}
                  role="option"
                  aria-selected={false}
                  className={
                    r.isComposite
                      ? 'search-select-option is-disabled'
                      : 'search-select-option'
                  }
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!r.isComposite) addItem(r);
                  }}
                >
                  <span className="receive-result-name">
                    {r.name}
                    {!r.isActive && <span className="badge badge-low">Inactive</span>}
                  </span>
                  <span className="receive-result-sub">
                    {r.isComposite
                      ? 'built from components'
                      : `${r.barcode ?? r.itemCode} · ${r.stock} on hand · ${peso.format(r.sellingPrice)}`}
                  </span>
                </li>
              ))}
              {!searching && pickable.length === 0 && (
                <li
                  className="search-select-option search-select-action"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuickCreate(term.trim());
                  }}
                >
                  + New item “{term.trim()}”
                </li>
              )}
              {searching && (
                <li className="search-select-empty">Searching…</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="card">
          <div className="state">
            <div className="state-emoji">📦</div>
            <div className="state-title">Nothing scanned yet</div>
            <p className="state-msg">
              Scan a barcode to start the delivery. Unknown barcodes can be
              added to the catalog on the spot.
            </p>
          </div>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Qty received</th>
                <th className="num">Cost per unit</th>
                <th className="num">Selling price</th>
                <th className="num">Line total</th>
                <th className="num" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr
                  key={l.item.id}
                  className={flashId === l.item.id ? 'row-flash' : undefined}
                >
                  <td>
                    <div className="item-name">{l.item.name}</div>
                    <div className="item-sub">
                      {l.item.barcode ?? l.item.itemCode}
                    </div>
                  </td>
                  <td className="num">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setLine(l.item.id, { qty: Math.max(1, l.qty - 1) })
                        }
                      >
                        −
                      </button>
                      <input
                        className="input input-qty"
                        type="number"
                        min="1"
                        step="1"
                        value={l.qty}
                        onChange={(e) =>
                          setLine(l.item.id, {
                            qty: Math.max(1, parseInt(e.target.value, 10) || 1),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setLine(l.item.id, { qty: l.qty + 1 })}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="num">
                    <input
                      className="input input-money"
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.cost}
                      onChange={(e) =>
                        setLine(l.item.id, { cost: e.target.value })
                      }
                    />
                  </td>
                  <td className="num">
                    <input
                      className="input input-money"
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.price}
                      onChange={(e) =>
                        setLine(l.item.id, { price: e.target.value })
                      }
                    />
                  </td>
                  <td className="num tnum">
                    {peso.format(l.qty * (Number(l.cost) || 0))}
                  </td>
                  <td className="num">
                    <button
                      type="button"
                      className="btn btn-quiet btn-sm"
                      onClick={() => removeLine(l.item.id)}
                      aria-label={`Remove ${l.item.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card receive-footer">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="supplier">Supplier (optional)</label>
            <input
              id="supplier"
              className="input"
              type="text"
              placeholder="e.g. Aling Rosa Wholesale"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="rcv-notes">Notes (optional)</label>
            <input
              id="rcv-notes"
              className="input"
              type="text"
              placeholder="Delivery reference, batch, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-summary">
          <span>
            {lines.length} item{lines.length === 1 ? '' : 's'} · {totalUnits}{' '}
            unit{totalUnits === 1 ? '' : 's'} · total cost (recorded as
            expense)
          </span>
          <strong className="tnum">{peso.format(totalCost)}</strong>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allValid || loading}
            onClick={handleReceive}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading
              ? 'Receiving…'
              : `Receive ${lines.length} item${lines.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>

      {quickCreate !== null && (
        <QuickCreateItemModal
          scannedCode={quickCreate}
          onClose={() => {
            setQuickCreate(null);
            focusScan();
          }}
          onCreated={(item) => {
            setQuickCreate(null);
            addItem(item);
          }}
        />
      )}
    </>
  );
};
