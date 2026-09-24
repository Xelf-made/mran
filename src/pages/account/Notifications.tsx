import { useState } from 'react';
import { Bell } from 'lucide-react';

interface NotifPref {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms: boolean;
  restock: boolean;
  reviewRequests: boolean;
}

const items: { key: keyof NotifPref; label: string; desc: string }[] = [
  { key: 'orderUpdates', label: 'Order updates', desc: 'Get notified when your order status changes.' },
  { key: 'promotions', label: 'Promotions & offers', desc: 'Receive exclusive deals and discount codes.' },
  { key: 'newsletter', label: 'Health newsletter', desc: 'Weekly health tips and wellness articles.' },
  { key: 'sms', label: 'SMS notifications', desc: 'Get order updates via SMS (carrier charges may apply).' },
  { key: 'restock', label: 'Back in stock alerts', desc: 'Be notified when wishlist items are restocked.' },
  { key: 'reviewRequests', label: 'Review requests', desc: 'Get asked to review products after delivery.' },
];

export function Notifications() {
  const [prefs, setPrefs] = useState<NotifPref>({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    sms: false,
    restock: true,
    reviewRequests: true,
  });

  const toggle = (key: keyof NotifPref) => setPrefs({ ...prefs, [key]: !prefs[key] });

  return (
    <div>
      <h3>Notification preferences</h3>
      <div className="account__notif-list">
        {items.map((item) => (
          <div key={item.key} className="account__notif-item">
            <div><strong>{item.label}</strong><span>{item.desc}</span></div>
            <button type="button" className={`toggle-switch ${prefs[item.key] ? 'toggle-switch--on' : ''}`} onClick={() => toggle(item.key)} aria-label={item.label}><span className="toggle-switch__knob" /></button>
          </div>
        ))}
      </div>

      <div className="account__divider" />
      <h3>Recent notifications</h3>
      <div className="account__notif-list">
        <div className="account__notif-item">
          <div><strong>Order MP-1042 dispatched</strong><span>Your order is on the way to Kilimani.</span></div>
          <Bell size={18} style={{ color: '#94a884' }} />
        </div>
        <div className="account__notif-item">
          <div><strong>Welcome to Moran Pharmacy</strong><span>Thank you for joining. Use code WELCOME10 for 10% off your first order.</span></div>
          <Bell size={18} style={{ color: '#94a884' }} />
        </div>
      </div>
    </div>
  );
}
