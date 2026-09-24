import { useState, type ReactNode } from 'react';
import { MapPin, Package, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useAddresses, useSaveAddress, useDeleteAddress, useSetDefaultAddress, type CustomerAddress } from '@/lib/queries';
import { demoAddresses } from '@/data/demo';

const emptyForm = { label: '', name: '', phone: '', line1: '', area: '', city: 'Nairobi', is_default: false };

function toCustomerAddress(d: typeof demoAddresses[number]): CustomerAddress {
  return { id: d.id, user_id: 'demo', label: d.label, name: d.name, phone: d.phone, line1: d.line1, area: d.area, city: d.city, is_default: d.isDefault, created_at: '' };
}

export function Addresses() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: liveAddresses, isLoading, error } = useAddresses(userId);
  const saveMutation = useSaveAddress(userId);
  const deleteMutation = useDeleteAddress(userId);
  const setDefaultMutation = useSetDefaultAddress(userId);

  const [localAddresses, setLocalAddresses] = useState<CustomerAddress[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const demoList: CustomerAddress[] = demoAddresses.map(toCustomerAddress);
  const list: CustomerAddress[] = isDemo ? (localAddresses ?? demoList) : (liveAddresses ?? []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setForm({ label: addr.label, name: addr.name, phone: addr.phone, line1: addr.line1, area: addr.area, city: addr.city, is_default: addr.is_default });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isDemo) {
      if (editingId) {
        setLocalAddresses((prev) => (prev ?? demoList).map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      } else {
        setLocalAddresses((prev) => [...(prev ?? demoList), { ...form, id: `local-${Date.now()}`, user_id: 'demo', created_at: new Date().toISOString() }]);
      }
      setModalOpen(false);
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: editingId, payload: form });
      setModalOpen(false);
    } catch {
      setFormError('Could not save address.');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this address?')) return;
    if (isDemo) { setLocalAddresses((prev) => (prev ?? demoList).filter((a) => a.id !== id)); return; }
    try { await deleteMutation.mutateAsync(id); } catch { /* surfaced */ }
  };

  const setDefault = async (id: string) => {
    if (isDemo) { setLocalAddresses((prev) => (prev ?? demoList).map((a) => ({ ...a, is_default: a.id === id }))); return; }
    try { await setDefaultMutation.mutateAsync(id); } catch { /* surfaced */ }
  };

  if (!isDemo && isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading addresses…</p></div>;
  if (!isDemo && error) return <div className="auth__error">Could not load addresses.</div>;

  return (
    <div>
      <div className="account__section-head">
        <h3>Saved addresses</h3>
        <button className="btn btn--outline btn--sm" onClick={openAdd}><Plus size={16} /> Add address</button>
      </div>

      <div className="account__addr-grid">
        {list.length === 0 ? (
          <div className="track__empty"><MapPin size={36} /><h3>No saved addresses</h3><p>Add a delivery address to speed up checkout.</p></div>
        ) : (
          list.map((addr) => (
            <div key={addr.id} className={`account__addr-card-full ${addr.is_default ? 'account__addr-card-full--default' : ''}`}>
              <div className="account__addr-top">
                <span className="account__addr-label">{addr.label}</span>
                {addr.is_default && <span className="account__addr-default-tag">Default</span>}
              </div>
              <strong>{addr.name}</strong>
              <span>{addr.line1}</span>
              <span>{addr.area}, {addr.city}</span>
              <span>{addr.phone}</span>
              <div className="account__addr-actions">
                <button className="account__addr-action" onClick={() => openEdit(addr)}>Edit</button>
                {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="account__addr-action">Set as default</button>}
                <button className="account__addr-action account__addr-action--danger" onClick={() => remove(addr.id)}><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <AddressModal form={form} setForm={setForm} saving={saveMutation.isPending} error={formError} onClose={() => setModalOpen(false)} onSave={save} />}
    </div>
  );
}

function AddressModal({ form, setForm, saving, error, onClose, onSave }: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}) {
  const field = (label: string, key: keyof typeof form, type: string = 'text', placeholder?: string): ReactNode => (
    <label className="auth__field">
      <span>{label}</span>
      <div className="auth__input-wrap">
        <input type={type} value={form[key] as string} placeholder={placeholder}
          onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
      </div>
    </label>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>Add delivery address</h3>
          <button className="modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="account__settings-form" onSubmit={onSave}>
          <div className="field-row">
            {field('Label', 'label', 'text', 'e.g. Home')}
            {field('Recipient name', 'name', 'text', 'Full name')}
          </div>
          <div className="field-row">
            {field('Phone', 'phone', 'tel', '+254 7XX XXX XXX')}
            {field('Area', 'area', 'text', 'e.g. Kilimani')}
          </div>
          {field('Street address', 'line1', 'text', 'House no, street, landmark')}
          {field('City', 'city', 'text', 'Nairobi')}
          <div className="account__notif-item">
            <div><strong>Set as default</strong><span>Use this address for future orders</span></div>
            <button type="button" className={`toggle-switch ${form.is_default ? 'toggle-switch--on' : ''}`} onClick={() => setForm((prev) => ({ ...prev, is_default: !prev.is_default }))}><span className="toggle-switch__knob" /></button>
          </div>
          {error && <div className="auth__error">{error}</div>}
          <div className="admin__settings-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save address'}</button>
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
