import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, MapPin, Package, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useProfile, useUpdateProfile } from '@/lib/queries';
import { demoCustomerProfile } from '@/data/demo';

export function ProfileSettings() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: liveProfile, isLoading, error } = useProfile(userId);
  const updateMutation = useUpdateProfile(userId);

  const [form, setForm] = useState({ name: '', email: '', phone: '', area: '' });
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setForm({ name: demoCustomerProfile.name, email: demoCustomerProfile.email, phone: demoCustomerProfile.phone, area: demoCustomerProfile.area });
    } else if (liveProfile) {
      setForm({
        name: liveProfile.full_name ?? '',
        email: user?.email ?? '',
        phone: liveProfile.phone ?? '',
        area: liveProfile.area ?? '',
      });
    }
  }, [isDemo, liveProfile, user?.email]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { setSaved(true); setTimeout(() => setSaved(false), 3000); return; }
    try {
      await updateMutation.mutateAsync({ full_name: form.name, phone: form.phone, area: form.area });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* surfaced by mutation */ }
  };

  if (!isDemo && isLoading) return <div className="track-loading"><Package className="spin" size={36} /><p>Loading profile…</p></div>;
  if (!isDemo && error) return <div className="auth__error">Could not load your profile.</div>;

  return (
    <div>
      <h3>Profile settings</h3>
      <form className="account__settings-form" onSubmit={save}>
        <label className="auth__field"><span>Full name</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div></label>
        <label className="auth__field"><span>Email address</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="email" value={form.email} disabled onChange={(e) => setForm({ ...form, email: e.target.value })} /></div></label>
        <label className="auth__field"><span>Phone number</span><div className="auth__input-wrap"><UserIcon size={17} /><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></label>
        <label className="auth__field"><span>Area / neighbourhood</span><div className="auth__input-wrap"><MapPin size={17} /><input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div></label>
        <div className="account__divider" />
        <h4>Change password</h4>
        <label className="auth__field"><span>Current password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="••••••••" /><button type="button" className="auth__toggle" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <div className="field-row">
          <label className="auth__field"><span>New password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="At least 6 characters" /></div></label>
          <label className="auth__field"><span>Confirm new password</span><div className="auth__input-wrap"><input type={showPwd ? 'text' : 'password'} placeholder="Repeat password" /></div></label>
        </div>
        {updateMutation.isError && <div className="auth__error">Could not save profile.</div>}
        {saved && <div className="account__saved"><Check size={16} /> Profile updated successfully.</div>}
        <button type="submit" className="btn btn--primary" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
