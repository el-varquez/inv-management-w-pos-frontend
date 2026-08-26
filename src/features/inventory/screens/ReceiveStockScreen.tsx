import { useEffect, useRef, useState } from 'react';
import { InventoryTabs } from '../components/InventoryTabs';
import { QuickCreateItemModal } from '../components/QuickCreateItemModal';
import { AddNewItemsModal } from '../components/AddNewItemsModal';
import {
  ImportSummaryStrip,
  type ImportReport,
} from '../components/ImportSummaryStrip';
import { useItemSearch } from '../hooks/useItemSearch';
import { useReceiveStock } from '../hooks/useReceiveStock';
import { itemService } from '../../items/services/itemService';
import { getApiErrorMessage } from '../../../services/apiError';
import { peso } from '../../../lib/format';
import {
  matchImportRows,
  parseReceiveFile,
  RECEIVE_TEMPLATE_CSV,
  type ImportResult,
} from '../../../lib/receiveImport';
import type { Item, SearchItem } from '../../../types';

interface ReceiveLine {
  key: string;
  item?: SearchItem;
  newItem?: { name: string; barcode?: string };
  qty: number;
  cost: string;
  price: string;
}

interface Draft {
  lines: ReceiveLine[];
  supplier: string;
  notes: string;
}

const DRAFT_KEY = 'receive-stock-draft-v2';
const MAX_LINES = 200;

const loadDraft = (): Draft | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
};

const toSearchItem = (i: Item): SearchItem => ({
  id: i.id,
  name: i.name,
  barcode: i.barcode,
  itemCode: i.itemCode,
  stock: i.stock,
  costPrice: i.costPrice,
  sellingPrice: i.sellingPrice,
  isActive: i.isActive,
  isComposite: i.isComposite,
  tracksStock: i.tracksStock,
  categoryName: i.categoryName,
});

