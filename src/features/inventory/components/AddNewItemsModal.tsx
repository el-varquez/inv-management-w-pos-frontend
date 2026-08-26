import { Modal } from '../../../components/Modal';
import { peso } from '../../../lib/format';

export interface NewItemPreview {
  name: string;
  barcode?: string;
  qty: number;
  cost: number;
  price: number;
}

interface Props {
  newItems: NewItemPreview[];
  matchedCount: number;
  saving: boolean;
  onConfirm: () => void;
  onReceiveMatchedOnly: () => void;
  onClose: () => void;
}

export const AddNewItemsModal = ({
  newItems,
  matchedCount,
  saving,
  onConfirm,
  onReceiveMatchedOnly,
  onClose,
}: Props) => (
  <Modal
    title="Add new items?"
    subtitle={`${newItems.length} item${newItems.length === 1 ? ' isn’t' : 's aren’t'} in the catalog yet — confirming adds ${newItems.length === 1 ? 'it' : 'them'} under Inventory Item and receives everything in one save.`}
    onClose={onClose}
  >
    <ul className="new-item-list">
      {newItems.map((n) => (
        <li key={n.name}>
          <div className="item-name">{n.name}</div>
          <div className="item-sub">
            {n.barcode ?? 'no barcode'} · {n.qty} × {peso.format(n.cost)} · sells at{' '}
            {peso.format(n.price)}
          </div>
        </li>
      ))}
    </ul>
    <div className="modal-actions">
      {matchedCount > 0 && (
        <button
          type="button"
          className="btn btn-quiet btn-sm new-item-escape"
          onClick={onReceiveMatchedOnly}
          disabled={saving}
        >
          Receive the {matchedCount} matched item{matchedCount === 1 ? '' : 's'} only
        </button>
      )}
      <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
        Back to review
      </button>
      <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={saving}>
        {saving ? <span className="spinner" aria-hidden="true" /> : null}
        {saving
          ? 'Receiving…'
          : `Add ${newItems.length} item${newItems.length === 1 ? '' : 's'} & receive`}
      </button>
    </div>
  </Modal>
);
