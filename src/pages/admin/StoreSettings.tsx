import { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { StoreSettings as StoreSettingsType } from './types';

export function StoreSettings() {
  const [settings, setSettings] = useState<StoreSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
    if (fetchError) { setError('Could not load store settings.'); setLoading(false); return; }
    if (!data) { setError('Store settings not found.'); setLoading(false); return; }
    setSettings(data as StoreSettingsType);
    setLoading(false);
  };

  const set = (key: keyof StoreSettingsType, value: string | number | boolean) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    const { error: updErr } = await supabase.from('store_settings').update({
      ...settings,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    if (updErr) { setError('Could not save settings.'); setSaving(false); return; }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const exportData = async () => {
    const [{ data: prods }, { data: ords }, { data: profs }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('profiles').select('*'),
    ]);
    const blob = new Blob([JSON.stringify({ products: prods, orders: ords, profiles: profs, settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moran-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="track-loading"><Check className="spin" size={36} /><p>Loading settings…</p></div>;
  if (!settings) return <div className="auth__error">{error ?? 'Settings not available.'}</div>;

  return (
    <form className="account__settings-form" onSubmit={save}>
      {error && <div className="auth__error">{error}</div>}

      <h3>Store information</h3>
      <div className="field-row">
        <label className="auth__field"><span>Store name</span><div className="auth__input-wrap"><input type="text" value={settings.store_name} onChange={(e) => set('store_name', e.target.value)} /></div></label>
        <label className="auth__field"><span>PPB license</span><div className="auth__input-wrap"><input type="text" value={settings.ppb_license} onChange={(e) => set('ppb_license', e.target.value)} /></div></label>
      </div>
      <div className="field-row">
        <label className="auth__field"><span>Contact email</span><div className="auth__input-wrap"><input type="email" value={settings.store_email} onChange={(e) => set('store_email', e.target.value)} /></div></label>
        <label className="auth__field"><span>Contact phone</span><div className="auth__input-wrap"><input type="tel" value={settings.store_phone} onChange={(e) => set('store_phone', e.target.value)} /></div></label>
      </div>
      <label className="auth__field"><span>Store address</span><div className="auth__input-wrap"><input type="text" value={settings.store_address} onChange={(e) => set('store_address', e.target.value)} /></div></label>

      <div className="account__divider" />
      <h3>Delivery & payments</h3>
      <div className="field-row">
        <label className="auth__field"><span>Free delivery threshold (KSh)</span><div className="auth__input-wrap"><input type="number" value={settings.free_delivery_threshold} onChange={(e) => set('free_delivery_threshold', Number(e.target.value))} /></div></label>
        <label className="auth__field"><span>Standard delivery fee (KSh)</span><div className="auth__input-wrap"><input type="number" value={settings.delivery_fee} onChange={(e) => set('delivery_fee', Number(e.target.value))} /></div></label>
      </div>

      <div className="account__notif-list">
        <div className="account__notif-item"><div><strong>M-Pesa Express</strong><span>Accept M-Pesa STK push payments</span></div><button type="button" className={`toggle-switch ${settings.enable_mpesa ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_mpesa', !settings.enable_mpesa)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Card payments</strong><span>Accept Visa and Mastercard</span></div><button type="button" className={`toggle-switch ${settings.enable_card ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_card', !settings.enable_card)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Cash on delivery</strong><span>Allow customers to pay on arrival</span></div><button type="button" className={`toggle-switch ${settings.enable_cod ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_cod', !settings.enable_cod)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Guest checkout</strong><span>Allow orders without an account</span></div><button type="button" className={`toggle-switch ${settings.enable_guest_checkout ? 'toggle-switch--on' : ''}`} onClick={() => set('enable_guest_checkout', !settings.enable_guest_checkout)}><span className="toggle-switch__knob" /></button></div>
      </div>

      <div className="account__divider" />
      <h3>Operations</h3>
      <div className="account__notif-list">
        <div className="account__notif-item"><div><strong>New order notifications</strong><span>Get alerted when orders come in</span></div><button type="button" className={`toggle-switch ${settings.order_notifications ? 'toggle-switch--on' : ''}`} onClick={() => set('order_notifications', !settings.order_notifications)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Low stock alerts</strong><span>Get notified when products run low</span></div><button type="button" className={`toggle-switch ${settings.low_stock_alerts ? 'toggle-switch--on' : ''}`} onClick={() => set('low_stock_alerts', !settings.low_stock_alerts)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Auto-confirm orders</strong><span>Automatically confirm new orders without review</span></div><button type="button" className={`toggle-switch ${settings.auto_confirm_orders ? 'toggle-switch--on' : ''}`} onClick={() => set('auto_confirm_orders', !settings.auto_confirm_orders)}><span className="toggle-switch__knob" /></button></div>
        <div className="account__notif-item"><div><strong>Require prescription verification</strong><span>Pharmacist reviews Rx products before dispatch</span></div><button type="button" className={`toggle-switch ${settings.require_prescription ? 'toggle-switch--on' : ''}`} onClick={() => set('require_prescription', !settings.require_prescription)}><span className="toggle-switch__knob" /></button></div>
      </div>

      {saved && <div className="account__saved"><Check size={16} /> Settings saved successfully.</div>}
      <div className="admin__settings-actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
        <button type="button" className="btn btn--outline" onClick={exportData}><Download size={15} /> Export data</button>
      </div>
    </form>
  );
}