const fetchCatalog = async (): Promise<Item[]> => {
  const all: Item[] = [];
  let page = 1;
  for (;;) {
    const res = await itemService.getPaged({ page, pageSize: 100 });
    all.push(...res.items);
    if (page >= res.totalPages) break;
    page += 1;
  }
  return all;
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
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [confirmNewItems, setConfirmNewItems] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
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
      const existing = prev.find((l) => l.key === item.id);
      if (existing) {
        return prev.map((l) =>
          l.key === item.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [
        ...prev,
        {
          key: item.id,
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

  const setLine = (key: string, patch: Partial<ReceiveLine>) =>
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    );

  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));

  const applyImport = (result: ImportResult, filename: string) => {
    const next = [...lines];
    let updated = 0;
    const replaceOrPush = (line: ReceiveLine) => {
      const i = next.findIndex((l) => l.key === line.key);
      if (i >= 0) {
        next[i] = line;
        updated += 1;
      } else {
        next.push(line);
      }
    };
    for (const m of result.matched) {
      replaceOrPush({
        key: m.item.id,
        item: toSearchItem(m.item),
        qty: m.qty,
        cost: m.cost,
        price: m.price,
      });
    }
    for (const n of result.newItems) {
      replaceOrPush({
        key: `new:${n.name.toLowerCase()}`,
        newItem: { name: n.name, barcode: n.barcode },
        qty: n.qty,
        cost: n.cost,
        price: n.price,
      });
    }
    if (next.length > MAX_LINES) {
      setImportError(
        `A delivery can have at most ${MAX_LINES} lines — split the file and import it in parts.`
      );
      return;
    }
    setSuccess(null);
    setLines(next);
    setImportReport({
      filename,
      matched: result.matched.length,
      added: result.newItems.length,
      updated,
      skipped: result.skipped,
    });
  };

  const importFile = async (file: File) => {
    if (importing) return;
    setImporting(true);
    setImportError(null);
    try {
      const rows = await parseReceiveFile(file);
      const catalog = await fetchCatalog();
      applyImport(matchImportRows(rows, catalog), file.name);
    } catch (err) {
      const fallback =
        err instanceof Error && err.message
          ? err.message
          : 'Could not read that file.';
      setImportError(getApiErrorMessage(err, fallback));
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([RECEIVE_TEMPLATE_CSV], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receive-stock-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFiles = (e: React.DragEvent) =>
    e.dataTransfer.types.includes('Files');

  const onDragEnter = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    dragDepth.current += 1;
    setDragActive(true);
  };
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragActive(false);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (hasFiles(e)) e.preventDefault();
  };
  const onDrop = (e: React.DragEvent) => {
    dragDepth.current = 0;
    setDragActive(false);
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    void importFile(e.dataTransfer.files[0]);
  };

  const newLines = lines.filter((l) => l.newItem);
  const totalUnits = lines.reduce((sum, l) => sum + l.qty, 0);
  const totalCost = lines.reduce(
    (sum, l) => sum + l.qty * (Number(l.cost) || 0),
    0
  );
  const missingPrice = lines.filter((l) => !(Number(l.price) > 0)).length;
  const allValid =
    lines.length > 0 &&
    lines.every(
      (l) => l.qty >= 1 && Number(l.cost) >= 0 && Number(l.price) > 0
    );

  const toPayloadLine = (l: ReceiveLine) => ({
    itemId: l.item?.id,
    newItem: l.newItem,
    quantity: l.qty,
    costPerUnit: Number(l.cost),
    sellingPrice: Number(l.price),
  });

  const submitReceive = async (batch: ReceiveLine[], keepNewLines: boolean) => {
    const ok = await receiveStock({
      supplierName: supplier.trim() || undefined,
      notes: notes.trim() || undefined,
      lines: batch.map(toPayloadLine),
    });
    setConfirmNewItems(false);
    if (!ok) return;
    const units = batch.reduce((sum, l) => sum + l.qty, 0);
    const cost = batch.reduce(
      (sum, l) => sum + l.qty * (Number(l.cost) || 0),
      0
    );
    const created = keepNewLines ? 0 : batch.filter((l) => l.newItem).length;
    const kept = keepNewLines ? newLines.length : 0;
    let msg = `Received ${batch.length} item${batch.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'} · ${peso.format(cost)} recorded as expense.`;
    if (created > 0)
      msg += ` ${created} new item${created === 1 ? '' : 's'} added to the catalog.`;
    if (kept > 0)
      msg += ` ${kept} NEW line${kept === 1 ? '' : 's'} kept below to finish later.`;
    setSuccess(msg);
    setImportReport(null);
    if (keepNewLines) {
      setLines(newLines);
    } else {
      setLines([]);
      setSupplier('');
      setNotes('');
      sessionStorage.removeItem(DRAFT_KEY);
    }
    focusScan();
  };

  const handleReceive = () => {
    if (!allValid || loading) return;
    if (newLines.length > 0) setConfirmNewItems(true);
    else void submitReceive(lines, false);
  };

  return (
    <div
      className="receive-drop"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory · Stock</p>
          <h1 className="page-title">Receive stock</h1>
          <p className="page-lead">
            Scan each product as you unpack the delivery — or import the
            supplier’s file. Quantities, costs, and prices land in one batch.
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={downloadTemplate}
          >
            Download template
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <span className="spinner" aria-hidden="true" />
            ) : null}
            {importing ? 'Importing…' : 'Import CSV / Excel'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void importFile(file);
            }}
          />
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
      {importError && (
        <div className="login-error" role="alert">
          <span aria-hidden="true">⚠</span>
          {importError}
          <button
            className="btn btn-quiet btn-sm"
            onClick={() => setImportError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {importReport && (
        <ImportSummaryStrip
          report={importReport}
          onDismiss={() => setImportReport(null)}
        />
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
              Scan a barcode or import the supplier’s file to start the
              delivery. Unknown items can be added to the catalog on the spot.
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
                  key={l.key}
                  className={flashId === l.key ? 'row-flash' : undefined}
                >
                  <td>
                    <div className="item-name">
                      {l.item?.name ?? l.newItem?.name}
                      {l.newItem && (
                        <span className="badge badge-new" style={{ marginLeft: 8 }}>
                          New
                        </span>
                      )}
                    </div>
                    <div className="item-sub">
                      {l.item
                        ? (l.item.barcode ?? l.item.itemCode)
                        : (l.newItem?.barcode ?? 'no barcode')}
                    </div>
                  </td>
                  <td className="num">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setLine(l.key, { qty: Math.max(1, l.qty - 1) })
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
                          setLine(l.key, {
                            qty: Math.max(1, parseInt(e.target.value, 10) || 1),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setLine(l.key, { qty: l.qty + 1 })}
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
                      onChange={(e) => setLine(l.key, { cost: e.target.value })}
                    />
                  </td>
                  <td className="num">
                    <input
                      className={
                        Number(l.price) > 0
                          ? 'input input-money'
                          : 'input input-money is-invalid'
                      }
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={l.price}
                      onChange={(e) => setLine(l.key, { price: e.target.value })}
                    />
                  </td>
                  <td className="num tnum">
                    {peso.format(l.qty * (Number(l.cost) || 0))}
                  </td>
                  <td className="num">
                    <button
                      type="button"
                      className="btn btn-quiet btn-sm"
                      onClick={() => removeLine(l.key)}
                      aria-label={`Remove ${l.item?.name ?? l.newItem?.name ?? 'line'}`}
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
          {missingPrice > 0 && lines.length > 0 && (
            <span className="receive-hint">
              {missingPrice} line{missingPrice === 1 ? ' needs' : 's need'} a
              selling price — fill the red field above.
            </span>
          )}
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

      {dragActive && (
        <div className="receive-drop-veil">Drop the delivery file to import</div>
      )}

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

      {confirmNewItems && (
        <AddNewItemsModal
          newItems={newLines.map(({ newItem, qty, cost, price }) => ({
            name: newItem?.name ?? '',
            barcode: newItem?.barcode,
            qty,
            cost: Number(cost) || 0,
            price: Number(price) || 0,
          }))}
          matchedCount={lines.length - newLines.length}
          saving={loading}
          onConfirm={() => void submitReceive(lines, false)}
          onReceiveMatchedOnly={() =>
            void submitReceive(
              lines.filter((l) => l.item),
              true
            )
          }
          onClose={() => setConfirmNewItems(false)}
        />
      )}
    </div>
  );
};
