import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Heart, MapPin, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useCustomerOrders, useAddresses, useWishlist } from '@/lib/queries';
import { demoOrders, demoAddresses, demoWishlist } from '@/data/demo';
import { price, STATUS_LABELS } from './shared';

export function Overview() {
  const { user, demoUser } = useAuth();
  const isDemo = Boolean(demoUser);
  const userId = user?.id ?? '';

  const { data: liveOrders } = useCustomerOrders(userId);
  const { data: liveAddresses } = useAddresses(userId);
  const { data: liveWishlist } = useWishlist(userId);

  const orders = isDemo ? demoOrders : (liveOrders ?? []);
  const addresses = isDemo ? demoAddresses : (liveAddresses ?? []);
  const wishlistCount = isDemo ? demoWishlist.length : (liveWishlist?.length ?? 0);

  const totalSpent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;

  const stats = [
    { label: 'Total orders', value: String(orders.length), icon: ShoppingBag, color: 'green' },
    { label: 'Active orders', value: String(activeOrders), icon: Package, color: 'orange' },
    { label: 'Total spent', value: price(totalSpent), icon: CreditCard, color: 'blue' },
    { label: 'Wishlist items', value: String(wishlistCount), icon: Heart, color: 'pink' },
  ];

  const recentOrder = orders[0];
  const defaultAddr = addresses.find((a) => ('is_default' in a ? a.is_default : ('isDefault' in a ? a.isDefault : false))) ?? addresses[0];

  return (
    <div>
      <div className="account__stats">
        {stats.map((stat) => (
          <div key={stat.label} className={`account__stat account__stat--${stat.color}`}>
            <span className="account__stat-icon"><stat.icon size={20} /></span>
            <div><strong>{stat.value}</strong><small>{stat.label}</small></div>
          </div>
        ))}
      </div>

      <div className="account__section">
        <h3>Recent order</h3>
        {recentOrder ? (
          <div className="account__recent-order">
            <div className="account__recent-info">
              <strong>{recentOrder.order_number}</strong>
              <span>{new Date(recentOrder.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <span className={`order-status order-status--${recentOrder.status}`}>{STATUS_LABELS[recentOrder.status] ?? recentOrder.status}</span>
            <strong className="account__recent-total">{price(recentOrder.total)}</strong>
          </div>
        ) : (
          <p style={{ color: '#94a884', fontSize: 14 }}>No orders yet.</p>
        )}
        <Link to="/track" className="text-link" style={{ marginTop: 12, display: 'inline-flex' }}>View all orders <ArrowRight size={15} /></Link>
      </div>

      <div className="account__section">
        <h3>Default delivery address</h3>
        {defaultAddr ? (
          <div className="account__addr-card">
            <MapPin size={18} />
            <div>
              <strong>{defaultAddr.label}</strong>
              <span>{defaultAddr.name}</span>
              <span>{defaultAddr.line1}, {defaultAddr.area}, {defaultAddr.city}</span>
              <span>{defaultAddr.phone}</span>
            </div>
          </div>
        ) : (
          <p style={{ color: '#94a884', fontSize: 14 }}>No saved addresses. Add one in the Addresses tab.</p>
        )}
      </div>

      <div className="account__section">
        <h3>Quick links</h3>
        <div className="account__quick-links">
          <Link to="/products" className="account__quick-link"><ShoppingBag size={18} /> Continue shopping</Link>
          <Link to="/track" className="account__quick-link"><Package size={18} /> Track an order</Link>
        </div>
      </div>
    </div>
  );
}
