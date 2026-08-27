import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useUtangMutations } from '../hooks/useUtangMutations';
import type { Suki } from '../../../types';

interface Props {
  suki?: Suki;
  onClose: () => void;
  onSaved: () => void;
}

export const SukiFormModal = ({ suki, onClose, onSaved }: Props) => {
  const { createSuki, updateSuki, loading, error } = useUtangMutations();
  const [name, setName] = useState(suki?.name ?? '');
  const [phone, setPhone] = useState(suki?.phone ?? '');

  const canSubmit = name.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const trimmedPhone = phone.trim();
    const body = {
      name: name.trim(),
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
    };
    const ok = suki ? await updateSuki(suki.id, body) : await createSuki(body);
    if (ok) onSaved();
  };

  return (
    <Modal
      title={suki ? `Edit ${suki.name}` : 'New suki'}
      subtitle={
        suki
          ? 'Rename the suki or update their phone'
          : 'Add a customer who buys on utang'
      }
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
          <label htmlFor="suki-name">Name</label>
          <input
            id="suki-name"
            className="input"
            type="text"
            placeholder="e.g. Aling Rosa"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label htmlFor="suki-phone">Phone (optional)</label>
          <input
            id="suki-phone"
            className="input"
            type="tel"
            placeholder="e.g. 0917 123 4567"
            maxLength={32}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {loading ? 'Saving…' : suki ? 'Save changes' : 'Add suki'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
