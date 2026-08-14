import { useEffect, useState } from 'react';
import { SearchSelect } from '../../../components/SearchSelect';
import { itemService } from '../../items/services/itemService';
import { getApiErrorMessage } from '../../../services/apiError';
import type { Item } from '../../../types';

interface Props {
  trackGcashWallet: boolean;
  gcashFeeItemId: string | null;
  disabled: boolean;
  onSave: (track: boolean, feeItemId: string | null) => Promise<boolean>;
}

export const GcashWalletRow = ({
  trackGcashWallet,
  gcashFeeItemId,
  disabled,
  onSave,
}: Props) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const page = await itemService.getPaged({ page: 1, pageSize: 200 });
        if (!cancelled) setItems(page.items);
      } catch (err) {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'Failed to load items.'));
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="setting-row">
        <div className="setting-copy">
          <div className="setting-name" id="track-gcash-label">
            Track GCash wallet
          </div>
          <p className="setting-desc">
            Declare a starting GCash balance at shift open and reconcile it at
            close.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={trackGcashWallet}
          aria-labelledby="track-gcash-label"
          className={`switch${trackGcashWallet ? ' switch-on' : ''}`}
          disabled={disabled}
          onClick={() => onSave(!trackGcashWallet, gcashFeeItemId)}
        >
          <span className="switch-knob" />
        </button>
      </div>

      {trackGcashWallet && (
        <div className="setting-row">
          <div className="setting-copy">
            <div className="setting-name" id="gcash-fee-item-label">
              GCash fee item
            </div>
            <p className="setting-desc">
              Cash-in and cash-out fees are rung up as this item at ₱1 × the fee
              amount. Create it as a non-physical item with a ₱1.00 selling
              price.
            </p>
          </div>
          <div className="setting-control setting-control-wide">
            <SearchSelect
              id="gcashFeeItem"
              value={gcashFeeItemId ?? ''}
              onChange={(id) => onSave(trackGcashWallet, id || null)}
              options={items.map((i) => ({ value: i.id, label: i.name }))}
              placeholder="Select the fee item…"
            />
            {loadError && <p className="field-hint text-red">{loadError}</p>}
          </div>
        </div>
      )}
    </>
  );
};
