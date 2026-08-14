import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { SearchSelect } from '../../../components/SearchSelect';
import { useCategories } from '../../items/hooks/useCategories';
import { itemService } from '../../items/services/itemService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { SearchItem } from '../../../types';

interface Props {
  scannedCode: string;
  onClose: () => void;
  onCreated: (item: SearchItem) => void;
}

export const QuickCreateItemModal = ({ scannedCode, onClose, onCreated }: Props) => {
  const { categories, createCategory } = useCategories();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(scannedCode);
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const cost = Number(costPrice);
  const price = Number(sellingPrice);
  const canSubmit =
    name.trim().length > 0 && price > 0 && cost >= 0 && categoryId !== '';

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCatSaving(true);
    setCatError(null);
    try {
      const id = await createCategory(trimmed);
      setCategoryId(id);
      setNewCategory('');
      setAddingCategory(false);
    } catch (err) {
      setCatError(getApiErrorMessage(err, 'Could not create category.'));
    } finally {
      setCatSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { id } = await itemService.create({
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        costPrice: cost,
        sellingPrice: price,
        lowStockThreshold: 5,
        categoryId,
      });

      const saved = await itemService
        .search(barcode.trim() || name.trim(), 25)
        .then((rows) => rows.find((r) => r.id === id))
        .catch(() => undefined);

      onCreated(
        saved ?? {
          id,
          name: name.trim(),
          barcode: barcode.trim() || undefined,
          itemCode: '',
          stock: 0,
          costPrice: cost,
          sellingPrice: price,
          isActive: true,
          isComposite: false,
          categoryName:
            categories.find((c) => c.id === categoryId)?.name ?? '',
        }
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the item.'));
      setSaving(false);
    }
  };

  return (
    <Modal
      title="New item"
      subtitle="Not in the catalog yet — add it and keep receiving"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <div className="field">
          <label htmlFor="qc-name">Item name</label>
          <input
            id="qc-name"
            className="input"
            type="text"
            placeholder="e.g. Kopiko Blanca Twin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="qc-barcode">Barcode</label>
          <input
            id="qc-barcode"
            className="input"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="qc-cost">Cost price</label>
            <input
              id="qc-cost"
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="qc-price">Selling price</label>
            <input
              id="qc-price"
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="qc-category">Category</label>
          {!addingCategory && (
            <SearchSelect
              id="qc-category"
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select a category…"
              actionLabel="+ New category…"
              onAction={() => setAddingCategory(true)}
            />
          )}
          {addingCategory && (
            <>
              <div className="cat-add-row">
                <input
                  className="input"
                  type="text"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleAddCategory}
                  disabled={catSaving || !newCategory.trim()}
                >
                  {catSaving ? 'Adding…' : 'Add'}
                </button>
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setAddingCategory(false);
                    setCatError(null);
                  }}
                  disabled={catSaving}
                >
                  Cancel
                </button>
              </div>
              {catError && <p className="field-hint text-red">{catError}</p>}
            </>
          )}
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
            type="submit"
            className="btn btn-primary"
            disabled={saving || !canSubmit}
          >
            {saving ? <span className="spinner" aria-hidden="true" /> : null}
            {saving ? 'Saving…' : 'Create & add to delivery'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
