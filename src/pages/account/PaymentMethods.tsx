import { useState, type ReactNode } from 'react';
import { CreditCard, Package, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { usePaymentMethods, useSavePaymentMethod, useDeletePaymentMethod, useSetDefaultPayment, type CustomerPaymentMethod } from '@/lib/queries';
import { demoPayments } from '@/data/demo';

const emptyForm = { type: 'mpesa' as 'mpesa' | 'card', label: '', detail: '', is_default: false };

function toCustomerPayment(d: typeof demoPayments[number]): CustomerPaymentMethod {
  return { id: d.id, user_id: 'demo', type: d.type, label: d.label, detail: d.detail, is_default: d.isDefault, created_at: '' };
}

export function PaymentMethods() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: livePayments, isLoading, error } = usePaymentMethods(userId);
  const saveMutation = useSavePaymentMethod(userId);
  const deleteMutation = useDeletePaymentMethod(userId);
  const setDefaultMutation = useSetDefaultPayment(userId);

  const [localPayments, setLocalPayments] = useState<CustomerPaymentMethod[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (pay: CustomerPaymentMethod) => {
    setEditingId(pay.id);
    setForm({ type: pay.type, label: pay.label, detail: pay.detail, is_default: pay.is_default });
    setModalOpen(true);
  };

  const demoList: CustomerPaymentMethod[] = demoPayments.map(toCustomerPayment);
  const list: CustomerPaymentMethod[] = isDemo ? (localPayments ?? demoList) : (livePayments ?? []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isDemo) {
      if (editingId) {
        setLocalPayments((prev) => (prev ?? demoList).map((p) => (p.id === editingId ? { ...p, ...form } : p)));
      } else {
        setLocalPayments((prev) => [...(prev ?? demoList), { ...form, id: `local-${Date.now()}`, user_id: 'demo', created_at: new Date().toISOString() }]);
      }
      setModalOpen(false);
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: editingId, payload: form });
      setModalOpen(false);
    } catch {
      setFormError('Could not save payment method.');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this payment method?')) return;
    if (isDemo) { setLocalPayments((prev) => (prev ?? demoList).filter((p) => p.id !== id)); return; }
    try { await deleteMutation.mutateAsync(id); } catch { /* surfaced */ }
  };

  const setDefault = async (id: string) => {
    if (isDemo) { setLocalPayments((prev) => (prev ?? demoList).map((p) => ({ ...p, is_default: p.id === id }))); return; }
    try { await setDefaultMutation.mutateAsync(id); } catch { /* surfaced */ }
  };

  if (!isDemo && isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading payment methods…</p></div>;
  if (!isDemo && error) return <div className="auth__error">Could not load payment methods.</div>;

  return (
    <div>
      <div className="account__section-head">
        <h3>Payment methods</h3>
        <button className="btn btn--outline btn--sm" onClick={openAdd}><Plus size={16} /> Add method</button>
      </div>

      <div className="account__pay-grid">
        {list.length === 0 ? (
          <div className="track__empty"><CreditCard size={36} /><h3>No saved payment methods</h3><p>Add an M-Pesa number or card for faster checkout.</p></div>
        ) : (
          list.map((pay) => (
            <div key={pay.id} className={`account__pay-card ${pay.is_default ? 'account__pay-card--default' : ''}`}>
              <div className="account__pay-top">
                <span className={`account__pay-type account__pay-type--${pay.type}`}>{pay.type === 'mpesa' ? 'M-Pesa' : 'Card'}</span>
                {pay.is_default && <span className="account__addr-default-tag">Default</span>}
              </div>
              <strong>{pay.label}</strong>
              <span>{pay.detail}</span>
              <div className="account__addr-actions">
                <button className="account__addr-action" onClick={() => openEdit(pay)}>Edit</button>
                {!pay.is_default && <button onClick={() => setDefault(pay.id)} className="account__addr-action">Set as default</button>}
                <button className="account__addr-action account__addr-action--danger" onClick={() => remove(pay.id)}><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <PaymentModal form={form} setForm={setForm} saving={saveMutation.isPending} error={formError} onClose={() => setModalOpen(false)} onSave={save} />}
    </div>
  );
}

function PaymentModal({ form, setForm, saving, error, onClose, onSave }: {
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
          <h3>Add payment method</h3>
          <button className="modal__close" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="account__settings-form" onSubmit={onSave}>
          <label className="auth__field">
            <span>Type</span>
            <div className="auth__input-wrap">
              <select className="admin__select" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as 'mpesa' | 'card' }))}>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
              </select>
            </div>
          </label>
          {field('Label', 'label', 'text', form.type === 'mpesa' ? 'e.g. My M-Pesa' : 'e.g. Visa ending 4242')}
          {field('Detail', 'detail', 'text', form.type === 'mpesa' ? '+254 7XX XXX XXX' : 'Expires MM/YY')}
          <div className="account__notif-item">
            <div><strong>Set as default</strong><span>Use this method for future orders</span></div>
            <button type="button" className={`toggle-switch ${form.is_default ? 'toggle-switch--on' : ''}`} onClick={() => setForm((prev) => ({ ...prev, is_default: !prev.is_default }))}><span className="toggle-switch__knob" /></button>
          </div>
          {error && <div className="auth__error">{error}</div>}
          <div className="admin__settings-actions">
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save method'}</button>
            <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
