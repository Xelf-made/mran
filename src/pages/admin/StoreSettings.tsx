import { useState } from 'react';
import { Check, Download } from 'lucide-react';
import type { StoreSettings as StoreSettingsType } from './types';
import { useStoreSettings, useSaveSettings } from '@/lib/queries';
import { supabase } from '@/lib/supabase';

export function StoreSettings() {
  const { data: settings, isLoading, error } = useStoreSettings();
  const saveMutation = useSaveSettings();
  const [localSettings, setLocalSettings] = useState<StoreSettingsType | null>(null);
  const [saved, setSaved] = useState(false);

  const current = localSettings ?? settings;

  const set = (key: keyof StoreSettingsType, value: string | number | boolean) => {
    if (!current) return;
    setLocalSettings({ ...current, [key]: value });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    try {
      await saveMutation.mutateAsync(current);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error surfaced via mutation state
    }
  };

  const exportData = async () => {
    const [{ data: prods }, { data: ords }, { data: profs }] = await Promise.all([
      supabase.from('products').select('id, name, brand, category, price, stock, sales'),
      supabase.from('orders').select('id, order_number, status, total, created_at'),
      supabase.from('profiles').select('id, full_name, phone, area'),
    ]);
    const blob = new Blob([JSON.stringify({ products: prods, orders: ords, profiles: profs, settings: current }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moran-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="track-loading"><Check className="spin" size={36} /><p>Loading settings…</p></div>;
  if (!current) return <div className="auth__error">{(error as Error)?.message ?? 'Settings not available.'}</div>;

  return (
    <form className="account__settings-form" onSubmit={save}>
      {error && <div className="auth__error">{(error as Error).message}</div>}
      {saveMutation.isError && <div className="auth__error">Could not save settings.</div>}

      <h3>Store information</h3>
      <div className="field-row">
        <label className="auth__field"><span>Store name</span><div className="auth__input-wrap"><input type="text" value={current.store_name} onChange={(e) => set('store_name', e.target.value)} /></div></label>
        <label className="auth__field"><span>PPB license</span><div className="auth__input-wrap"><input type="text" value={current.ppb_license} onChange={(e) => set('ppb_license', e.target.value)} /></div></label>
      </div>
      <div className="field-row">
        <label className="auth__field"><span>Contact email</span><div className="auth__input-wrap"><input type="email" value={current.store_email} onChange={(e) => set('store_email', e.target.value)} /></div></label>
        <label className="auth__field"><span>Contact phone</span><div className="auth__input-wrap"><input type="tel" value={current.store_phone} onChange={(e) => set('store_phone', e.target.value)} /></div></label>
      </div>
      <label className="auth__field"><span>Store address</span><div className="auth__input-wrap"><input type="text" value={current.store_address} onChange={(e) => set('store_address', e.target.value)} /></div></label>

      <div className="account__divider" />
      <h3>Delivery & payments</h3>
      <div className="field-row">
        <label className="auth__field"><span>Free delivery threshold (KSh)</span><div className="auth__input-wrap"><input type="number" value={current.free_delivery_threshold} onChange={(e) => set('free_delivery_threshold', Number(e.target.value))} /></div></label>
        <label className="auth__field"><span>Standard delivery fee (KSh)</span><div className="auth__input-wrap"><input type="number" value={current.delivery_fee} onChange={(e) => set('delivery_fee', Number(e.target.value))} /></div></label>
      </div>

      <div className="account__notif-list">
        <div className="account__notif-item"><div><strong>M-Pesa Express</strong><span>Accept M-Pesa STK push payments</span></div><button type="button" className={`toggle-switch ${current.enable_mpesa ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_mpesa', !current.enable_mpesa)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Card payments</strong><span>Accept Visa and Mastercard</span></div><button type="button" className={`toggle-switch ${current.enable_card ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_card', !current.enable_card)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Cash on delivery</strong><span>Allow customers to pay on arrival</span></div><button type="button" className={`toggle-switch ${current.enable_cod ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_cod', !current.enable_cod)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Guest checkout</strong><span>Allow orders without an account</span></div><button type="button" className={`toggle-switch ${current.enable_guest_checkout ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_guest_checkout', !current.enable_guest_checkout)}><span className="toggle-switch__knob" /></button></div>
      </div>

      <div className="account__divider" />
      <h3>Operations</h3>
      <div className="account__notif-list">
        <div className="account__notif-item"><div><strong>New order notifications</strong><span>Get alerted when orders come in</span></div><button type="button" className={`toggle-switch ${current.order_notifications ? 'toggle-switch--on' : ''}`} onClick={() => set('order_notifications', !current.order_notifications)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Low stock alerts</strong><span>Get notified when products run low</span></div><button type="button" className={`toggle-switch ${current.low_stock_alerts ? 'toggle-switch--on' : ''}`} onClick={() => set('low_stock_alerts', !current.low_stock_alerts)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Auto-confirm orders</strong><span>Automatically confirm new orders without review</span></div><button type="button" className={`toggle-switch ${current.auto_confirm_orders ? 'toggle-switch--on' : ''}`} onClick={() => set('auto_confirm_orders', !current.auto_confirm_orders)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Require prescription verification</strong><span>Pharmacist reviews Rx products before dispatch</span></div><button type="button" className={`toggle-switch ${current.require_prescription ? 'toggle-switch--on' : ''}`} onClick={() => set('require_prescription', !current.require_prescription)}><span className="toggle-switch__knob" /></button></div>
      </div>

      {saved && <div className="account__saved"><Check size={16} /> Settings saved successfully.</div>}
      <div className="admin__settings-actions">
        <button type="submit" className="btn btn--primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving…' : 'Save settings'}</button>
        <button type="button" className="btn btn--outline" onClick={exportData}><Download size={15} /> Export data</button>
      </div>
    </form>
  );
}
