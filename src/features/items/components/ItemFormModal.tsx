import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { SearchSelect } from '../../../components/SearchSelect';
import { useItemMutations } from '../hooks/useItemMutations';
import { getApiErrorMessage } from '../../../services/apiError';
import { peso } from '../../../lib/format';
import { useSettings } from '../../../hooks/useSettings';
import { resolveUtangPrice } from '../../../lib/utangPricing';
import type { Category, Item } from '../../../types';

interface Props {
  item?: Item | null;
  categories: Category[];
  createCategory: (name: string) => Promise<string>;
  onClose: () => void;
  onSaved: () => void;
}

export const ItemFormModal = ({
  item,
  categories,
  createCategory,
  onClose,
  onSaved,
}: Props) => {
  const isEdit = !!item;
  const { createItem, updateItem, loading, error } = useItemMutations();

  const [name, setName] = useState(item?.name ?? '');
  const [itemCode, setItemCode] = useState(item?.itemCode ?? '');
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [costPrice, setCostPrice] = useState(
    item ? String(item.costPrice) : ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    item ? String(item.sellingPrice) : ''
  );

  const { settings } = useSettings();
  const defaultMarkup = settings?.defaultUtangMarkup ?? 0;

  const [utangMarkup, setUtangMarkup] = useState(
    item?.utangMarkup != null ? String(item.utangMarkup) : ''
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    item ? String(item.lowStockThreshold) : '0'
  );
  const [tracksStock, setTracksStock] = useState(item?.tracksStock ?? true);
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  const [addingCategory, setAddingCategory] = useState(categories.length === 0);
  const [newCategory, setNewCategory] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const cost = Number(costPrice);
  const price = Number(sellingPrice);
  const margin = price > 0 && cost >= 0 ? price - cost : 0;

  const markupValue = utangMarkup.trim() === '' ? null : Number(utangMarkup);
  const utangPrice = resolveUtangPrice(price > 0 ? price : 0, markupValue, defaultMarkup);

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
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      itemCode: itemCode.trim() || undefined,
      barcode: barcode.trim() || undefined,
      costPrice: cost,
      sellingPrice: price,
      utangMarkup: markupValue,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      tracksStock,
      categoryId,
    };

    const ok = item
      ? await updateItem(item.id, { ...payload, isActive })
      : await createItem(payload);

    if (ok) onSaved();
  };

  return (
    <Modal
      title={isEdit ? 'Edit item' : 'New item'}
      subtitle={isEdit ? item!.name : 'Add a product to your catalog'}
      wide
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="login-error" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="itemCode">Item Code</label>
            <input
              id="itemCode"
              className="input"
              type="text"
              placeholder="Blank to auto-generate — e.g. 00001"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="name">Item name</label>
            <input
              id="name"
              className="input"
              type="text"
              placeholder="e.g. Kopiko Black 3-in-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="barcode">Barcode (optional)</label>
            <input
              id="barcode"
              className="input"
              type="text"
              placeholder="Scan or type, e.g. 4800016641234"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="description">Description (optional)</label>
            <input
              id="description"
              className="input"
              type="text"
              placeholder="Short note about this item"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="cost">Cost price</label>
            <input
              id="cost"
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
            <label htmlFor="price">Selling price</label>
            <input
              id="price"
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
          <label htmlFor="utangMarkup">Utang markup (optional)</label>
          <input
            id="utangMarkup"
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder={`${defaultMarkup.toFixed(2)} (store default)`}
            value={utangMarkup}
            onChange={(e) => setUtangMarkup(e.target.value)}
          />
          <p className="utang-preview">
            Utang price: <strong className="tnum">{peso.format(utangPrice)}</strong>
            {markupValue === null ? ' — using the store default' : ''}
          </p>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="category">Category</label>
            {!addingCategory && (
              <SearchSelect
                id="category"
                value={categoryId}
                onChange={setCategoryId}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
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
                  {categories.length > 0 && (
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
                  )}
                </div>
                {catError && <p className="field-hint text-red">{catError}</p>}
              </>
            )}
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="threshold">Low-stock threshold</label>
              <label className="check-inline">
                <input
                  type="checkbox"
                  checked={!tracksStock}
                  onChange={(e) => setTracksStock(!e.target.checked)}
                />
                N/A
              </label>
            </div>
            {tracksStock ? (
              <input
                id="threshold"
                className="input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            ) : (
              <p className="field-hint">
                Not a physical item — no stock is tracked and no low-stock alerts are sent.
              </p>
            )}
          </div>
        </div>

        {isEdit && (
          <div className="field">
            <label>Status</label>
            <div className="segmented">
              <button
                type="button"
                className={isActive ? 'seg is-active' : 'seg'}
                onClick={() => setIsActive(true)}
              >
                Active
              </button>
              <button
                type="button"
                className={!isActive ? 'seg is-active' : 'seg'}
                onClick={() => setIsActive(false)}
              >
                Inactive
              </button>
            </div>
          </div>
        )}

        <div className="modal-summary">
          <span>Margin per unit</span>
          <strong className="tnum">{peso.format(margin)}</strong>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !canSubmit}
          >
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
